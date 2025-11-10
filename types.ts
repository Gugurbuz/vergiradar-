export enum AnomalySeverity {
  High = 'Yüksek',
  Medium = 'Orta',
  Low = 'Düşük',
}

export enum CaseStatus {
  Open = 'Açık',
  InProgress = 'İncelemede',
  PendingEvidence = 'Ek Kanıt Bekliyor',
  Closed = 'Kapatıldı',
}

export enum AnomalyDomain {
  VAT = 'KDV',
  Invoice = 'Fatura',
  Payroll = 'Bordro',
  Bank = 'Banka',
}

export enum ParameterType {
  Number = 'number',
  Text = 'text',
  Date = 'date',
  Select = 'select',
}

export enum AuditStatus {
    Active = 'Aktif',
    Completed = 'Tamamlandı',
    Planned = 'Planlandı',
}

export enum AuditDataStatus {
    Waiting = 'Bekleniyor',
    Uploaded = 'Yüklendi',
    Validated = 'Doğrulandı',
    Error = 'Hatalı',
}

export interface AuditedCompany {
    id: string;
    name: string;
    vkn: string;
}

export interface Audit {
    id: string;
    companyId: string;
    title: string;
    startDate: string;
    endDate: string;
    status: AuditStatus;
}

export interface AuditDataRecord {
    id: string;
    name: string;
    description: string;
    status: AuditDataStatus;
    errorMessage?: string;
}

export interface RuleParameter {
  id: string;
  label: string;
  type: ParameterType;
  value: string | number;
  options?: string[];
  unit?: string;
}

export interface Anomaly {
  id: string;
  ruleId: string; // Hangi kuralın bu anomaliyi bulduğunu belirtir
  description: string;
  domain: AnomalyDomain;
  severity: AnomalySeverity;
  date: string;
  amount: number;
  details: Record<string, string>;
  caseId?: string;
}

export interface Case {
  id: string;
  title: string;
  status: CaseStatus;
  assignee: string;
  severity: AnomalySeverity;
  createdAt: string;
  anomalyIds: string[];
}

export interface Rule {
  id: string;
  description: string;
  category: string;
  severity: AnomalySeverity;
  requiredData: string; // Artık doğrudan AuditDataRecord.name ile eşleşecek
  logicText: string;
  pseudoCode: string;
  notes?: string;
  parameters?: RuleParameter[];
}