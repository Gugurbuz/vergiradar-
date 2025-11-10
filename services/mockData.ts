// FIX: Added missing import for AuditDataStatus to resolve reference errors.
import { Anomaly, Case, Rule, AnomalySeverity, CaseStatus, AnomalyDomain, ParameterType, Audit, AuditedCompany, AuditStatus, AuditDataRecord, AuditDataStatus } from '../types';

export const mockCompanies: AuditedCompany[] = [
    { id: 'COMP-001', name: 'Güneş Enerji Sistemleri A.Ş.', vkn: '4110050101' }
];

export const mockAudits: Audit[] = [
    {
        id: 'AUD-001',
        companyId: 'COMP-001',
        title: '2023 Yılı Tam Tasdik Denetimi',
        startDate: '2024-01-02',
        endDate: '2024-12-31',
        status: AuditStatus.Active,
    }
];

export const mockAuditDataRecords: AuditDataRecord[] = [
    { id: 'DATA-01', name: 'Fatura Listesi (GİB)', description: 'e-Fatura, e-Arşiv, e-İrsaliye XML/JSON formatında.', status: AuditDataStatus.Waiting },
    { id: 'DATA-02', name: 'Yevmiye Defteri', description: 'Muhasebe fişlerini içeren yevmiye kayıtları.', status: AuditDataStatus.Waiting },
    { id: 'DATA-03', name: 'Defter-i Kebir', description: 'Büyük defter hesap hareketleri.', status: AuditDataStatus.Waiting },
    { id: 'DATA-04', name: 'Banka Ekstreleri', description: 'Tüm banka hesap hareketlerini içeren ekstreler.', status: AuditDataStatus.Waiting },
    { id: 'DATA-05', name: 'Bordro Kayıtları (MUHSGK)', description: 'Personel maaş ve SGK bilgilerini içeren kayıtlar.', status: AuditDataStatus.Waiting },
    { id: 'DATA-06', name: 'Stok Hareket Kayıtları', description: 'Mal giriş/çıkış ve envanter verileri.', status: AuditDataStatus.Waiting },
    { id: 'DATA-07', name: 'e-İrsaliye Listesi', description: 'Elektronik irsaliye kayıtları.', status: AuditDataStatus.Waiting },
    { id: 'DATA-08', name: 'POS Mutabakat Kayıtları', description: 'POS cihazı işlem ve mutabakat verileri.', status: AuditDataStatus.Waiting },
    { id: 'DATA-09', name: 'KDV1 Beyannamesi', description: 'Aylık Katma Değer Vergisi beyannameleri.', status: AuditDataStatus.Waiting },
    { id: 'DATA-10', name: 'BA/BS Formları', description: 'Mal ve hizmet alım/satımlarına ilişkin bildirim formları.', status: AuditDataStatus.Waiting },
    { id: 'DATA-11', name: 'Cari Kart Bilgileri', description: 'Müşteri ve tedarikçi ana verileri (VKN, adres vb.).', status: AuditDataStatus.Waiting },
];

