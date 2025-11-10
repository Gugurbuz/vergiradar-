import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AuditCenter from './components/AuditCenter';
import Dashboard from './components/Dashboard';
import AnomalyList from './components/AnomalyList';
import CaseList from './components/CaseList';
import RuleStudio from './components/RuleStudio';
import AuditWorkspace from './components/AuditWorkspace';
import { Audit } from './types';
import { mockCompanies } from './services/mockData';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeAudit, setActiveAudit] = useState<Audit | null>(null);

  const viewComponents: Record<string, { component: React.ReactNode; title: string }> = {
    dashboard: { component: <Dashboard />, title: 'Genel Bakış ve Raporlama' },
    auditCenter: { component: <AuditCenter setActiveAudit={setActiveAudit} />, title: 'Denetim Merkezi' },
    anomalies: { component: <AnomalyList />, title: 'Anomali Listesi' },
    cases: { component: <CaseList />, title: 'Vaka Yönetimi' },
    rules: { component: <RuleStudio />, title: 'Kural Stüdyosu' },
  };

  const currentView = viewComponents[activeView] || viewComponents.dashboard;
  
  const handleSetAudit = (audit: Audit | null) => {
    setActiveAudit(audit);
    // When an audit is selected, we might want to switch view or handle other logic
    // For now, selecting an audit will render the workspace.
    // Setting it to null will go back to the audit center.
    if (audit) {
      setActiveView('auditCenter'); // Keep sidebar selection on audit center
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1 flex flex-col ml-64">
        <Header 
            title={activeAudit ? `Denetim: ${activeAudit.title}` : currentView.title} 
            activeAudit={activeAudit}
            auditedCompanies={mockCompanies}
        />
        <main className="flex-1 overflow-y-auto">
          {activeAudit ? (
            <AuditWorkspace audit={activeAudit} onBack={() => handleSetAudit(null)} />
          ) : (
            currentView.component
          )}
        </main>
      </div>
    </div>
  );
};

export default App;