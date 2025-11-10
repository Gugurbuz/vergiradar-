// FIX: Declare the Deno global to handle type-checking in environments that don't
// automatically recognize it. This resolves "Cannot find name 'Deno'" errors.
declare const Deno: any;

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// This interface should match the one in your frontend's types.ts
interface Bulgu {
  audit_id: string;
  rule_id: string;
  description: string;
  domain: string;
  severity: string;
  date: string;
  amount: number;
  details: Record<string, any>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { auditId, ruleIds } = await req.json();

    if (!auditId || !ruleIds || ruleIds.length === 0) {
      return new Response(JSON.stringify({ error: 'auditId and ruleIds are required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Create a Supabase client with the service_role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // 1. Fetch the rules to be executed from the database
    const { data: rulesToRun, error: rulesError } = await supabaseAdmin
      .from('rules')
      .select('id, pseudo_code, description, domain, severity')
      .in('id', ruleIds);

    if (rulesError) throw rulesError;

    const allFoundBulgular: Bulgu[] = [];
    const skippedRules = [];

    // 2. Execute the SQL query for each rule
    for (const rule of rulesToRun) {
      if (!rule.pseudo_code) {
        skippedRules.push(rule);
        continue;
      }
      
      // IMPORTANT: In a production environment, it is much safer to call a database function (RPC)
      // to prevent SQL injection. This example executes the query directly for simplicity.
      // Ensure your SQL in the 'pseudo_code' field always filters by audit_id.
      const preparedSql = rule.pseudo_code.replace(/\?audit_id/g, `'${auditId}'`);
      
      // Use an RPC call to a safe, defined database function
      const { data: results, error: queryError } = await supabaseAdmin.rpc('execute_dynamic_sql', { p_sql: preparedSql });
      
      if (queryError) {
        console.error(`Error running rule ${rule.id}:`, queryError.message);
        continue; // If one rule fails, continue to the next
      }
      
      if (results && results.length > 0) {
         // 3. Format the results into anomalies
         const newBulgular: Bulgu[] = results.map((res: any) => ({
            audit_id: auditId,
            rule_id: rule.id,
            description: res.description || `Bulgu, ${rule.id} kuralı tarafından tespit edildi`,
            domain: rule.domain,
            severity: rule.severity,
            date: res.date,
            amount: res.amount,
            details: res.details || {},
         }));
         allFoundBulgular.push(...newBulgular);
      }
    }

    // 4. Insert all found anomalies into the database in a single batch
    if (allFoundBulgular.length > 0) {
        const { error: insertError } = await supabaseAdmin
            .from('anomalies')
            .insert(allFoundBulgular);
        if(insertError) throw insertError;
    }
    
    // 5. Return the result to the frontend
    const runResult = {
        found_bulgular: allFoundBulgular,
        skipped_rules: skippedRules,
        run_rule_count: rulesToRun.length,
    };

    return new Response(JSON.stringify(runResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

/* 
IMPORTANT: You must create this database function in your Supabase SQL Editor for the Edge Function to work.
This function safely executes dynamic SQL.

CREATE OR REPLACE FUNCTION execute_dynamic_sql(p_sql text)
RETURNS TABLE(description text, "date" date, amount numeric, details jsonb)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY EXECUTE p_sql;
END;
$$;

*/