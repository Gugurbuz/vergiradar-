import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Bulgu, BulguSeverity, BulguDomain, CaseStatus } from '../types';
import Badge from './shared/Badge';
import { Cog, Download, Search } from 'lucide-react';
import * as api from '../services/api';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, RowClickedEvent } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

const BulguDetailPanel: React.FC<{ bulgu: Bulgu; onClose: () => void }> = ({ bulgu, onClose }) => {
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isLoadingAi, setIsLoadingAi] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const handleAiAnalysis = async () => {
        setIsLoadingAi(true);
        setAiError(null);
        setAiAnalysis(null);
        try {
            const analysis = await api.getBulguAnalysis(bulgu);
            setAiAnalysis(analysis);
        } catch (err: any) {
            setAiError('Yapay zeka analizi alınamadı: ' + err.message);
        } finally {
            setIsLoadingAi(false);
        }
    };

    // Simple markdown to HTML converter
    const renderMarkdown = (text: string) => {
        const html = text
            .replace(/### (.*)/g, '<h3 class="text-lg font-bold text-gray-800 dark:text-gray-100 mt-4 mb-2">$1</h3>')
            .replace(/\* (.*)/g, '<li class="ml-4">$1</li>')
            .replace(/(\d+)\. (.*)/g, '<li class="ml-4">$1. $2</li>');
        return <div dangerouslySetInnerHTML={{ __html: html }} />;
    };
    
    return (
        <div className="fixed top-0 right-0 h-full w-full md:w-1/3 bg-white dark:bg-gray-800 shadow-2xl z-20 p-8 transform transition-transform duration-300 ease-in-out overflow-y-auto" style={{ transform: 'translateX(0%)' }}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Bulgu Detayı</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-3xl font-light leading-none">&times;</button>
            </div>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p><strong>ID:</strong> {bulgu.id}</p>
                <p><strong>Açıklama:</strong> {bulgu.description}</p>
                <p><strong>Alan:</strong> <Badge type={bulgu.domain} /></p>
                <p><strong>Risk Seviyesi:</strong> <Badge type={bulgu.severity} /></p>
                <p><strong>Tarih:</strong> {bulgu.date}</p>
                <p><strong>Tutar:</strong> {Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(bulgu.amount)}</p>
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold mb-2">Detaylar</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {Object.entries(bulgu.details).map(([key, value]) => (
                            <li key={key}><strong>{key}:</strong> {value}</li>
                        ))}
                    </ul>
                </div>
                <div className="pt-6 space-y-3">
                    <button className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors">
                        Vaka Oluştur
                    </button>
                    <button 
                        onClick={handleAiAnalysis}
                        disabled={isLoadingAi}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50 disabled:cursor-wait"
                    >
                        <Cog className="w-5 h-5 mr-2" />
                        {isLoadingAi ? 'Analiz Ediliyor...' : 'AI ile Analiz Et'}
                    </button>
                </div>
                
                {(isLoadingAi || aiError || aiAnalysis) && (
                     <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        {isLoadingAi && <p className="text-center text-gray-600 dark:text-gray-300">Yapay Zeka Asistanı bulguyu inceliyor...</p>}
                        {aiError && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg">{aiError}</div>}
                        {aiAnalysis && (
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                {renderMarkdown(aiAnalysis)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const BadgeCellRenderer: React.FC<{ value: BulguSeverity | CaseStatus | BulguDomain }> = ({ value }) => <Badge type={value} />;

const BulguList: React.FC = () => {
    const [bulgular, setBulgular] = useState<Bulgu[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedBulgu, setSelectedBulgu] = useState<Bulgu | null>(null);
    const gridRef = useRef<AgGridReact<Bulgu>>(null);
    const [isDark, setIsDark] = useState(document.body.classList.contains('dark'));

    useEffect(() => {
        api.getBulgular()
            .then(setBulgular)
            .catch(err => setError('Bulgular yüklenemedi: ' + err.message))
            .finally(() => setLoading(false));

        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    setIsDark(document.body.classList.contains('dark'));
                }
            });
        });
        observer.observe(document.body, { attributes: true });
        return () => observer.disconnect();
    }, []);

    const [columnDefs] = useState<ColDef<Bulgu>[]>([
        { field: 'id', headerName: 'ID', width: 120, sort: 'desc', checkboxSelection: true, headerCheckboxSelection: true },
        { field: 'description', headerName: 'Açıklama', flex: 3, filter: 'agTextColumnFilter', tooltipField: 'description' },
        { field: 'domain', headerName: 'Alan', flex: 1, cellRenderer: BadgeCellRenderer, enableRowGroup: true },
        { 
            field: 'severity', 
            headerName: 'Risk', 
            flex: 1, 
            cellRenderer: BadgeCellRenderer, 
            enableRowGroup: true,
            cellStyle: params => {
                 if (params.value === BulguSeverity.High) return { backgroundColor: 'rgba(239, 68, 68, 0.3)' };
                 if (params.value === BulguSeverity.Medium) return { backgroundColor: 'rgba(245, 158, 11, 0.2)' };
                 return null;
            }
        },
        { field: 'date', headerName: 'Tarih', flex: 1, filter: 'agDateColumnFilter' },
        { 
            field: 'amount', 
            headerName: 'Tutar', 
            flex: 1, 
            valueFormatter: p => Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p.value),
            type: 'numericColumn',
            aggFunc: 'sum'
        },
    ]);

    const defaultColDef = useMemo<ColDef>(() => ({
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: true,
    }), []);

    const onRowClicked = useCallback((event: RowClickedEvent<Bulgu>) => {
        if (event.data) setSelectedBulgu(event.data);
    }, []);

    const onExportClick = useCallback(() => {
        gridRef.current?.api.exportDataAsCsv();
    }, []);

    const onFilterTextBoxChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        gridRef.current?.api.setGridOption('quickFilterText', e.target.value);
    }, []);

    if (loading) return <div className="p-8">Bulgular yükleniyor...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                        type="text"
                        onChange={onFilterTextBoxChanged}
                        placeholder="Grid'de ara..."
                        className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <button
                    onClick={onExportClick}
                    className="flex items-center justify-center w-full sm:w-auto bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors shadow-md"
                >
                    <Download className="w-5 h-5 mr-2" />
                    CSV Olarak Aktar
                </button>
            </div>
            <div className={`flex-grow ${isDark ? 'ag-theme-quartz-dark' : 'ag-theme-quartz'}`}>
                <AgGridReact
                    ref={gridRef}
                    rowData={bulgular}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    onRowClicked={onRowClicked}
                    rowGroupPanelShow={'always'}
                    pagination={true}
                    paginationPageSize={50}
                    paginationPageSizeSelector={[20, 50, 100, 500]}
                    animateRows={true}
                    rowSelection="multiple"
                    suppressRowClickSelection={true}
                />
            </div>
            {selectedBulgu && <BulguDetailPanel bulgu={selectedBulgu} onClose={() => setSelectedBulgu(null)} />}
            {selectedBulgu && <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={() => setSelectedBulgu(null)}></div>}
        </div>
    );
};

export default BulguList;