export const mockAnomalies: Anomaly[] = [
    {
        id: 'ANOM-001',
        ruleId: 'R03',
        description: 'E-belge toplamları ile satır toplamları arasında 1,250.75 TL fark tespit edildi.',
        domain: AnomalyDomain.VAT,
        severity: AnomalySeverity.High,
        date: '2023-11-15',
        amount: 1250.75,
        details: { 'Fatura UUID': 'e2f1c3d4-a5b6-c7d8-e9f0-a1b2c3d4e5f6', 'Hesaplanan Toplam': '15,750.00 TL', 'Satır Toplamı': '14,499.25 TL' },
    },
    {
        id: 'ANOM-002',
        ruleId: 'R22',
        description: 'Ekim ayına ait bir belge, Eylül ayı yevmiye defterine kaydedilmiş (dönem dışı kayıt).',
        domain: AnomalyDomain.VAT,
        severity: AnomalySeverity.Medium,
        date: '2025-09-30',
        amount: 15200.00,
        details: { 'Belge Tarihi': '2025-10-01', 'Muhasebe Kayıt Tarihi': '2025-09-30', 'Fiş No': 'J0003' },
    },
     {
        id: 'ANOM-003',
        ruleId: 'R17',
        description: 'POS cihazından yapılan 25,430.00 TL tutarındaki satışların fatura kaydı bulunamadı.',
        domain: AnomalyDomain.Bank,
        severity: AnomalySeverity.High,
        date: '2023-10-22',
        amount: 25430.00,
        details: { 'POS Terminal ID': 'POS-T5', 'İşlem Referans No': 'TRN-987654321', 'Mutabakat Tarihi': '2023-10-23' },
    },
    {
        id: 'ANOM-004',
        ruleId: 'R24',
        description: 'Muhasebe kayıtlarındaki personel giderleri, Muhtasar-SGK beyanından %15 daha yüksek.',
        domain: AnomalyDomain.Payroll,
        severity: AnomalySeverity.High,
        date: '2023-09-30',
        amount: 152340.88,
        details: { 'Dönem': '2023-09', 'Muhasebe Gideri': '1,167,985.90 TL', 'Beyan Edilen Gider': '1,015,645.02 TL' },
    },
    {
        id: 'ANOM-005',
        ruleId: 'R01',
        description: 'Fatura serisinde (ABC) atlama tespit edildi. ABC00123 sonrası ABC00125 geliyor.',
        domain: AnomalyDomain.Invoice,
        severity: AnomalySeverity.Low,
        date: '2023-11-20',
        amount: 500.00,
        details: { 'Seri': 'ABC', 'Atlanan Numara': 'ABC00124' },
    },
    {
        id: 'ANOM-006',
        ruleId: 'R06',
        description: '%20 KDV oranlı bir ürün için %10 KDV hesaplanmış.',
        domain: AnomalyDomain.VAT,
        severity: AnomalySeverity.Medium,
        date: '2023-08-10',
        amount: 8000.00,
        details: { 'Fatura UUID': 'f1g2h3i4-j5k6-l7m8-n9o0-p1q2r3s4t5u6', 'Ürün Kodu': 'UK-987', 'Olması Gereken Oran': '%20', 'Uygulanan Oran': '%10' },
    }
];


export const mockCases: Case[] = [
    {
        id: 'CASE-001',
        title: 'ANOM-001: E-belge Toplam Uyumsuzluğu İncelemesi',
        status: CaseStatus.Open,
        assignee: 'Denetmen Yılmaz',
        severity: AnomalySeverity.High,
        createdAt: '2024-05-10',
        anomalyIds: ['ANOM-001'],
    },
    {
        id: 'CASE-002',
        title: 'ANOM-003: POS Satışları Fatura Kaydı Eksikliği',
        status: CaseStatus.InProgress,
        assignee: 'Uzman Denetçi Kaya',
        severity: AnomalySeverity.High,
        createdAt: '2024-05-12',
        anomalyIds: ['ANOM-003'],
    }
];

