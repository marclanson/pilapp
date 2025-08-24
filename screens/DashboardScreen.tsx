
import React, { useMemo } from 'react';
import { AppData } from '../hooks/useAppData';
import { TicketType } from '../types';
import { DollarSign, Ticket, Clock, AlertTriangle } from 'lucide-react';

interface DashboardScreenProps {
  data: AppData;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string | number; color: string; }> = ({ icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`rounded-full p-3 mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const DashboardScreen: React.FC<DashboardScreenProps> = ({ data }) => {
    const { clients, purchasedPacks, attendanceRecords, packTemplates } = data;

    const stats = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const totalSales = purchasedPacks
            .filter(p => new Date(p.purchaseDate) >= thirtyDaysAgo)
            .reduce((sum, p) => sum + p.purchasePrice, 0);

        const totalTicketsUsed = attendanceRecords
            .filter(a => new Date(a.classDate) >= thirtyDaysAgo)
            .length;

        return { totalSales, totalTicketsUsed };
    }, [purchasedPacks, attendanceRecords]);

    const expiringPacks = useMemo(() => {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        const today = new Date();

        return purchasedPacks
            .filter(p => {
                const expiryDate = new Date(p.expiryDate);
                return expiryDate >= today && expiryDate <= thirtyDaysFromNow && p.ticketsRemaining > 0;
            })
            .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
            .map(p => {
                const client = clients.find(c => c.id === p.clientId);
                const template = packTemplates.find(t => t.id === p.templateId);
                return { ...p, client, template };
            });
    }, [purchasedPacks, clients, packTemplates]);
    
    const lowBalanceClients = useMemo(() => {
        const today = new Date();
        return purchasedPacks
            .filter(p => p.ticketsRemaining === 1 && new Date(p.expiryDate) >= today)
            .map(p => {
                const client = clients.find(c => c.id === p.clientId);
                const template = packTemplates.find(t => t.id === p.templateId);
                return { ...p, client, template };
            });
    }, [purchasedPacks, clients, packTemplates]);

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <StatCard 
                    icon={<DollarSign className="h-6 w-6 text-white"/>} 
                    title="Total Sales (Last 30 Days)" 
                    value={`$${stats.totalSales.toFixed(2)}`}
                    color="bg-green-500"
                />
                 <StatCard 
                    icon={<Ticket className="h-6 w-6 text-white"/>} 
                    title="Tickets Used (Last 30 Days)" 
                    value={stats.totalTicketsUsed}
                    color="bg-blue-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <Clock className="h-6 w-6 mr-2 text-accent" />
                        Packs Expiring in Next 30 Days
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {expiringPacks.length > 0 ? expiringPacks.map(p => (
                            <div key={p.id} className="p-3 bg-secondary rounded-md">
                                <p className="font-semibold text-gray-800">{p.client?.firstName} {p.client?.lastName}</p>
                                <p className="text-sm text-gray-600">{p.template?.name}</p>
                                <div className="flex justify-between items-baseline text-sm mt-1">
                                    <span className="font-medium text-primary">Tickets: {p.ticketsRemaining}</span>
                                    <span className="text-red-600">Expires: {new Date(p.expiryDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        )) : <p className="text-gray-500">No packs expiring soon.</p>}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
                        <AlertTriangle className="h-6 w-6 mr-2 text-yellow-500" />
                        Critical Low Balance (1 Ticket Left)
                    </h3>
                     <div className="space-y-3 max-h-96 overflow-y-auto">
                        {lowBalanceClients.length > 0 ? lowBalanceClients.map(p => (
                            <div key={p.id} className="p-3 bg-secondary rounded-md">
                                <p className="font-semibold text-gray-800">{p.client?.firstName} {p.client?.lastName}</p>
                                <p className="text-sm text-gray-600">{p.template?.name}</p>
                            </div>
                        )) : <p className="text-gray-500">No clients with a critically low balance.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardScreen;
