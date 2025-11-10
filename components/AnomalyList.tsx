
import React, { useState } from 'react';
import { mockAnomalies } from '../services/mockData';
import { Anomaly, AnomalyDomain, AnomalySeverity } from '../types';
import Card from './shared/Card';
import Badge from './shared/Badge';

const AnomalyDetailPanel: React.FC<{ anomaly: Anomaly; onClose: () => void }> = ({ anomaly, onClose }) => {
    return (
        <div className="fixed top-0 right-0 h-full w-full md:w-1/3 bg-white dark:bg-gray-800 shadow-2xl z-20 p-8 transform transition-transform duration-300 ease-in-out" style={{ transform: 'translateX(0%)' }}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Anomali Detayı</h3>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">&times;</button>
            </div>
            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p><strong>ID:</strong> {anomaly.id}</p>
                <p><strong>Açıklama:</strong> {anomaly.description}</p>
                <p><strong>Alan:</strong> <Badge type={anomaly.domain} /></p>
                <p><strong>Risk Seviyesi:</strong> <Badge type={anomaly.severity} /></p>
                <p><strong>Tarih:</strong> {anomaly.date}</p>
                <p><strong>Tutar:</strong> {Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(anomaly.amount)}</p>
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-bold mb-2">Detaylar</h4>
                    <ul className="list-disc list-inside space-y-1">
                        {Object.entries(anomaly.details).map(([key, value]) => (
                            <li key={key}><strong>{key}:</strong> {value}</li>
                        ))}
                    </ul>
                </div>
                <div className="pt-6">
                    <button className="w-full bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                        Vaka Oluştur
                    </button>
                </div>
            </div>
        </div>
    );
};


const AnomalyList: React.FC = () => {
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  return (
    <div className="p-8">
        <Card>
            <table className="w-full text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">ID</th>
                        <th scope="col" className="px-6 py-3">Açıklama</th>
                        <th scope="col" className="px-6 py-3">Alan</th>
                        <th scope="col" className="px-6 py-3">Risk</th>
                        <th scope="col" className="px-6 py-3">Tarih</th>
                        <th scope="col" className="px-6 py-3 text-right">Tutar</th>
                    </tr>
                </thead>
                <tbody>
                    {mockAnomalies.map((anomaly) => (
                        <tr 
                            key={anomaly.id} 
                            className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
                            onClick={() => setSelectedAnomaly(anomaly)}
                        >
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{anomaly.id}</td>
                            <td className="px-6 py-4">{anomaly.description}</td>
                            <td className="px-6 py-4"><Badge type={anomaly.domain} /></td>
                            <td className="px-6 py-4"><Badge type={anomaly.severity} /></td>
                            <td className="px-6 py-4">{anomaly.date}</td>
                            <td className="px-6 py-4 text-right">{Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(anomaly.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
        {selectedAnomaly && <AnomalyDetailPanel anomaly={selectedAnomaly} onClose={() => setSelectedAnomaly(null)} />}
        {selectedAnomaly && <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={() => setSelectedAnomaly(null)}></div>}
    </div>
  );
};

export default AnomalyList;
