import React, { useState, useMemo } from 'react';
import { AppData } from '../hooks/useAppData';
import { TicketType, ClientStatus, AttendanceRecord, Client } from '../types';
import { Trash2, X } from 'lucide-react';

const AttendanceScreen: React.FC<{ data: AppData }> = ({ data }) => {
    const { clients, purchasedPacks, packTemplates, attendanceRecords, recordAttendance, deleteAttendance } = data;
    const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
    const [classType, setClassType] = useState<TicketType>(TicketType.GROUP);
    const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');

    const eligibleClients = useMemo(() => {
        const date = new Date(classDate);
        return clients.filter(client => {
            if (client.status !== ClientStatus.ACTIVE) return false;
            
            return purchasedPacks.some(pack => {
                const template = packTemplates.find(t => t.id === pack.templateId);
                return pack.clientId === client.id &&
                       template?.ticketType === classType &&
                       pack.ticketsRemaining > 0 &&
                       new Date(pack.expiryDate) >= date;
            });
        });
    }, [classDate, classType, clients, purchasedPacks, packTemplates]);
    
    const addSelectedClient = (clientId: string) => {
        setSelectedClients(prev => new Set(prev).add(clientId));
        setSearchTerm('');
    };

    const removeSelectedClient = (clientId: string) => {
        setSelectedClients(prev => {
            const newSet = new Set(prev);
            newSet.delete(clientId);
            return newSet;
        });
    };
    
    const searchResults = useMemo(() => {
        if (!searchTerm.trim()) return [];
        
        return eligibleClients.filter(client => 
            !selectedClients.has(client.id) &&
            `${client.firstName} ${client.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, eligibleClients, selectedClients]);

    const selectedClientObjects = useMemo(() => {
        return clients.filter(c => selectedClients.has(c.id))
            .sort((a,b) => a.lastName.localeCompare(b.lastName));
    }, [selectedClients, clients]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedClients.size === 0) {
            alert('Please select at least one client.');
            return;
        }
        recordAttendance(new Date(classDate), classType, Array.from(selectedClients));
        setSelectedClients(new Set());
    };
    
    const handleDelete = (recordId: string) => {
        if (window.confirm('Are you sure you want to delete this attendance record? This will restore the ticket to the client.')) {
            deleteAttendance(recordId);
        }
    };

    const recordsWithClientInfo = useMemo(() => {
        return attendanceRecords
            .map(record => ({
                ...record,
                client: clients.find(c => c.id === record.clientId)
            }))
            .sort((a,b) => new Date(b.classDate).getTime() - new Date(a.classDate).getTime());
    }, [attendanceRecords, clients]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Record Attendance</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class Date</label>
                            <input type="date" value={classDate} onChange={e => setClassDate(e.target.value)} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Class Type</label>
                            <select value={classType} onChange={e => { setClassType(e.target.value as TicketType); setSelectedClients(new Set()); }} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                <option value={TicketType.GROUP}>Group</option>
                                <option value={TicketType.PRIVATE}>Private</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="attendee-search" className="block text-sm font-medium text-gray-700">Attendees</label>
                            <div className="mt-1 relative">
                                <div className="w-full p-2 border border-gray-300 rounded-md flex flex-wrap gap-2 min-h-[42px] items-center">
                                    {selectedClientObjects.map(client => (
                                        <span key={client.id} className="bg-primary text-white flex items-center gap-2 px-2 py-1 text-sm rounded-full">
                                            {client.firstName} {client.lastName}
                                            <button type="button" onClick={() => removeSelectedClient(client.id)} className="rounded-full hover:bg-primary-dark transition-colors">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        id="attendee-search"
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        placeholder={selectedClients.size === 0 ? "Search for attendees..." : ""}
                                        className="flex-grow bg-transparent border-none focus:ring-0 p-0 text-sm"
                                    />
                                </div>
                                {searchTerm.trim() && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                        <ul className="max-h-60 overflow-y-auto">
                                            {searchResults.length > 0 ? searchResults.map(client => (
                                                <li 
                                                    key={client.id} 
                                                    className="p-3 hover:bg-gray-100 cursor-pointer text-sm"
                                                    onMouseDown={(e) => { // use onMouseDown to prevent input blur before click registers
                                                        e.preventDefault();
                                                        addSelectedClient(client.id);
                                                    }}
                                                >
                                                    {client.firstName} {client.lastName}
                                                </li>
                                            )) : (
                                                <li className="p-3 text-sm text-gray-500">No matching eligible clients found.</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                         <button type="submit" className="w-full mt-6 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark">
                           Record Attendance ({selectedClients.size})
                        </button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Attendance History</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Type</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {recordsWithClientInfo.map(record => (
                                <tr key={record.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(record.classDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.client?.firstName} {record.client?.lastName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{record.classType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(record.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-5 w-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {recordsWithClientInfo.length === 0 && <p className="text-center text-gray-500 py-8">No attendance records found.</p>}
            </div>
        </div>
    );
};

export default AttendanceScreen;
