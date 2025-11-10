import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Audit, AuditDataRecord, AuditDataStatus, Rule, Bulgu, BulguSeverity, RunResult } from '../types';
import Card from './shared/Card';
import Badge from './shared/Badge';
import { ArrowLeft, Upload, Clock, CheckCircle, Play, ChevronDown, RefreshCcw, AlertCircle } from 'lucide-react';
import ProgressBar from './shared/ProgressBar';
import * as api from '../services/api';

interface AuditWorkspaceProps {
    audit: Audit;
    onBack: () => void;
}

// Extend the base type to include UI-specific state like the filename
interface WorkspaceDataRecord extends AuditDataRecord {
    fileName?: string;
}

const DataRecordCard: React.FC<{ record: WorkspaceDataRecord; onUpload: (id: string, file: File) => void; onRetry: (id: string) => void; uploadProgress?: number; }> = ({ record, onUpload, onRetry, uploadProgress }) => {
    
    const statusInfo = {
        [AuditDataStatus.Waiting]: { icon: <Clock size={24} className="text-yellow-500" />, text: 'Yükleme Bekleniyor', color: 'border-yellow-500' },
        [AuditDataStatus.Uploading]: { icon: <Upload size={24} className="text-blue-500 animate-pulse" />, text: 'Yükleniyor...', color: 'border-blue-500' },
        [AuditDataStatus.Uploaded]: { icon: <CheckCircle size={24} className="text-blue-500" />, text: 'Yüklendi, Doğrulanıyor...', color: 'border-blue-500' },
        [AuditDataStatus.Validated]: { icon: <CheckCircle size={24} className="text-green-500" />, text: 'Doğrulandı ve Hazır', color: 'border-green-500' },
        [AuditDataStatus.Error]: { icon: <AlertCircle size={24} className="text-red-500" />, text: 'Doğrulama Başarısız', color: 'border-red-500' },
    };

    const currentStatus = statusInfo[record.status];

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];
            onUpload(record.id, file);
        }
    };
    
    return (
        <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 ${currentStatus.color} flex flex-col justify-between min-h-[170px]`}>
            <div>
                <h4 className="font-bold text-gray-800 dark:text-gray-100">{record.name}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{record.description}</p>
                 <div className="flex items-center text-sm">
                    {currentStatus.icon}
                    <span className="ml-2 font-semibold">{currentStatus.text}</span>
                </div>
                 {record.status === AuditDataStatus.Validated && record.fileName && (
                    <div className="mt-2 flex items-center text-sm text-green-800 dark:text-green-200 bg-green-50 dark:bg-green-900/30 p-2 rounded-md font-medium">
                         <CheckCircle size={16} className="mr-2 flex-shrink-0"/>
                         <span className="font-medium truncate" title={record.fileName}>Dosya: {record.fileName}</span>
                    </div>
                )}
            </div>
            
            <div className="mt-3">
                 {record.status === AuditDataStatus.Waiting && (
                    <label htmlFor={`file-upload-${record.id}`} className="cursor-pointer w-full text-center bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center">
                        <Upload size={20} className="mr-2" />
                        Dosya Seç
                    </label>
                 )}
                 <input id={`file-upload-${record.id}`} type="file" className="hidden" onChange={handleFileChange} />
                
                {record.status === AuditDataStatus.Uploading && typeof uploadProgress === 'number' && (
                    <div className="w-full">
                        <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-white truncate max-w-[150px]" title={record.fileName}>{record.fileName}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-white">{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full transition-width duration-300 ease-linear" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {record.status === AuditDataStatus.Error && (
                     <button onClick={() => onRetry(record.id)} className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors flex items-center justify-center">
                        <RefreshCcw size={20} className="mr-2" />
                        Yeniden Dene
                    </button>
                )}
            </div>

            {record.status === AuditDataStatus.Error && record.error_message && (
                <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-700 dark:text-red-300 font-medium w-full">
                   <strong>Hata:</strong> {record.error_message}
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
        const required = r.required_data.split(',').map(s => s.trim());
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
                <ChevronDown className={`h-6 w-6 text-gray-500 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rules.map(rule => {
                        const required = rule.required_data.split(',').map(s => s.trim());
                        const isRunnable = required.every(req => validatedDataNames.has(req));
                        return (
                            <label 
                                key={rule.id} 
                                className={`flex items-start p-3 bg-white dark:bg-gray-800 rounded-md transition-opacity ${isRunnable ? 'hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                                title={!isRunnable ? `Bu kuralı çalıştırmak için "${rule.required_data}" veri setini doğrulamanız gerekir.` : rule.description}
                            >
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 rounded text-red-600 focus:ring-red-500 mt-1 flex-shrink-0"
                                    checked={selectedRules.has(rule.id)}
                                    onChange={() => onToggleRule(rule.id)}
                                    disabled={!isRunnable}
                                />
                                <div className="ml-3">
                                    <div className="flex items-center">
                                        {isRunnable ? (
                                            <CheckCircle size={20} className="text-green-500 mr-2 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle size={20} className="text-yellow-500 mr-2 flex-shrink-0" />
                                        )}
                                        <p className="font-semibold text-gray-700 dark:text-gray-200">{rule.id}: {rule.description}</p>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-7">{rule.logic_text.substring(0, 50)}...</p>
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


const AuditWorkspace: React.FC<AuditWorkspaceProps> = ({ audit, onBack }) => {
    const [dataRecords, setDataRecords] = useState<WorkspaceDataRecord[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [runResult, setRunResult] = useState<RunResult | null>(null);
    
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [recordsData, rulesData] = await Promise.all([
                    api.getAuditDataRecords(audit.id),
                    api.getRules()
                ]);

                setDataRecords(recordsData.map(r => ({...r, error_message: undefined, status: AuditDataStatus.Waiting })));
                setRules(rulesData);
            } catch (err: any) {
                setError('Çalışma alanı verileri yüklenemedi: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [audit.id]);

    const validatedDataNames = useMemo(() => new Set(
        dataRecords
            .filter(r => r.status === AuditDataStatus.Validated)
            .map(r => r.name)
    ), [dataRecords]);

    const validationProgress = useMemo(() => {
        const totalRecords = dataRecords.length;
        if (totalRecords === 0) return { percentage: 0, validatedCount: 0 };

        const progressSum = dataRecords.reduce((acc, record) => {
            if (record.status === AuditDataStatus.Validated) return acc + 100;
            if (record.status === AuditDataStatus.Uploaded) return acc + 50;
            if (record.status === AuditDataStatus.Uploading) return acc + (uploadProgress[record.id] / 2 || 0);
            return acc;
        }, 0);

        const validatedCount = dataRecords.filter(r => r.status === AuditDataStatus.Validated).length;

        return {
            percentage: Math.round(progressSum / totalRecords),
            validatedCount: validatedCount,
        };
    }, [dataRecords, uploadProgress]);


    const handleUpload = (id: string, file: File) => {
        const record = dataRecords.find(r => r.id === id);
        if (!record || record.status === AuditDataStatus.Uploading || record.status === AuditDataStatus.Validated) return;

        setDataRecords(current => current.map(r => r.id === id ? { ...r, status: AuditDataStatus.Uploading, error_message: undefined, fileName: file.name } : r));
        setUploadProgress(prev => ({...prev, [id]: 0}));
        
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                const currentProg = prev[id] ?? 0;
                const newProgress = Math.min(currentProg + Math.random() * 25, 100);
                
                if (newProgress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        const recordToValidate = dataRecords.find(r => r.id === id);
                        if (recordToValidate) {
                             const { isValid, errorMessage } = validateDataRecord(recordToValidate);
                             setDataRecords(current => current.map(r => 
                                r.id === id 
                                    ? { ...r, status: isValid ? AuditDataStatus.Validated : AuditDataStatus.Error, error_message: errorMessage } 
                                    : r
                            ));
                            setUploadProgress(prevProg => {
                                const nextProg = {...prevProg};
                                delete nextProg[id];
                                return nextProg;
                            });
                        }
                    }, 500);
                    return { ...prev, [id]: 100 };
                }
                return { ...prev, [id]: newProgress };
            });
        }, 300);
    };
    
    const handleRetry = (id: string) => {
        setDataRecords(current => current.map(r => r.id === id ? { ...r, status: AuditDataStatus.Waiting, error_message: undefined, fileName: undefined } : r));
    };

    const processFiles = (files: FileList) => {
        const recordsToUpdate = [...dataRecords.filter(r => r.status === AuditDataStatus.Waiting)];
        const fileArray = Array.from(files);
        const unmatchedFiles: string[] = [];

        fileArray.forEach(file => {
            const matchedRecordIndex = recordsToUpdate.findIndex(record => {
                // FIX: Loosened keyword matching to include shorter terms like "gib" and "kdv".
                const keywords = record.name.toLowerCase().replace(/[\(\)-]/g, ' ').split(' ').filter(kw => kw.length > 2);
                return keywords.length > 0 && keywords.some(kw => file.name.toLowerCase().includes(kw));
            });

            if (matchedRecordIndex > -1) {
                const matchedRecord = recordsToUpdate[matchedRecordIndex];
                handleUpload(matchedRecord.id, file);
                // FIX: Prevent a single record from being matched by multiple files in one drop.
                recordsToUpdate.splice(matchedRecordIndex, 1);
            } else {
                unmatchedFiles.push(file.name);
            }
        });

        // UX Improvement: Provide feedback if a file cannot be matched.
        if (unmatchedFiles.length > 0) {
            alert(`Aşağıdaki dosyalar beklenilen veri setleriyle eşleştirilemedi:\n\n- ${unmatchedFiles.join('\n- ')}\n\nLütfen dosya adlarının 'fatura', 'yevmiye', 'banka', 'gib' gibi anahtar kelimeler içerdiğinden emin olun.`);
        }
    };

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files?.length) processFiles(e.dataTransfer.files);
    };
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) processFiles(e.target.files);
        e.target.value = ''; // Reset input
    };


    const rulesByCategory = useMemo(() => {
        return rules.reduce((acc, rule) => {
            (acc[rule.category] = acc[rule.category] || []).push(rule);
            return acc;
        }, {} as Record<string, Rule[]>);
    }, [rules]);

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
                runnableIds.forEach(id => newSet.add(id));
            }
            return newSet;
        });
    }

    const handleRunTests = async () => {
        if (selectedRules.size === 0) {
            alert("Lütfen en az bir test seçin.");
            return;
        }
        setIsRunning(true);
        setRunResult(null);
        setError(null);
        setProgress(0);

        const progressInterval = setInterval(() => {
            setProgress(p => Math.min(p + 9, 90));
        }, 200);

        try {
            const result = await api.runAuditTests(audit.id, Array.from(selectedRules));
            setRunResult(result);
        } catch (err: any) {
            setError(`Testler çalıştırılırken hata oluştu: ${err.message}`);
            setRunResult(null);
        } finally {
            clearInterval(progressInterval);
            setProgress(100);
            setIsRunning(false);
        }
    };

    const handleRerun = () => {
        setRunResult(null);
        setProgress(0);
        setIsRunning(false);
        setSelectedRules(new Set());
    };
    
    const bulguSummary = useMemo(() => {
        if (!runResult) return null;
        const bulgular = runResult.found_bulgular;
        return {
            total: bulgular.length,
            high: bulgular.filter(a => a.severity === BulguSeverity.High).length,
            medium: bulgular.filter(a => a.severity === BulguSeverity.Medium).length,
            low: bulgular.filter(a => a.severity === BulguSeverity.Low).length,
        };
    }, [runResult]);

    if (loading) return <div className="p-8">Çalışma alanı yükleniyor...</div>;
    if (error && !runResult) return <div className="p-8 text-red-500">{error}</div>;


    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center">
                <button onClick={onBack} className="flex items-center text-red-600 font-semibold hover:underline">
                    <ArrowLeft size={20} className="mr-2" />
                    Denetim Merkezi'ne Geri Dön
                </button>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Adım 1: Veri Yükleme ve Doğrulama</h3>
                </div>
                <ProgressBar
                    progress={validationProgress.percentage}
                    label={`${validationProgress.percentage}% Tamamlandı`}
                    description={`${validationProgress.validatedCount} / ${dataRecords.length} veri seti doğrulandı`}
                />
                
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`mt-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${
                        isDragging 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-red-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                    <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                        accept=".xml,text/xml,application/xml,.csv,.xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    />
                    <Upload size={48} className="mx-auto text-gray-400 dark:text-gray-500" />
                    <p className="mt-2 font-semibold text-gray-700 dark:text-gray-200">Dosyaları buraya sürükleyip bırakın</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">veya seçmek için tıklayın</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Akıllı eşleştirme ile ilgili veri setleri otomatik olarak güncellenir.</p>
                </div>

                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {dataRecords.map(record => <DataRecordCard key={record.id} record={record} onUpload={handleUpload} onRetry={handleRetry} uploadProgress={uploadProgress[record.id]} />)}
                </div>
            </Card>

            <Card>
                 <div className="flex items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Adım 2: Kontrol Seçimi ve Çalıştırma</h3>
                    {validatedDataNames.size === 0 && (
                        <div className="ml-4 flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-sm font-semibold rounded-full">
                            <Clock size={16} className="mr-2" />
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
                            <Play size={20} className="mr-2" />
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

            {runResult && bulguSummary && (
                <Card className="animate-fade-in">
                     {error && <div className="mb-4 p-4 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-lg">{error}</div>}
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Adım 3: Sonuçları İncele</h3>
                        <button onClick={handleRerun} className="flex items-center text-sm font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                            <RefreshCcw size={20} className="mr-2" />
                            Testleri Yeniden Çalıştır
                        </button>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex flex-col sm:flex-row items-center justify-around mb-6 space-y-4 sm:space-y-0">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-800 dark:text-white">{runResult.run_rule_count} / {selectedRules.size}</p>
                            <p className="text-sm font-semibold text-gray-500">Kural Çalıştırıldı</p>
                        </div>
                         <div className="text-center">
                            <p className="text-3xl font-bold text-gray-800 dark:text-white">{bulguSummary.total}</p>
                            <p className="text-sm font-semibold text-gray-500">Toplam Bulgu</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-red-600">{bulguSummary.high}</p>
                            <p className="text-sm font-semibold text-gray-500">Yüksek Riskli</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-yellow-500">{bulguSummary.medium}</p>
                            <p className="text-sm font-semibold text-gray-500">Orta Riskli</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-500">{bulguSummary.low}</p>
                            <p className="text-sm font-semibold text-gray-500">Düşük Riskli</p>
                        </div>
                    </div>

                    {runResult.skipped_rules.length > 0 && (
                        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Atlanan Kurallar</h4>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">Aşağıdaki kurallar, gerekli veri setleri doğrulanmadığı için çalıştırılamadı:</p>
                            <ul className="list-disc list-inside text-sm">
                                {runResult.skipped_rules.map(rule => (
                                    <li key={rule.id}>
                                        <span className="font-semibold">{rule.id}: {rule.description}</span> - Gerekli Veri: <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">{rule.required_data}</span>
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
                                {runResult.found_bulgular.length > 0 ? runResult.found_bulgular.map(bulgu => (
                                    <tr key={bulgu.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                        <td className="px-4 py-3 font-mono text-gray-800 dark:text-gray-200">{bulgu.rule_id}</td>
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{bulgu.description}</td>
                                        <td className="px-4 py-3"><Badge type={bulgu.severity} /></td>
                                        <td className="px-4 py-3 text-right font-mono">{Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(bulgu.amount)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button className="font-semibold text-red-600 hover:underline">Vaka Oluştur</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-6 text-gray-500 dark:text-gray-400">Çalıştırılan testlerde bulgu bulunamadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}

        </div>
    );
};

export default AuditWorkspace;