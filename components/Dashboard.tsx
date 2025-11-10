import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockAnomalies, dashboardStats } from '../services/mockData';
import { AnomalySeverity, AnomalyDomain } from '../types';
import Card from './shared/Card';
import { AlertTriangleIcon, ScaleIcon, ArchiveIcon } from './icons';
import Badge from './shared/Badge';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; description: string; }> = ({ title, value, icon, description }) => (
    <Card className="flex flex-col">
        <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">{title}</h4>
            {icon}
        </div>
        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </Card>
);

const Dashboard: React.FC = () => {
    const anomalyStats = useMemo(() => {
        // FIX: The type of `stats.byDomain` was being inferred incorrectly as `{}`, causing a type error.
        // By initializing `byDomain` as a separate constant, TypeScript can correctly infer its
        // specific shape, resolving the error when accessing `stats.byDomain[anomaly.domain].count`.
        const byDomain = {
            [AnomalyDomain.VAT]: { count: 0 },
            [AnomalyDomain.Invoice]: { count: 0 },
            [AnomalyDomain.Payroll]: { count: 0 },
            [AnomalyDomain.Bank]: { count: 0 },
        };
        const stats = {
            bySeverity: {
                [AnomalySeverity.High]: { count: 0, amount: 0 },
                [AnomalySeverity.Medium]: { count: 0, amount: 0 },
                [AnomalySeverity.Low]: { count: 0, amount: 0 },
            },
            byDomain: byDomain,
            totalAmount: 0,
        };

        for (const anomaly of mockAnomalies) {
            stats.bySeverity[anomaly.severity].count++;
            stats.bySeverity[anomaly.severity].amount += anomaly.amount;
            stats.byDomain[anomaly.domain].count++;
            stats.totalAmount += anomaly.amount;
        }

        return stats;
    }, []);

    const domainChartData = Object.entries(anomalyStats.byDomain).map(([name, { count }]) => ({
        name,
        'Anomali Sayısı': count,
    }));
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);

    return (
        <div className="p-8 space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Anomali Raporu Özeti</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard 
                    title="Toplam Anomali" 
                    value={String(mockAnomalies.length)}
                    description="Tüm denetimlerde bulunan toplam bulgu"
                    icon={<AlertTriangleIcon className="w-8 h-8 text-red-500" />} 
                />
                 <StatCard 
                    title="Toplam Risk Tutarı" 
                    value={formatCurrency(anomalyStats.totalAmount)}
                    description="Anomalilerle ilişkili toplam finansal etki"
                    icon={<ScaleIcon className="w-8 h-8 text-yellow-500" />} 
                />
                 <StatCard 
                    title="Yüksek Riskli Bulgular" 
                    value={String(anomalyStats.bySeverity[AnomalySeverity.High].count)}
                    description="Acil inceleme gerektiren kritik bulgular"
                    icon={<AlertTriangleIcon className="w-8 h-8 text-red-700" />} 
                />
                 <StatCard 
                    title="Açık Vaka Sayısı" 
                    value={String(dashboardStats.openCases)}
                    description="Şu anda incelenmekte olan vaka sayısı"
                    icon={<ArchiveIcon className="w-8 h-8 text-blue-500" />} 
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Riske Göre Anomali Dağılımı">
                    <div className="space-y-4">
                        {(Object.keys(anomalyStats.bySeverity) as AnomalySeverity[]).map((severity) => (
                            <div key={severity}>
                                <div className="flex justify-between items-center mb-1">
                                    <Badge type={severity} />
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">{anomalyStats.bySeverity[severity].count} adet</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div 
                                        className={`h-2.5 rounded-full ${
                                            severity === AnomalySeverity.High ? 'bg-red-600' :
                                            severity === AnomalySeverity.Medium ? 'bg-yellow-500' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${(anomalyStats.bySeverity[severity].count / mockAnomalies.length) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-right text-sm font-bold text-gray-800 dark:text-gray-100 mt-1">
                                    {formatCurrency(anomalyStats.bySeverity[severity].amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Alana Göre Anomali Dağılımı">
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={domainChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                            <XAxis dataKey="name" stroke="#9ca3af"/>
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1f2937',
                                    borderColor: '#374151'
                                }}
                                itemStyle={{ color: '#d1d5db' }}
                                cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}
                             />
                            <Bar dataKey="Anomali Sayısı" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;