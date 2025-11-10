import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuditCenter from './components/AuditCenter';
import Dashboard from './components/Dashboard';
import BulguList from './components/AnomalyList';
import CaseList from './components/CaseList';
import RuleStudio from './components/RuleStudio';
import AuditWorkspace from './components/AuditWorkspace';
import { Audit, AuditedCompany } from './types';
import * as api from './services/api';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeAudit, setActiveAudit] = useState<Audit | null>(null);
  const [auditedCompanies, setAuditedCompanies] = useState<AuditedCompany[]>([]);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    api.getCompanies()
      .then(setAuditedCompanies)
      .catch(err => setError('Firma verileri yüklenemedi: ' + err.message));
  }, []);

  const viewComponents: Record<string, { component: React.ReactNode; title: string }> = {
    dashboard: { component: <Dashboard />, title: 'Genel Bakış ve Raporlama' },
    auditCenter: { component: <AuditCenter setActiveAudit={setActiveAudit} companies={auditedCompanies} setCompanies={setAuditedCompanies} />, title: 'Denetim Merkezi' },
    bulgular: { component: <BulguList />, title: 'Bulgu Listesi' },
    cases: { component: <CaseList />, title: 'Vaka Yönetimi' },
    rules: { component: <RuleStudio />, title: 'Kural Stüdyosu' },
  };

  const currentView = viewComponents[activeView] || viewComponents.dashboard;
  
  const handleSetAudit = (audit: Audit | null) => {
    setActiveAudit(audit);
    if (audit) {
      setActiveView('auditCenter'); // Keep sidebar selection on audit center
    }
  }
  
  const mainContent = () => {
    if (error) {
      return <div className="p-8 text-red-500 font-semibold">{error}</div>
    }
    if (activeAudit) {
      return <AuditWorkspace audit={activeAudit} onBack={() => handleSetAudit(null)} />;
    }
    return currentView.component;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col ml-64">
        <Header 
            title={activeAudit ? `Denetim: ${activeAudit.title}` : currentView.title} 
            activeAudit={activeAudit}
            auditedCompanies={auditedCompanies}
        />
        <main className="flex-1 overflow-y-auto">
          {mainContent()}
        </main>
      </div>
    </div>
  );
};

export default App;