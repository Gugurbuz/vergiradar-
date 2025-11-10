export enum BulguSeverity {
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

export enum BulguDomain {
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
    Uploading = 'Yükleniyor',
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
    company_id: string;
    title: string;
    start_date: string;
    end_date: string;
    status: AuditStatus;
}

export interface AuditDataRecord {
    id: string;
    name: string;
    description: string;
    status: AuditDataStatus;
    error_message?: string;
}

export interface RuleParameter {
  id: string;
  label: string;
  type: ParameterType;
  value: string | number;
  options?: string[];
  unit?: string;
}

export interface Bulgu {
  id: string;
  rule_id: string; // Hangi kuralın bu bulguyu bulduğunu belirtir
  description: string;
  domain: BulguDomain;
  severity: BulguSeverity;
  date: string;
  amount: number;
  details: Record<string, string>;
  case_id?: string;
}

export interface Case {
  id: string;
  title: string;
  status: CaseStatus;
  assignee: string;
  severity: BulguSeverity;
  created_at: string;
  bulgu_ids: string[];
}

export interface Rule {
  id: string;
  description: string;
  category: string;
  severity: BulguSeverity;
  required_data: string; // Artık doğrudan AuditDataRecord.name ile eşleşecek
  logic_text: string;
  pseudo_code: string;
  notes?: string;
  parameters?: RuleParameter[];
}

export interface RunResult {
    found_bulgular: Bulgu[];
    skipped_rules: Rule[];
    run_rule_count: number;
}