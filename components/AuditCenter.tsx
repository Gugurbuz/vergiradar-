import React, { useState } from 'react';
import { mockAudits, mockCompanies } from '../services/mockData';
import { Audit, AuditStatus, AuditedCompany } from '../types';
import Card from './shared/Card';
import { BriefcaseIcon, CheckIcon, XIcon } from './icons';

interface AuditCenterProps {
    setActiveAudit: (audit: Audit | null) => void;
}

const AuditStatusBadge: React.FC<{ status: AuditStatus }> = ({ status }) => {
    const statusStyles: Record<AuditStatus, string> = {
        [AuditStatus.Active]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        [AuditStatus.Completed]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        [AuditStatus.Planned]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return <span className={`px-3 py-1 text-sm font-semibold rounded-full inline-block ${statusStyles[status]}`}>{status}</span>;
}

interface NewAuditModalProps {
    onClose: () => void;
    onSave: (newAudit: Omit<Audit, 'id'>) => void;
    companies: AuditedCompany[];
    onAddCompany: (companyData: Omit<AuditedCompany, 'id'>) => AuditedCompany;
}

const NewAuditModal: React.FC<NewAuditModalProps> = ({ onClose, onSave, companies, onAddCompany }) => {
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanyVkn, setNewCompanyVkn] = useState('');

    const [companyId, setCompanyId] = useState(companies[0]?.id || '');
    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const handleSubmit = () => {
        if (!companyId || !title || !startDate || !endDate) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }
        onSave({ companyId, title, startDate, endDate, status: AuditStatus.Active });
    };

    const handleSaveCompany = () => {
        if (!newCompanyName || !newCompanyVkn) {
            alert('Lütfen firma adı ve VKN girin.');
            return;
        }
        const newCompany = onAddCompany({ name: newCompanyName, vkn: newCompanyVkn });
        setCompanyId(newCompany.id); // Auto-select the new company
        setIsCreatingCompany(false); // Go back to audit form
        setNewCompanyName('');
        setNewCompanyVkn('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 w-full max-w-lg transform transition-all">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{isCreatingCompany ? 'Yeni Firma Oluştur' : 'Yeni Denetim Başlat'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Denetlenecek Firma</label>
                         {!isCreatingCompany ? (
                            <div className="flex items-center space-x-2">
                                <select id="company" value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200">
                                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button onClick={() => setIsCreatingCompany(true)} className="flex-shrink-0 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold text-sm whitespace-nowrap">
                                    Yeni Ekle
                                </button>
                            </div>
                         ) : (
                             <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                 <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Firma Adı</label>
                                    <input type="text" placeholder="Örn: ABC Teknoloji A.Ş." value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200" />
                                 </div>
                                 <div>
                                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">Vergi Kimlik No (VKN)</label>
                                    <input type="text" placeholder="10 haneli VKN" value={newCompanyVkn} onChange={(e) => setNewCompanyVkn(e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-500 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200" />
                                 </div>
                                 <div className="flex justify-end space-x-2 pt-2">
                                     <button onClick={() => setIsCreatingCompany(false)} className="px-3 py-1.5 rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold text-sm">İptal</button>
                                     <button onClick={handleSaveCompany} className="px-3 py-1.5 rounded-md text-white bg-red-600 hover:bg-red-700 font-semibold text-sm">Firma Oluştur</button>
                                 </div>
                             </div>
                         )}
                    </div>
                    {!isCreatingCompany && (
                        <div className="space-y-4 mt-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Denetim Başlığı</label>
                                <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn: 2024 Q1 KDV İade Denetimi" className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Başlangıç Tarihi</label>
                                    <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200" />
                                </div>
                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Bitiş Tarihi</label>
                                    <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                 {!isCreatingCompany && (
                    <div className="mt-8 flex justify-end space-x-4">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 font-semibold">İptal</button>
                        <button onClick={handleSubmit} className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700 font-semibold flex items-center">
                            <CheckIcon className="w-5 h-5 mr-2" /> Denetimi Oluştur
                        </button>
                    </div>
                 )}
            </div>
        </div>
    );
}

const AuditCenter: React.FC<AuditCenterProps> = ({ setActiveAudit }) => {
    const [audits, setAudits] = useState<Audit[]>(mockAudits);
    const [companies, setCompanies] = useState<AuditedCompany[]>(mockCompanies);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSaveAudit = (newAuditData: Omit<Audit, 'id'>) => {
        const newAudit: Audit = {
            id: `AUD-${String(audits.length + 1).padStart(3, '0')}`,
            ...newAuditData,
        };
        setAudits(prev => [newAudit, ...prev]);
        setIsModalOpen(false);
        setActiveAudit(newAudit); // Set the new audit as active
    };

    const handleAddCompany = (newCompanyData: Omit<AuditedCompany, 'id'>) => {
        const newCompany: AuditedCompany = {
            id: `COMP-${String(companies.length + 1).padStart(3, '0')}`,
            ...newCompanyData
        };
        setCompanies(prev => [newCompany, ...prev]);
        return newCompany;
    };

    const getCompanyName = (companyId: string) => {
        return companies.find(c => c.id === companyId)?.name || 'Bilinmeyen Firma';
    }

    const activeAudits = audits.filter(a => a.status === AuditStatus.Active);
    const completedAudits = audits.filter(a => a.status === AuditStatus.Completed);

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                 <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Tüm Denetimler</h2>
                 <button onClick={() => setIsModalOpen(true)} className="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors shadow-md flex items-center">
                    <BriefcaseIcon className="w-5 h-5 mr-2" />
                    Yeni Denetim Başlat
                </button>
            </div>

            <div>
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Aktif Denetimler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeAudits.map(audit => (
                        <Card key={audit.id} className="hover:shadow-xl hover:-translate-y-1 transition-transform duration-300">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{audit.title}</h4>
                                <AuditStatusBadge status={audit.status} />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{getCompanyName(audit.companyId)}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">{audit.startDate} - {audit.endDate}</p>
                            <button onClick={() => setActiveAudit(audit)} className="w-full mt-6 bg-gray-800 text-white dark:bg-gray-700 dark:hover:bg-gray-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-900 transition-colors">
                                Denetime Git
                            </button>
                        </Card>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Tamamlanmış Denetimler</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {completedAudits.map(audit => (
                        <Card key={audit.id} className="opacity-70">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">{audit.title}</h4>
                                <AuditStatusBadge status={audit.status} />
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">{getCompanyName(audit.companyId)}</p>
                             <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">{audit.startDate} - {audit.endDate}</p>
                             <button className="w-full mt-6 bg-gray-200 text-gray-700 dark:bg-gray-600 font-bold py-2 px-4 rounded-lg cursor-not-allowed">
                                Arşivi Görüntüle
                            </button>
                        </Card>
                    ))}
                </div>
            </div>
            
            {isModalOpen && <NewAuditModal onClose={() => setIsModalOpen(false)} onSave={handleSaveAudit} companies={companies} onAddCompany={handleAddCompany} />}
        </div>
    );
};

export default AuditCenter;