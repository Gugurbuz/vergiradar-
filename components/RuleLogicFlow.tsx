import React from 'react';
import { Rule } from '../types';
import { DatabaseIcon, CogIcon, QuestionMarkCircleIcon, FlagIcon, ArrowRightIcon } from './icons';

const Node: React.FC<{ icon: React.ReactNode; label: string; color: string; }> = ({ icon, label, color }) => (
    <div className="flex flex-col items-center text-center mx-4 flex-shrink-0">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-300 max-w-xs">{label}</p>
    </div>
);

const Arrow = () => (
    <div className="flex items-center mx-2">
        <ArrowRightIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 flex-shrink-0" />
    </div>
);

const logicSteps: Record<string, { process: string; condition: string; }> = {
    'R01': { process: 'Fatura No Sırası', condition: 'Fatura numaralarında atlama/tekrar kontrolü' },
    'R02': { process: 'Fatura–İrsaliye Tarih Farkı', condition: 'Fatura tarihi ile irsaliye tarihi arasındaki fark' },
    'R03': { process: 'Fatura Toplam Doğrulama', condition: 'Satır toplamı + KDV = fatura brüt toplam' },
    'R04': { process: 'Aynı Gün/Tutar/Taraf Kümesi', condition: 'Kısa sürede aynı taraf ve benzer tutarlı çoklu işlem' },
    'R05': { process: 'UUID Tekrarı', condition: 'e-Fatura/e-Arşiv UUID benzersizliği' },
    'R06': { process: 'KDV Oran Kataloğu Uyumu', condition: 'Uygulanan KDV oranı katalogla uyumlu mu' },
    'R08': { process: 'Devreden KDV Uyum', condition: 'Beyanname devreden KDV ile yevmiye KDV hesapları uyumu' },
    'R09': { process: 'Dönemsel KDV Toplamları', condition: 'Beyan edilen KDV ile yevmiye toplamları' },
    'R10': { process: 'İptal/İade Oranı', condition: 'İptal/iade payı sektör benchmarkını aşıyor mu' },
    'R11': { process: 'Mesai Dışı Yoğunluk', condition: 'Mesai dışı/tatil günü yığılma' },
    'R12': { process: 'Yeni Tedarikçi Hacmi', condition: 'Yeni açılan tedarikçide kısa sürede olağanüstü hacim' },
    'R13': { process: 'Ortak IBAN/İletişim', condition: 'Farklı firmalar aynı IBAN/e-posta/telefonu paylaşıyor' },
    'R14': { process: 'Zincir Ticaret Deseni', condition: 'A→B→C yönlü akış (kısa sürede benzer tutarlar)' },
    'R15': { process: 'Back-to-back İade', condition: 'Satıştan kısa süre sonra iade' },
    'R16': { process: 'Negatif Stok', condition: 'Hareket sonrası stok miktarı < 0' },
    'R17': { process: 'POS/Banka–Fatura Eşleşmesi', condition: 'POS/banka hareketleri ile fatura/yevmiye eşleşme oranı' },
    'R18': { process: 'Nakit Tahsilat Oranı', condition: 'Nakit (kasa) tahsilat oranı sektör benchmarkını aşıyor' },
    'R19': { process: 'Karşı Taraf Kayıt Doğrulama', condition: 'Kamu kayıtlarında iz bulunmayan karşı taraf' },
    'R20': { process: 'NACE/GTİP Uyumu', condition: 'Mal/hizmet kodu faaliyet alanı dışında' },
    'R21': { process: 'Dövizli Fatura Kuru', condition: 'Döviz kuru ve KDV matrahı tutarlılığı' },
    'R22': { process: 'Dönem Dışı Kayıt (Dönemsellik)', condition: 'Belge tarihi ile yevmiye dönemi farklı' },
    'R23': { process: 'Lojistik Kaydı Eksik', condition: 'Mal satışında irsaliye/lojistik kanıtı yok' },
    'R24': { process: 'Personel Giderleri – MUHSGK Uyum', condition: 'MUHSGK ve yevmiye personel gider kalemlerinin uyumu' },
    'R25': { process: 'Stok Marjı', condition: 'Satış marjı olağandışı düşük' },
    'R26': { process: 'İptal–Yeniden Kesim Deseni', condition: 'Kısa sürede iptal edilip yeniden kesilen belgeler' },
    'R27': { process: 'Kanal Bazlı No Tekrarı', condition: 'Kanal bazında belge numarası tekrarları' },
    'R28': { process: 'GTİP/ÖTV Hesabı', condition: 'ÖTV/ÖİV/GTİP’li kalemlerde vergi eksik/hatalı' },
    'R29': { process: 'Coğrafi Akış Anomalisi', condition: 'Kısa sürede uzak lokasyonlar arasında olağandışı akış' },
    'R30': { process: 'Karşılıklı Faturalar', condition: 'Taraflar arası iki yönlü benzer tutarlar' },
    'R31': { process: 'Borç/Alacak Dengesi', condition: 'Her yevmiye fişinde D = C mi?' },
    'R32': { process: 'Para Birimi Tutarlılığı', condition: 'Aynı fişte karışık para birimi kullanımı var mı?' },
};

const RuleLogicFlow: React.FC<{ rule: Rule }> = ({ rule }) => {
    // FIX: Handle potentially empty/undefined requiredData by providing a fallback and filtering out empty strings.
    const inputs = (rule.requiredData ?? '')
      .split(',')
      .map(s => s.split('(')[0].trim())
      .filter(Boolean); // This ensures empty strings from ",," or trailing commas are removed.

    // FIX: Handle potentially undefined logicText to prevent runtime errors on slice.
    const currentLogic = logicSteps[rule.id] || {
        process: (rule.description ?? '').slice(0, 80) || 'Kural işleme',
        condition: rule.logicText || 'Anomali Tespiti',
    };

    return (
        <div className="mb-4">
            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">Görsel Mantık Akışı</h4>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg overflow-x-auto w-full">
                <div className="flex items-center justify-start min-w-max">
                    <div className="flex flex-col items-center">
                         <div className="flex">
                            {/* FIX: Use the input value for the key prop instead of index for better reconciliation. */}
                            {inputs.map((input) => (
                                <Node
                                    key={input}
                                    icon={<DatabaseIcon className="w-10 h-10 text-blue-800 dark:text-blue-200" />}
                                    label={input}
                                    color="bg-blue-200 dark:bg-blue-900/50"
                                />
                            ))}
                        </div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">GİRDİ</p>
                    </div>

                    <Arrow />

                    <div className="flex flex-col items-center">
                        <Node
                            icon={<CogIcon className="w-10 h-10 text-purple-800 dark:text-purple-200" />}
                            label={currentLogic.process}
                            color="bg-purple-200 dark:bg-purple-900/50"
                        />
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">İŞLEME</p>
                    </div>

                    <Arrow />

                    <div className="flex flex-col items-center">
                        <Node
                            icon={<QuestionMarkCircleIcon className="w-10 h-10 text-yellow-800 dark:text-yellow-200" />}
                            label={currentLogic.condition}
                            color="bg-yellow-200 dark:bg-yellow-900/50"
                        />
                         <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">KOŞUL</p>
                    </div>
                   
                    <Arrow />

                    <div className="flex flex-col items-center">
                         <Node
                            icon={<FlagIcon className="w-10 h-10 text-red-800 dark:text-red-200" />}
                            label="Anomali Tespiti"
                            color="bg-red-200 dark:bg-red-900/50"
                        />
                         <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-2">ÇIKTI</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RuleLogicFlow;