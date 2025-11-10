import React, { useState, useMemo } from 'react';
import { Audit, AuditDataRecord, AuditDataStatus, Rule, Anomaly, AnomalySeverity } from '../types';
import { mockAuditDataRecords, mockRules, mockAnomalies } from '../services/mockData';
import Card from './shared/Card';
import Badge from './shared/Badge';
import { ArrowLeftIcon, UploadIcon, ClockIcon, CheckCircleIcon, PlayIcon, ChevronDownIcon, RefreshIcon, ExclamationCircleIcon } from './icons';
import ProgressBar from './shared/ProgressBar';

interface AuditWorkspaceProps {
    audit: Audit;
    onBack: () => void;
}

const DataRecordCard: React.FC<{ record: AuditDataRecord; onUpload: (id: string, file?: File) => void; onRetry: (id: string) => void; }> = ({ record, onUpload, onRetry }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    const statusInfo = {
        [AuditDataStatus.Waiting]: { icon: <ClockIcon className="w-6 h-6 text-yellow-500" />, text: 'Yükleme Bekleniyor', color: 'border-yellow-500' },
        [AuditDataStatus.Uploaded]: { icon: <CheckCircleIcon className="w-6 h-6 text-blue-500" />, text: 'Yüklendi, Doğrulanıyor...', color: 'border-blue-500' },
        [AuditDataStatus.Validated]: { icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />, text: 'Doğrulandı ve Hazır', color: 'border-green-500' },
        [AuditDataStatus.Error]: { icon: <ExclamationCircleIcon className="w-6 h-6 text-red-500" />, text: 'Doğrulama Başarısız', color: 'border-red-500' },
    };

    const currentStatus = statusInfo[record.status];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUploadClick = () => {
        if(selectedFile) {
            onUpload(record.id, selectedFile);
        }
    }
    
    const xmlUploadIds = ['DATA-02', 'DATA-07'];

    return (
        <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 ${currentStatus.color} flex flex-col`}>
            <div className="flex items-center justify-between w-full">
                <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-100">{record.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{record.description}</p>
                    <div className="flex items-center text-sm mt-2">
                        {currentStatus.icon}
                        <span className="ml-2 font-semibold">{currentStatus.text}</span>
                    </div>
                </div>
                 {record.status === AuditDataStatus.Waiting && (
                    xmlUploadIds.includes(record.id) ? (
                        <div className="flex flex-col items-end">
                            {!selectedFile ? (
                                <>
                                    <label htmlFor={`xml-upload-${record.id}`} className="cursor-pointer bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center self-start">
                                        <UploadIcon className="w-5 h-5 mr-2" />
                                        XML Dosyası Seç
                                    </label>
                                    <input id={`xml-upload-${record.id}`} type="file" className="hidden" accept=".xml" onChange={handleFileChange} />
                                </>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate" title={selectedFile.name}>{selectedFile.name}</p>
                                    <button onClick={handleUploadClick} className="bg-green-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-green-700 transition-colors flex-shrink-0">
                                       Doğrula
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                         <button onClick={() => onUpload(record.id)} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center self-start">
                            <UploadIcon className="w-5 h-5 mr-2" />
                            Yükle
                        </button>
                    )
                 )}
                {record.status === AuditDataStatus.Error && (
                     <button onClick={() => onRetry(record.id)} className="bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors flex items-center self-start">
                        <RefreshIcon className="w-5 h-5 mr-2" />
                        Yeniden Dene
                    </button>
                )}
            </div>
            {record.status === AuditDataStatus.Error && record.errorMessage && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-300 font-medium w-full">
                   <strong>Hata:</strong> {record.errorMessage}
                </div>
            )}
        </div>
    );
};

const RuleCategory: React.FC<{
    category: string;
    rules: Rule[];
    selectedRules: Set<string>;
    validatedDataNames: Set<string>;
    onToggleRule: (id: string) => void;
    onToggleCategory: (ids: string[]) => void;
}> = ({ category, rules, selectedRules, validatedDataNames, onToggleRule, onToggleCategory }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    
    const runnableRules = useMemo(() => rules.filter(r => {
        const required = r.requiredData.split(',').map(s => s.trim());
        return required.every(req => validatedDataNames.has(req));
    }), [rules, validatedDataNames]);

    const runnableRuleIds = useMemo(() => runnableRules.map(r => r.id), [runnableRules]);

    const areAllRunnableSelected = runnableRuleIds.length > 0 && runnableRuleIds.every(id => selectedRules.has(id));

    return (
         <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <div className="p-4 cursor-pointer flex justify-between items-center" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        className="h-5 w-5 rounded text-red-600 focus:ring-red-500 disabled:opacity-50"
                        checked={areAllRunnableSelected}
                        onChange={() => onToggleCategory(runnableRuleIds)}
                        onClick={(e) => e.stopPropagation()}
                        disabled={runnableRuleIds.length === 0}
                        title={runnableRuleIds.length === 0 ? "Bu kategoride çalıştırılabilir kural yok" : ""}
                    />
                    <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100 ml-4">{category} ({runnableRules.length} / {rules.length} çalıştırılabilir)</h4>
                </div>
                <ChevronDownIcon className={`h-6 w-6 text-gray-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rules.map(rule => {
                        const required = rule.requiredData.split(',').map(s => s.trim());
                        const isRunnable = required.every(req => validatedDataNames.has(req));
                        return (
                            <label 
                                key={rule.id} 
                                className={`flex items-start p-3 bg-white dark:bg-gray-800 rounded-md transition-opacity ${isRunnable ? 'hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                title={!isRunnable ? `Bu kuralı çalıştırmak için "${rule.requiredData}" veri setini doğrulamanız gerekir.` : rule.description}
                            >
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded text-red-600 focus:ring-red-500 mt-1"
                                    checked={selectedRules.has(rule.id)}
                                    onChange={() => onToggleRule(rule.id)}
                                    disabled={!isRunnable}
                                />
                                <div className="ml-3">
                                    <p className="font-semibold text-gray-700 dark:text-gray-200">{rule.id}: {rule.description}</p>
                                    <p className="text-xs text-gray-500">{rule.logicText.substring(0, 50)}...</p>
                                </div>
                            </label>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

const possibleErrors: Record<string, string[]> = {
    'Fatura Listesi (GİB)': [
        "'tarih' sütununda geçersiz tarih formatı bulundu (YYYY-MM-DD bekleniyordu).",
        "'tutar' sütununda negatif değerler içeriyor.",
        "'fatura_no' sütununda yinelenen değerler tespit edildi."
    ],
    'Yevmiye Defteri': [
        "Borç ve alacak sütunları günlük toplamda birbirini dengelemiyor.",
        "'fis_no' sütununda yinelenen değerler tespit edildi.",
        "'tarih' sütununda geçersiz format bulundu."
    ],
    'Defter-i Kebir': [
        "Hesap kodu formatı standartlara uymuyor (örn. 100.01.001).",
        "Muavin hesap bakiyesi ana hesap bakiyesini aşıyor.",
        "'bakiye' sütununda tutarsız ilerleme tespit edildi."
    ],
    'Banka Ekstreleri': [
        "'IBAN' sütununda eksik veya hatalı formatlı kayıtlar var.",
        "Açıklama alanı beklenenden uzun karakter içeriyor.",
        "'bakiye' sütununda tutarsız ilerleme tespit edildi."
    ]
};

const validateDataRecord = (record: AuditDataRecord): { isValid: boolean, errorMessage?: string } => {
    // Simulate a 20% chance of failure
    if (Math.random() < 0.2) {
        const errorPool = possibleErrors[record.name] || ['Bilinmeyen bir veri formatı hatası oluştu.'];
        const randomError = errorPool[Math.floor(Math.random() * errorPool.length)];
        return { isValid: false, errorMessage: randomError };
    }
    return { isValid: true };
};

interface RunResult {
    foundAnomalies: Anomaly[];
    skippedRules: Rule[];
    runRuleCount: number;
}

const AuditWorkspace: React.FC<AuditWorkspaceProps> = ({ audit, onBack }) => {
    const [dataRecords, setDataRecords] = useState<AuditDataRecord[]>(mockAuditDataRecords.map(r => ({...r, errorMessage: undefined, status: AuditDataStatus.Waiting })));
    const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [runResult, setRunResult] = useState<RunResult | null>(null);

    const validatedDataNames = useMemo(() => new Set(
        dataRecords
            .filter(r => r.status === AuditDataStatus.Validated)
            .map(r => r.name)
    ), [dataRecords]);

    const validationProgress = useMemo(() => {
        const totalRecords = dataRecords.length;
        if (totalRecords === 0) return { percentage: 0, validatedCount: 0 };

        const progressSum = dataRecords.reduce((acc, record) => {
            if (record.status === AuditDataStatus.Validated) {
                return acc + 100;
            }
            if (record.status === AuditDataStatus.Uploaded) {
                return acc + 50;
            }
            return acc;
        }, 0);

        const validatedCount = dataRecords.filter(r => r.status === AuditDataStatus.Validated).length;

        return {
            percentage: Math.round(progressSum / totalRecords),
            validatedCount: validatedCount,
        };
    }, [dataRecords]);


    const handleUpload = (id: string, file?: File) => {
        if (file) {
            console.log(`Uploading file for ${id}: ${file.name} (${file.size} bytes)`);
        }
        setDataRecords(current => current.map(r => r.id === id ? { ...r, status: AuditDataStatus.Uploaded, errorMessage: undefined } : r));
        
        setTimeout(() => {
            const recordToValidate = dataRecords.find(r => r.id === id);
            if (recordToValidate) {
                const { isValid, errorMessage } = validateDataRecord(recordToValidate);
                setDataRecords(current => current.map(r => 
                    r.id === id 
                        ? { ...r, status: isValid ? AuditDataStatus.Validated : AuditDataStatus.Error, errorMessage } 
                        : r
                ));
            }
        }, 1500);
    };
    
    const handleRetry = (id: string) => {
        setDataRecords(current => current.map(r => r.id === id ? { ...r, status: AuditDataStatus.Waiting, errorMessage: undefined } : r));
    };

    const handleUploadAll = () => {
        setDataRecords(current => current.map(r => 
            r.status === AuditDataStatus.Waiting ? { ...r, status: AuditDataStatus.Uploaded, errorMessage: undefined } : r
        ));

        setTimeout(() => {
            setDataRecords(current => current.map(r => {
                if (r.status === AuditDataStatus.Uploaded) {
                    const { isValid, errorMessage } = validateDataRecord(r);
                    return { ...r, status: isValid ? AuditDataStatus.Validated : AuditDataStatus.Error, errorMessage };
                }
                return r;
            }));
        }, 2000);
    };

    const canUploadAll = useMemo(() => dataRecords.some(r => r.status === AuditDataStatus.Waiting), [dataRecords]);

    const rulesByCategory = useMemo(() => {
        return mockRules.reduce((acc, rule) => {
            (acc[rule.category] = acc[rule.category] || []).push(rule);
            return acc;
        }, {} as Record<string, Rule[]>);
    }, []);

    const handleToggleRule = (id: string) => {
        setSelectedRules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleToggleCategory = (runnableIds: string[]) => {
        const areAllSelected = runnableIds.every(id => selectedRules.has(id));
        setSelectedRules(prev => {
            const newSet = new Set(prev);
            if (areAllSelected) {
                runnableIds.forEach(id => newSet.delete(id));
            } else {
                runnableIds.forEach(id => newSet.add(id);
            }
            return newSet;
        });
    }

    const handleRunTests = () => {
        if (selectedRules.size === 0) {
            alert("Lütfen en az bir test seçin.");
            return;
        }
        setIsRunning(true);
        setRunResult(null);
        setProgress(0);

        const interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    clearInterval(interval);
                    setIsRunning(false);
                    
                    const result: RunResult = { foundAnomalies: [], skippedRules: [], runRuleCount: 0 };
                    
                    selectedRules.forEach(ruleId => {
                        const rule = mockRules.find(r => r.id === ruleId);
                        if (!rule) return;
                        
                        const required = rule.requiredData.split(',').map(s => s.trim());
                        const isRunnable = required.every(req => validatedDataNames.has(req));

                        if (isRunnable) {
                            result.runRuleCount++;
                            const anomaliesForThisRule = mockAnomalies.filter(a => a.ruleId === rule.id);
                            result.foundAnomalies.push(...anomaliesForThisRule);
                        } else {
                            result.skippedRules.push(rule);
                        }
                    });

                    setRunResult(result);
                    return 100;
                }
                return p + 10;
            });
        }, 300);
    };

    const handleRerun = () => {
        setRunResult(null);
        setProgress(0);
        setIsRunning(false);
        setSelectedRules(new Set());
    };
    
    const anomalySummary = useMemo(() => {
        if (!runResult) return null;
        const anomalies = runResult.foundAnomalies;
        return {
            total: anomalies.length,
            high: anomalies.filter(a => a.severity === AnomalySeverity.High).length,
            medium: anomalies.filter(a => a.severity === AnomalySeverity.Medium).length,
            low: anomalies.filter(a => a.severity === AnomalySeverity.Low).length,
        };
    }, [runResult]);

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center">
                <button onClick={onBack} className="flex items-center text-red-600 font-semibold hover:underline">
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Denetim Merkezi'ne Geri Dön
                </button>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Adım 1: Veri Yükleme ve Doğrulama</h3>
                    {canUploadAll && (
                        <button 
                            onClick={handleUploadAll} 
                            disabled={!canUploadAll}
                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            <UploadIcon className="w-5 h-5 mr-2" />
                            Bekleyenleri Yükle
                        </button>
                    )}
                </div>
                <ProgressBar
                    progress={validationProgress.percentage}
                    label={`${validationProgress.percentage}% Tamamlandı`}
                    description={`${validationProgress.validatedCount} / ${dataRecords.length} veri seti doğrulandı`}
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {dataRecords.map(record => <DataRecordCard key={record.id} record={record} onUpload={handleUpload} onRetry={handleRetry} />)}
                </div>
            </Card>

            <Card>
                 <div className="flex items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Adım 2: Kontrol Seçimi ve Çalıştırma</h3>
                    {validatedDataNames.size === 0 && (
                        <div className="ml-4 flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-sm font-semibold rounded-full">
                            <ClockIcon className="w-4 h-4 mr-2" />
                            <span>Testleri etkinleştirmek için en az bir veri seti doğrulayın.</span>
                        </div>
                    )}
                 </div>
                <div className={`transition-opacity duration-500`}>
                    <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                         <p className="text-gray-600 dark:text-gray-300">Doğrulanmış veri setlerinize göre çalıştırılabilir kurallar aşağıda aktif edilmiştir.</p>
                         <button 
                            onClick={handleRunTests}
                            disabled={validatedDataNames.size === 0 || selectedRules.size === 0 || isRunning || !!runResult}
                            className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors shadow-md flex items-center">
                            <PlayIcon className="w-5 h-5 mr-2" />
                            {isRunning ? 'Testler Çalışıyor...' : `${selectedRules.size} Testi Çalıştır`}
                        </button>
                    </div>

                    <div className={`space-y-4 ${runResult ? 'hidden' : ''}`}>
                        {Object.entries(rulesByCategory).map(([category, rules]) => (
                            <RuleCategory 
                                key={category}
                                category={category}
                                rules={rules}
                                selectedRules={selectedRules}
                                validatedDataNames={validatedDataNames}
                                onToggleRule={handleToggleRule}
                                onToggleCategory={handleToggleCategory}
                            />
                        ))}
                    </div>

                    {isRunning && (
                        <div className="mt-6">
                            <h4 className="font-semibold text-center mb-2 text-gray-700 dark:text-gray-300">Denetim süreci işliyor...</h4>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.3s ease-in-out' }}></div>
                            </div>
                        </div>
                    )}

                </div>
            </Card>

            {runResult && anomalySummary && (
                <Card className="animate-fade-in">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Adım 3: Sonuçları İncele</h3>
                        <button onClick={handleRerun} className="flex items-center text-sm font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                            <RefreshIcon className="w-5 h-5 mr-2" />
                            Testleri Yeniden Çalıştır
                        </button>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex flex-col sm:flex-row items-center justify-around mb-6 space-y-4 sm:space-y-0">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{runResult.runRuleCount} / {selectedRules.size}</p>
                            <p className="text-sm font-semibold text-gray-500">Kural Çalıştırıldı</p>
                        </div>
                         <div className="text-center">
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">{anomalySummary.total}</p>
                            <p className="text-sm font-semibold text-gray-500">Toplam Anomali</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-red-600">{anomalySummary.high}</p>
                            <p className="text-sm font-semibold text-gray-500">Yüksek Riskli</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-yellow-500">{anomalySummary.medium}</p>
                            <p className="text-sm font-semibold text-gray-500">Orta Riskli</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-500">{anomalySummary.low}</p>
                            <p className="text-sm font-semibold text-gray-500">Düşük Riskli</p>
                        </div>
                    </div>

                    {runResult.skippedRules.length > 0 && (
                        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Atlanan Kurallar</h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">Aşağıdaki kurallar, gerekli veri setleri doğrulanmadığı için çalıştırılamadı:</p>
                            <ul className="list-disc list-inside text-sm">
                                {runResult.skippedRules.map(rule => (
                                    <li key={rule.id}>
                                        <span className="font-semibold">{rule.id}: {rule.description}</span> - Gerekli Veri: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">{rule.requiredData}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-4 py-3">Kural ID</th>
                                    <th className="px-4 py-3">Açıklama</th>
                                    <th className="px-4 py-3">Risk</th>
                                    <th className="px-4 py-3 text-right">Tutar</th>
                                    <th className="px-4 py-3 text-center">Aksiyon</th>
                                </tr>
                            </thead>
                            <tbody>
                                {runResult.foundAnomalies.map(anomaly => (
                                    <tr key={anomaly.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                        <td className="px-4 py-3 font-mono text-gray-800 dark:text-gray-200">{anomaly.ruleId}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{anomaly.description}</td>
                                        <td className="px-4 py-3"><Badge type={anomaly.severity} /></td>
                                        <td className="px-4 py-3 text-right font-mono">{Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(anomaly.amount)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button className="font-semibold text-red-600 hover:underline">Vaka Oluştur</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

        </div>
    );
};

export default AuditWorkspace;