// This file is deprecated. All data is now fetched from the backend API.
// All exports are now empty arrays or objects to prevent crashes.

// FIX: Replaced 'Anomaly' with 'Bulgu' as 'Anomaly' is no longer an exported member of '../types'.
import { Bulgu, Case, Rule, AuditedCompany, Audit, AuditDataRecord } from '../types';

export const mockCompanies: AuditedCompany[] = [];
export const mockAudits: Audit[] = [];
export const mockAuditDataRecords: AuditDataRecord[] = [];
// FIX: Updated the type of mockAnomalies to use Bulgu instead of the undefined Anomaly type.
export const mockAnomalies: Bulgu[] = [];
export const mockCases: Case[] = [];
export const mockRules: Rule[] = [];
export const dashboardStats = {
    totalAudits: 0,
    activeAudits: 0,
    totalAnomalies: 0,
    openCases: 0,
};
export const riskyVendors: { name: string; riskScore: number }[] = [];