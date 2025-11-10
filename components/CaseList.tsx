
import React from 'react';
import { mockCases } from '../services/mockData';
import Card from './shared/Card';
import Badge from './shared/Badge';

const CaseList: React.FC = () => {
  return (
    <div className="p-8">
      <Card>
        <table className="w-full text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Vaka ID</th>
              <th scope="col" className="px-6 py-3">Başlık</th>
              <th scope="col" className="px-6 py-3">Durum</th>
              <th scope="col" className="px-6 py-3">Atanan</th>
              <th scope="col" className="px-6 py-3">Risk</th>
              <th scope="col" className="px-6 py-3">Oluşturulma Tarihi</th>
            </tr>
          </thead>
          <tbody>
            {mockCases.map((caseItem) => (
              <tr 
                key={caseItem.id} 
                className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
              >
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{caseItem.id}</td>
                <td className="px-6 py-4">{caseItem.title}</td>
                <td className="px-6 py-4"><Badge type={caseItem.status} /></td>
                <td className="px-6 py-4">{caseItem.assignee}</td>
                <td className="px-6 py-4"><Badge type={caseItem.severity} /></td>
                <td className="px-6 py-4">{caseItem.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default CaseList;