export const mockRules: Rule[] = [
  {
    id: 'R01',
    description: 'Fatura No Sırası',
    category: 'KDV/Beyan',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB)',
    logicText: 'Fatura numaralarında atlama/tekrar kontrolü',
    pseudoCode: `SELECT invoiceNumber, COUNT(*) c
FROM invoices
GROUP BY invoiceNumber
HAVING c > 1`,
  },
  {
    id: 'R02',
    description: 'Fatura–İrsaliye Tarih Farkı',
    category: 'KDV/Beyan',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB), e-İrsaliye Listesi',
    logicText: 'Fatura tarihi ile irsaliye tarihi arasındaki fark',
    pseudoCode: `SELECT i.invoiceNumber, i.issueDate, d.dispatchDate,
       TIMESTAMPDIFF(HOUR, d.dispatchDate, i.issueDate) AS diffH
FROM invoices i
JOIN dispatches d ON d.linkedInvoiceUUID = i.uuid
WHERE ABS(diffH) > \${max_hours}`,
    parameters: [
      { id: 'r02-max_hours', label: 'Maksimum Saat Farkı', type: ParameterType.Number, value: 72, unit: 'Saat' }
    ]
  },
  {
    id: 'R03',
    description: 'Fatura Toplam Doğrulama',
    category: 'KDV/Beyan',
    severity: AnomalySeverity.High,
    requiredData: 'Fatura Listesi (GİB)',
    logicText: 'Satır toplamı + KDV = fatura brüt toplam',
    pseudoCode: `SELECT invoiceNumber, ABS(lineTotal + taxTotal - grossTotal) AS diff
FROM invoices
WHERE ABS(lineTotal + taxTotal - grossTotal) > \${tolerance}`,
    parameters: [
        { id: 'r03-tolerance', label: 'Tolerans', type: ParameterType.Number, value: 0.01, unit: 'TL' }
    ]
  },
  {
    id: 'R04',
    description: 'Aynı Gün/Tutar/Taraf Kümesi',
    category: 'Muhasebe/Anomali',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB)',
    logicText: 'Kısa sürede aynı taraf ve benzer tutarlı çoklu işlem',
    pseudoCode: `WITH w AS (
  SELECT counterpartyTaxId, issueDate, grossTotal,
         LAG(issueDate) OVER (PARTITION BY counterpartyTaxId ORDER BY issueDate) AS prevTs,
         LAG(grossTotal) OVER (PARTITION BY counterpartyTaxId ORDER BY issueDate) AS prevAmt
  FROM invoices
)
SELECT *
FROM w
WHERE prevTs IS NOT NULL
  AND TIMESTAMPDIFF(HOUR, prevTs, issueDate) <= \${window_hours}
  AND ABS(grossTotal - prevAmt)/NULLIF(prevAmt,0) * 100 <= \${amount_delta_pct}`,
    parameters: [
        { id: 'r04-window_hours', label: 'Zaman Penceresi', type: ParameterType.Number, value: 2, unit: 'Saat' },
        { id: 'r04-amount_delta_pct', label: 'Tutar Farkı %', type: ParameterType.Number, value: 2, unit: '%' }
    ]
  },
  {
    id: 'R05',
    description: 'UUID Tekrarı',
    category: 'KDV/Beyan',
    severity: AnomalySeverity.High,
    requiredData: 'Fatura Listesi (GİB)',
    logicText: 'e-Fatura/e-Arşiv UUID benzersizliği',
    pseudoCode: `SELECT uuid, COUNT(*) c
FROM invoices
GROUP BY uuid
HAVING c > 1`
  },
  {
    id: 'R06',
    description: 'KDV Oran Kataloğu Uyumu',
    category: 'KDV/Beyan',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB)',
    logicText: 'Uygulanan KDV oranı katalogla uyumlu mu',
    pseudoCode: `SELECT i.invoiceNumber, i.kdvRate
FROM invoices i
LEFT JOIN kdv_catalog k ON k.itemCode = i.itemCode
WHERE k.expectedRate IS NOT NULL AND i.kdvRate <> k.expectedRate`
  },
  {
    id: 'R08',
    description: 'Devreden KDV Uyum',
    category: 'KDV/Beyan',
    severity: AnomalySeverity.High,
    requiredData: 'KDV1 Beyannamesi, Yevmiye Defteri',
    logicText: 'Beyanname devreden KDV ile yevmiye KDV hesapları uyumu',
    pseudoCode: `SELECT k.period, k.carryForwardVAT AS beyan, j.kdv_net AS muhasebe
FROM kdvr k
JOIN (
  SELECT period, SUM(CASE WHEN acc IN ('190','191') THEN debit ELSE -credit END) AS kdv_net
  FROM journal
  WHERE acc IN ('190', '191', '391')
  GROUP BY period
) j ON j.period = k.period
WHERE ABS(k.carryForwardVAT - j.kdv_net) > \${tolerance}`,
     parameters: [
        { id: 'r08-tolerance', label: 'Tolerans', type: ParameterType.Number, value: 1.0, unit: 'TL' }
    ]
  },
  {
    id: 'R09',
    description: 'Dönemsel KDV Toplamları',
    category: 'KDV/Beyan',
    severity: AnomalySeverity.High,
    requiredData: 'KDV1 Beyannamesi, Yevmiye Defteri',
    logicText: 'Beyan edilen KDV ile yevmiye toplamları',
    pseudoCode: `SELECT k.period, k.outputVAT, j.hesaplananKDV
FROM kdvr k
JOIN (
  SELECT period, SUM(credit) AS hesaplananKDV
  FROM journal
  WHERE accountMainID='391'
  GROUP BY period
) j ON j.period = k.period
WHERE ABS(k.outputVAT - j.hesaplananKDV) > \${tolerance}`,
    parameters: [
        { id: 'r09-tolerance', label: 'Tolerans', type: ParameterType.Number, value: 1.0, unit: 'TL' }
    ]
  },
  {
    id: 'R10',
    description: 'İptal/İade Oranı',
    category: 'Satış/İade',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB)',
    logicText: 'İptal/iade payı sektör benchmarkını aşıyor mu',
    pseudoCode: `WITH agg AS (
  SELECT period, SUM(CASE WHEN status IN ('cancel','return') THEN 1 ELSE 0 END) AS bad,
         COUNT(*) AS total
  FROM invoices
  GROUP BY period
)
SELECT *, (a.bad / NULLIF(a.total,0)) * 100 AS ratio
FROM agg a
WHERE ratio > (SELECT sector_ratio FROM benchmarks WHERE type='cancel')`,
  },
  {
    id: 'R11',
    description: 'Mesai Dışı Yoğunluk',
    category: 'Muhasebe/Anomali',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB), Yevmiye Defteri',
    logicText: 'Mesai dışı/tatil günü yığılma',
    pseudoCode: `SELECT period, hourBucket, cnt, z
FROM hourly_issue_distribution
WHERE (hourBucket BETWEEN '08:00' AND '19:00') OR isWeekend IN (6,7)
  AND z >= \${zscore}`,
    parameters: [
      { id: 'r11-zscore', label: 'Z-Skoru Eşiği', type: ParameterType.Number, value: 3.0 }
    ]
  },
  {
    id: 'R12',
    description: 'Yeni Tedarikçi Hacmi',
    category: 'Karşı Taraf',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB), Cari Kart Bilgileri',
    logicText: 'Yeni açılan tedarikçide kısa sürede olağanüstü hacim',
    pseudoCode: `SELECT supplierTaxId, firstInvoiceDate, sum30, next30
FROM supplier_windows
WHERE daysSinceOnboard <= \${new_supplier_days} AND (sum30/NULLIF(next30,0)) >= \${spike_ratio}`,
    parameters: [
      { id: 'r12-days', label: 'Değerlendirme Süresi', type: ParameterType.Number, value: 30, unit: 'Gün' },
      { id: 'r12-ratio', label: 'Hacim Artış Oranı', type: ParameterType.Number, value: 3.0 }
    ]
  },
  {
    id: 'R13',
    description: 'Ortak IBAN/İletişim',
    category: 'Karşı Taraf',
    severity: AnomalySeverity.High,
    requiredData: 'Cari Kart Bilgileri',
    logicText: 'Farklı firmalar aynı IBAN/e-posta/telefonu paylaşıyor',
    pseudoCode: `SELECT contactKey, COUNT(DISTINCT taxId) AS firmCount
FROM master_party_exploded_contacts
GROUP BY contactKey
HAVING COUNT(DISTINCT taxId) >= \${min_firms}`,
    parameters: [
      { id: 'r13-min_firms', label: 'Minimum Firma Sayısı', type: ParameterType.Number, value: 2 }
    ]
  },
  {
    id: 'R14',
    description: 'Zincir Ticaret Deseni',
    category: 'Karşı Taraf',
    severity: AnomalySeverity.High,
    requiredData: 'Fatura Listesi (GİB)',
    logicText: 'A→B→C yönlü akış (kısa sürede benzer tutarlar)',
    pseudoCode: `MATCH (A)-[s1:SELLS]->(B)-[s2:SELLS]->(C)
WHERE HOURS_BETWEEN(s1.issueDate,s2.issueDate) <= \${window_hours}
  AND ABS(s1.amount - s2.amount)/s1.amount*100 <= \${amount_delta_pct}`,
  },
  {
    id: 'R15',
    description: 'Back-to-back İade',
    category: 'Satış/İade',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB)',
    logicText: 'Satıştan kısa süre sonra iade',
    pseudoCode: `SELECT s.invoiceNumber AS saleInv, r.invoiceNumber AS returnInv
FROM invoices s
JOIN invoices r ON r.relatedInvoiceUUID = s.uuid AND r.status='return'
WHERE HOURS_BETWEEN(s.issueDate, r.issueDate) <= \${hours}`,
    parameters: [
      { id: 'r15-hours', label: 'Maksimum Süre', type: ParameterType.Number, value: 24, unit: 'Saat' }
    ]
  },
  {
    id: 'R16',
    description: 'Negatif Stok',
    category: 'Stok',
    severity: AnomalySeverity.High,
    requiredData: 'Stok Hareket Kayıtları',
    logicText: 'Hareket sonrası stok miktarı < 0',
    pseudoCode: `SELECT itemCode, postingDate, qtyAfter
FROM stock_balances
WHERE qtyAfter < 0`,
  },
  {
    id: 'R17',
    description: 'POS/Banka–Fatura Eşleşmesi',
    category: 'Finans/Eşleşme',
    severity: AnomalySeverity.Medium,
    requiredData: 'POS Mutabakat Kayıtları, Banka Ekstreleri, Fatura Listesi (GİB)',
    logicText: 'POS/banka hareketleri ile fatura/yevmiye eşleşme oranı',
    pseudoCode: `SELECT period, (matchedCnt/NULLIF(totalCnt,0))*100 AS matchRatio
FROM reconciliation_summary
WHERE matchRatio < \${min_match_ratio_pct}`,
    parameters: [
      { id: 'r17-min_match', label: 'Minimum Eşleşme %', type: ParameterType.Number, value: 90, unit: '%' }
    ]
  },
  {
    id: 'R18',
    description: 'Nakit Tahsilat Oranı',
    category: 'Finans',
    severity: AnomalySeverity.Medium,
    requiredData: 'Yevmiye Defteri',
    logicText: 'Nakit (kasa) tahsilat oranı sektör benchmarkını aşıyor',
    pseudoCode: `SELECT period, (cashCol/NULLIF(totalCol,0))*100 AS cashRatio
FROM period_collections
WHERE cash_account = '100' AND cashRatio > \${sector_benchmark}`,
  },
  {
    id: 'R19',
    description: 'Karşı Taraf Kayıt Doğrulama',
    category: 'Karşı Taraf',
    severity: AnomalySeverity.High,
    requiredData: 'Fatura Listesi (GİB), Cari Kart Bilgileri',
    logicText: 'Kamu kayıtlarında iz bulunmayan karşı taraf',
    pseudoCode: `SELECT i.counterpartyTaxId
FROM invoices i
LEFT JOIN master_party m ON m.taxId = i.counterpartyTaxId
WHERE m.taxId IS NULL`,
  },
  {
    id: 'R20',
    description: 'NACE/GTİP Uyumu',
    category: 'Vergi Türü',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB), Cari Kart Bilgileri',
    logicText: 'Mal/hizmet kodu faaliyet alanı dışında',
    pseudoCode: `SELECT invoiceNumber, itemCode, firmNace
FROM invoice_items
WHERE NOT nace_allows(firmNace, itemCode)`,
  },
  {
    id: 'R21',
    description: 'Dövizli Fatura Kuru',
    category: 'KDV/Beyan',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB)',
    logicText: 'Döviz kuru ve KDV matrahı tutarlılığı',
    pseudoCode: `SELECT invoiceNumber, fxRate_used, fxRate_official
FROM invoices_fx
WHERE ABS(fxRate_used - fxRate_official)/fxRate_official*100 > \${tolerance_pct}`,
    parameters: [
      { id: 'r21-tolerance', label: 'Kur Tolerans %', type: ParameterType.Number, value: 1.0, unit: '%' }
    ]
  },
  {
    id: 'R22',
    description: 'Dönem Dışı Kayıt (Dönemsellik)',
    category: 'Muhasebe/Dönemsellik',
    severity: AnomalySeverity.High,
    requiredData: 'Fatura Listesi (GİB), Yevmiye Defteri',
    logicText: 'Belge tarihi ile yevmiye dönemi farklı',
    pseudoCode: `SELECT i.invoiceNumber, i.issueDate, j.postingDate
FROM invoices i
JOIN journal j ON j.sourceDocumentID = i.invoiceNumber
WHERE MONTH(i.issueDate) <> MONTH(j.postingDate) OR YEAR(i.issueDate) <> YEAR(j.postingDate)`,
  },
  {
    id: 'R23',
    description: 'Lojistik Kaydı Eksik',
    category: 'Lojistik',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB), e-İrsaliye Listesi',
    logicText: 'Mal satışında irsaliye/lojistik kanıtı yok',
    pseudoCode: `SELECT i.invoiceNumber
FROM invoices i
LEFT JOIN dispatches d ON d.linkedInvoiceUUID = i.uuid
WHERE i.hasGoods = true AND d.dispatchNumber IS NULL`,
  },
  {
    id: 'R24',
    description: 'Personel Giderleri – MUHSGK Uyum',
    category: 'Personel/SGK',
    severity: AnomalySeverity.Medium,
    requiredData: 'Bordro Kayıtları (MUHSGK), Yevmiye Defteri',
    logicText: 'MUHSGK ve yevmiye personel gider kalemlerinin uyumu',
    pseudoCode: `SELECT p.period, p.payrollTotal, j.glTotal
FROM payroll_summary p
JOIN (
  SELECT period, SUM(amount) AS glTotal
  FROM journal
  WHERE accountMainID IN ('770','720','730')
  GROUP BY period
) j USING (period)
WHERE ABS(p.payrollTotal - j.glTotal) > \${tolerance}`,
    parameters: [
      { id: 'r24-tolerance', label: 'Tolerans', type: ParameterType.Number, value: 1.0, unit: 'TL' }
    ]
  },
  {
    id: 'R25',
    description: 'Stok Marjı',
    category: 'Stok/Kârlılık',
    severity: AnomalySeverity.Medium,
    requiredData: 'Stok Hareket Kayıtları, Fatura Listesi (GİB)',
    logicText: 'Satış marjı olağandışı düşük',
    pseudoCode: `SELECT s.saleInvoice, (s.saleAmount - s.cogs)/s.saleAmount*100 AS marginPct
FROM sales_cogs s
WHERE marginPct < \${min_margin_pct}`,
    parameters: [
      { id: 'r25-min_margin', label: 'Minimum Marj %', type: ParameterType.Number, value: 1.0, unit: '%' }
    ]
  },
  {
    id: 'R26',
    description: 'İptal–Yeniden Kesim Deseni',
    category: 'Satış/İade',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB)',
    logicText: 'Kısa sürede iptal edilip yeniden kesilen belgeler',
    pseudoCode: `SELECT c.invoiceNumber AS canceled, r.invoiceNumber AS reissued
FROM invoices c
JOIN invoices r ON r.originalInvoiceUUID = c.uuid AND c.status='cancel'
WHERE HOURS_BETWEEN(c.issueDate, r.issueDate) <= \${hours}`,
  },
  {
    id: 'R27',
    description: 'Kanal Bazlı No Tekrarı',
    category: 'KDV/Beyan',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB)',
    logicText: 'Kanal (online/şube/saha) bazında belge numarası tekrarları',
    pseudoCode: `SELECT channel, invoiceNumber, COUNT(*) c
FROM invoices
GROUP BY channel, invoiceNumber
HAVING c > 1`,
  },
  {
    id: 'R28',
    description: 'GTİP/ÖTV Hesabı',
    category: 'Vergi Türü',
    severity: AnomalySeverity.High,
    requiredData: 'Fatura Listesi (GİB)',
    logicText: 'ÖTV/ÖİV/GTİP’li kalemlerde vergi eksik/hatalı',
    pseudoCode: `SELECT invoiceNumber, itemCode
FROM invoice_items
WHERE requiresSpecialTax(itemCode)=true AND specialTaxAmount <= 0`,
  },
  {
    id: 'R29',
    description: 'Coğrafi Akış Anomalisi',
    category: 'Lojistik',
    severity: AnomalySeverity.Medium,
    requiredData: 'Fatura Listesi (GİB), e-İrsaliye Listesi',
    logicText: 'Kısa sürede uzak lokasyonlar arasında olağandışı akış',
    pseudoCode: `SELECT i1.invoiceNumber, i2.invoiceNumber, km_distance(i1.loc,i2.loc) AS km
FROM invoices i1 JOIN invoices i2 ON i1.counterpartyTaxId=i2.counterpartyTaxId
WHERE km > \${km_threshold} AND hrs < \${hour_threshold}`,
  },
  {
    id: 'R30',
    description: 'Karşılıklı Faturalar',
    category: 'Satış/İade',
    severity: AnomalySeverity.High,
    requiredData: 'Fatura Listesi (GİB)',
    logicText: 'Taraflar arası iki yönlü benzer tutarlar',
    pseudoCode: `SELECT a.invoiceNumber aInv, b.invoiceNumber bInv
FROM invoices a
JOIN invoices b ON a.counterpartyTaxId = b.sellerTaxId AND b.counterpartyTaxId = a.sellerTaxId
WHERE DATEDIFF(b.issueDate, a.issueDate) BETWEEN 0 AND \${window_days}`,
    parameters: [
      { id: 'r30-window_days', label: 'Zaman Aralığı', type: ParameterType.Number, value: 7, unit: 'Gün' }
    ]
  },
  {
    id: 'R31',
    description: 'Borç/Alacak Dengesi',
    category: 'Muhasebe/Bütünlük',
    severity: AnomalySeverity.High,
    requiredData: 'Yevmiye Defteri',
    logicText: 'Her yevmiye fişinde D = C',
    pseudoCode: `SELECT entryNumber, ABS(SUM(debit) - SUM(credit)) AS diff
FROM journal
GROUP BY entryNumber
HAVING diff > \${tolerance}`,
  },
  {
    id: 'R32',
    description: 'Para Birimi Tutarlılığı',
    category: 'Muhasebe/Bütünlük',
    severity: AnomalySeverity.Medium,
    requiredData: 'Yevmiye Defteri',
    logicText: 'Aynı fişte karışık para birimi',
    pseudoCode: `SELECT entryNumber, COUNT(DISTINCT unit) u
FROM journal
GROUP BY entryNumber
HAVING u > 1`,
  },
];


export const dashboardStats = {
    totalAudits: 1,
    activeAudits: 1,
    totalAnomalies: 6,
    openCases: 2,
};

export const riskyVendors: { name: string; riskScore: number }[] = [
    { name: 'Hızlı Tedarik Lojistik', riskScore: 92 },
    { name: 'Tekno Market Bilişim', riskScore: 81 },
    { name: 'Global Hammadde A.Ş.', riskScore: 75 },
    { name: 'Doğu Yakası Gıda', riskScore: 68 },
    { name: 'Anadolu İnşaat Malzemeleri', riskScore: 55 },
];