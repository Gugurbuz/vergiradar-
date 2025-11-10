import { supabase } from './supabase';
import { Audit, AuditedCompany, Rule, Case, Bulgu, AuditDataRecord, RunResult } from '../types';
import { GoogleGenAI } from '@google/genai';

// Helper function to handle Supabase results and errors consistently.
const handleSupabaseError = <T>({ error, data }: { error: any, data: T }, context: string): T => {
    if (error) {
        console.error(`Supabase error in ${context}:`, error);
        throw new Error(error.message || `Failed to execute ${context}`);
    }
    return data;
};

export const getDashboardStats = async (): Promise<{ openCases: number }> => {
    // For performance, this would ideally be a single RPC call in a production app.
    // We simulate it here by fetching the count of open cases.
    const { count, error } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Açık');
    
    if (error) {
        console.error("Error fetching dashboard stats:", error);
        throw new Error(error.message);
    }

    return { openCases: count ?? 0 };
};

export const getBulgular = async (): Promise<Bulgu[]> => {
    const result = await supabase.from('anomalies').select('*');
    return handleSupabaseError(result, 'getBulgular');
};

export const getCases = async (): Promise<Case[]> => {
    const result = await supabase.from('cases').select('*').order('created_at', { ascending: false });
    return handleSupabaseError(result, 'getCases');
};

export const getRules = async (): Promise<Rule[]> => {
    // Fetch rules and their related parameters in a single query.
    const result = await supabase.from('rules').select('*, parameters:rule_parameters(*)');
    return handleSupabaseError(result, 'getRules');
};

export const updateRule = async (rule: Rule): Promise<Rule> => {
    // Separate the rule data from its parameters for individual updates.
    const { parameters, ...ruleData } = rule;
    
    // 1. Update the core rule data.
    const ruleResult = await supabase
        .from('rules')
        .update(ruleData)
        .eq('id', rule.id)
        .select()
        .single();
    handleSupabaseError(ruleResult, 'updateRule');
    
    // 2. Upsert (update or insert) the associated parameters.
    if (parameters && parameters.length > 0) {
        const paramUpsertResult = await supabase.from('rule_parameters').upsert(parameters);
        handleSupabaseError(paramUpsertResult, 'updateRuleParameters');
    }
    
    // 3. Return the fully updated rule with its parameters.
    const finalResult = await supabase.from('rules').select('*, parameters:rule_parameters(*)').eq('id', rule.id).single();
    return handleSupabaseError(finalResult, 'getUpdatedRule');
};

export const getAudits = async (): Promise<Audit[]> => {
    const result = await supabase.from('audits').select('*').order('start_date', { ascending: false });
    return handleSupabaseError(result, 'getAudits');
};

export const createAudit = async (auditData: Omit<Audit, 'id'>): Promise<Audit> => {
    const result = await supabase.from('audits').insert(auditData).select().single();
    return handleSupabaseError(result, 'createAudit');
};

export const getCompanies = async (): Promise<AuditedCompany[]> => {
    const result = await supabase.from('companies').select('*');
    return handleSupabaseError(result, 'getCompanies');
};

export const createCompany = async (companyData: Omit<AuditedCompany, 'id'>): Promise<AuditedCompany> => {
    const result = await supabase.from('companies').insert(companyData).select().single();
    return handleSupabaseError(result, 'createCompany');
};

export const getAuditDataRecords = async (auditId: string): Promise<AuditDataRecord[]> => {
    const result = await supabase.from('audit_data_records_status').select('*').eq('audit_id', auditId);
    return handleSupabaseError(result, 'getAuditDataRecords');
};

export const runAuditTests = async (auditId: string, ruleIds: string[]): Promise<RunResult> => {
    const { data, error } = await supabase.functions.invoke('run-audit-tests', {
        body: { auditId, ruleIds },
    });

    if (error) {
        console.error('Edge function invocation error:', error);
        throw new Error(`Test çalıştırma başarısız: ${error.message}`);
    }
    
    // The edge function is expected to return data matching the RunResult interface.
    return data;
};

// --- New Gemini API Integration ---

// Initialize the Google AI client. Assumes API_KEY is available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getBulguAnalysis = async (bulgu: Bulgu): Promise<string> => {
    const prompt = `
        You are an expert financial auditor assistant. Analyze the following tax finding and provide a structured report.

        Bulgu Detayları:
        - Description: ${bulgu.description}
        - Domain: ${bulgu.domain}
        - Severity: ${bulgu.severity}
        - Date: ${bulgu.date}
        - Amount: ${Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(bulgu.amount)}
        - Associated Data: ${JSON.stringify(bulgu.details, null, 2)}

        Your report must be in Turkish and have the following sections, formatted in Markdown:

        ### Açıklama
        Explain what this finding means in simple, practical terms for a tax inspector.

        ### Olası Nedenler
        List potential root causes for this finding, ranging from simple errors to fraudulent activity. Use a numbered list.

        ### Önerilen Adımlar
        Provide a list of concrete, actionable next steps for the auditor to investigate this finding further. Use a numbered list.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Failed to get analysis from AI service.");
    }
};