import React, { useState } from 'react';
import { ChevronDownIcon, BellIcon, UserCircleIcon, BriefcaseIcon } from './icons';
import { Audit, AuditedCompany } from '../types';

interface HeaderProps {
    title: string;
    activeAudit: Audit | null;
    auditedCompanies: AuditedCompany[];
}

const Header: React.FC<HeaderProps> = ({ title, activeAudit, auditedCompanies }) => {
    const [isProfileOpen, setProfileOpen] = useState(false);
    
    const getCompanyName = (companyId: string) => {
        return auditedCompanies.find(c => c.id === companyId)?.name || 'Bilinmeyen Firma';
    }

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md h-20 flex items-center justify-between px-8">
            <div className="flex flex-col">
                 <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                 {activeAudit && (
                    <div className="flex items-center text-sm text-red-600 dark:text-red-400 font-semibold mt-1">
                        <BriefcaseIcon className="h-4 w-4 mr-2" />
                        <span>Aktif Denetim: {activeAudit.title} ({getCompanyName(activeAudit.companyId)})</span>
                    </div>
                 )}
            </div>
            <div className="flex items-center space-x-6">
                <div className="relative">
                    <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                        <BellIcon className="h-6 w-6" />
                    </button>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </div>

                <div className="relative">
                    <button onClick={() => setProfileOpen(!isProfileOpen)} className="flex items-center space-x-2">
                        <UserCircleIcon className="h-9 w-9 text-gray-600 dark:text-gray-300" />
                        <span className="hidden md:inline font-medium text-gray-700 dark:text-gray-200">Denetmen Yılmaz</span>
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    </button>
                    {isProfileOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10">
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Profil</a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Ayarlar</a>
                            <a href="#" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600">Çıkış Yap</a>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;