import React from 'react';
import { DashboardIcon, BriefcaseIcon, AlertTriangleIcon, ArchiveIcon, CodeIcon } from './icons';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Pano', icon: DashboardIcon },
    { id: 'auditCenter', label: 'Denetim Merkezi', icon: BriefcaseIcon },
    { id: 'anomalies', label: 'Anomaliler', icon: AlertTriangleIcon },
    { id: 'cases', label: 'Vakalar', icon: ArchiveIcon },
    { id: 'rules', label: 'Kurallar', icon: CodeIcon },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col fixed h-full">
      <div className="h-20 flex items-center justify-center border-b border-gray-800">
        <AlertTriangleIcon className="h-8 w-8 text-red-500" />
        <h1 className="text-xl font-bold ml-2 text-white">Vergi Radar</h1>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul>
          {navItems.map((item) => (
            <li key={item.id} className="mb-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView(item.id);
                }}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  activeView === item.id
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;