

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Bulgu, BulguSeverity, BulguDomain } from '../types';
import Card from './shared/Card';
import { AlertTriangle, Scale, Archive, GripVertical } from 'lucide-react';
import Badge from './shared/Badge';
import * as api from '../services/api';

const ResponsiveGridLayout = WidthProvider(Responsive);

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <>
        <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">{title}</h4>
            {icon}
        </div>
        <p className="text-4xl font-bold text-gray-800 dark:text-gray-100 mt-2">{value}</p>
    </>
);

const Dashboard: React.FC = () => {
    const [bulgular, setBulgular] = useState<Bulgu[]>([]);
    const [stats, setStats] = useState<{ openCases: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

     useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [bulgularData, statsData] = await Promise.all([
                    api.getBulgular(),
                    api.getDashboardStats(),
                ]);
                setBulgular(bulgularData);
                setStats(statsData);
                setError(null);
            } catch (err: any) {
                setError('Pano verileri yüklenemedi: ' + err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatCurrency = (value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

    const layout = [
        { i: 'a', x: 0, y: 0, w: 3, h: 1 },
        { i: 'b', x: 3, y: 0, w: 3, h: 1 },
        { i: 'c', x: 6, y: 0, w: 3, h: 1 },
        { i: 'd', x: 9, y: 0, w: 3, h: 1 },
        { i: 'e', x: 0, y: 1, w: 6, h: 3 },
        { i: 'f', x: 6, y: 1, w: 6, h: 3 },
        { i: 'g', x: 0, y: 4, w: 12, h: 4 },
    ];
    
    if (loading) return <div className="p-8">Pano verileri yükleniyor...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;

    const bulguStats = {
            totalAmount: bulgular.reduce((sum, b) => sum + b.amount, 0),
            highSeverityCount: bulgular.filter(b => b.severity === BulguSeverity.High).length,
    };
    
    const domainChartData = Object.values(BulguDomain).map(domain => ({
        name: domain,
        'Bulgu Sayısı': bulgular.filter(b => b.domain === domain).length,
    }));
    
    const severityData = Object.values(BulguSeverity).map(severity => ({
        name: severity,
        count: bulgular.filter(b => b.severity === severity).length,
        amount: bulgular.filter(b => b.severity === severity).reduce((sum, b) => sum + b.amount, 0),
        fill: severity === BulguSeverity.High ? '#dc2626' : severity === BulguSeverity.Medium ? '#f59e0b' : '#3b82f6',
    }));

    const latestBulgular = [...bulgular].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);


    return (
        <div className="p-8">
            <ResponsiveGridLayout className="layout" layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={100}
                draggableHandle=".drag-handle">
                
                <div key="a" className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col">
                    <StatCard 
                        title="Toplam Bulgu" 
                        value={String(bulgular.length)}
                        icon={<AlertTriangle className="w-8 h-8 text-red-500 drag-handle cursor-move" />} 
                    />
                </div>
                <div key="b" className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col">
                     <StatCard 
                        title="Toplam Risk Tutarı" 
                        value={formatCurrency(bulguStats.totalAmount).replace('₺','')}
                        icon={<Scale className="w-8 h-8 text-yellow-500 drag-handle cursor-move" />} 
                    />
                </div>
                 <div key="c" className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col">
                     <StatCard 
                        title="Yüksek Riskli Bulgular" 
                        value={String(bulguStats.highSeverityCount)}
                        icon={<AlertTriangle className="w-8 h-8 text-red-700 drag-handle cursor-move" />} 
                    />
                </div>
                 <div key="d" className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col">
                     <StatCard 
                        title="Açık Vaka Sayısı" 
                        value={String(stats?.openCases || 0)}
                        icon={<Archive className="w-8 h-8 text-blue-500 drag-handle cursor-move" />} 
                    />
                </div>

                <div key="e" className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col">
                    <div className="flex justify-between items-center drag-handle cursor-move mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Riske Göre Bulgu Dağılımı</h3>
                        <GripVertical className="text-gray-400" />
                    </div>
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={severityData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis type="number" stroke="#9ca3af" />
                            <YAxis type="category" dataKey="name" stroke="#9ca3af" width={50} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                                itemStyle={{ color: '#d1d5db' }}
                                cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}
                                formatter={(value) => `${value} adet`}
                             />
                            <Bar dataKey="count" fill="#8884d8" background={{ fill: '#eee' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                 <div key="f" className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col">
                    <div className="flex justify-between items-center drag-handle cursor-move mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Alana Göre Bulgu Dağılımı</h3>
                        <GripVertical className="text-gray-400" />
                    </div>
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={domainChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" stroke="#9ca3af"/>
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                                itemStyle={{ color: '#d1d5db' }}
                                cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}
                             />
                            <Bar dataKey="Bulgu Sayısı" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div key="g" className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col">
                     <div className="flex justify-between items-center drag-handle cursor-move mb-4">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Son Bulgular</h3>
                        <GripVertical className="text-gray-400" />
                    </div>
                    <div className="overflow-auto">
                        <table className="w-full text-left text-gray-500 dark:text-gray-400">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th scope="col" className="px-4 py-2">Açıklama</th>
                                    <th scope="col" className="px-4 py-2">Risk</th>
                                    <th scope="col" className="px-4 py-2">Tarih</th>
                                    <th scope="col" className="px-4 py-2 text-right">Tutar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {latestBulgular.map((bulgu) => (
                                    <tr key={bulgu.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{bulgu.description}</td>
                                        <td className="px-4 py-3"><Badge type={bulgu.severity} /></td>
                                        <td className="px-4 py-3">{bulgu.date}</td>
                                        <td className="px-4 py-3 text-right font-mono">{formatCurrency(bulgu.amount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>

            </ResponsiveGridLayout>
        </div>
    );
};

export default Dashboard;