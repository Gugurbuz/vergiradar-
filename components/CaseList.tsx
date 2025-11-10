import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Case, BulguSeverity, CaseStatus, BulguDomain } from '../types';
import Badge from './shared/Badge';
import * as api from '../services/api';
import { AgGridReact } from 'ag-grid-react';
import { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { Download, Search } from 'lucide-react';

const BadgeCellRenderer: React.FC<{ value: BulguSeverity | CaseStatus | BulguDomain }> = ({ value }) => <Badge type={value} />;

const CaseList: React.FC = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const gridRef = useRef<AgGridReact<Case>>(null);
  const [isDark, setIsDark] = useState(document.body.classList.contains('dark'));

  useEffect(() => {
      api.getCases()
          .then(setCases)
          .catch(err => setError('Vakalar yüklenemedi: ' + err.message))
          .finally(() => setLoading(false));
      
      const observer = new MutationObserver(() => {
          setIsDark(document.body.classList.contains('dark'));
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
  }, []);

  const [columnDefs] = useState<ColDef<Case>[]>([
      { field: 'id', headerName: 'Vaka ID', width: 120, sort: 'desc' },
      { field: 'title', headerName: 'Başlık', flex: 2, filter: 'agTextColumnFilter' },
      { field: 'status', headerName: 'Durum', flex: 1, cellRenderer: BadgeCellRenderer, enableRowGroup: true },
      { field: 'assignee', headerName: 'Atanan', flex: 1, filter: true },
      { field: 'severity', headerName: 'Risk', flex: 1, cellRenderer: BadgeCellRenderer, enableRowGroup: true },
      { 
          field: 'created_at', 
          headerName: 'Oluşturulma Tarihi', 
          flex: 1, 
          valueFormatter: p => new Date(p.value).toLocaleDateString('tr-TR'),
          filter: 'agDateColumnFilter'
      },
  ]);

  const defaultColDef = useMemo<ColDef>(() => ({
      resizable: true,
      sortable: true,
      filter: true,
      floatingFilter: true,
  }), []);

  const onExportClick = useCallback(() => {
      gridRef.current?.api.exportDataAsCsv();
  }, []);

  const onFilterTextBoxChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      gridRef.current?.api.setGridOption('quickFilterText', e.target.value);
  }, []);

  if (loading) return <div className="p-8">Vakalar yükleniyor...</div>;
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
                rowData={cases}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                rowGroupPanelShow={'always'}
                pagination={true}
                paginationPageSize={50}
                paginationPageSizeSelector={[20, 50, 100, 500]}
                animateRows={true}
            />
        </div>
    </div>
  );
};

export default CaseList;