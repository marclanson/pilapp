import React, { useState, useMemo } from 'https://esm.sh/react@^19.1.1';
import { TicketType, ClientStatus } from '../types.js';
import { Trash2, X } from 'https://esm.sh/lucide-react@^0.539.0';

const AttendanceScreen = ({ data }) => {
    const { clients, purchasedPacks, packTemplates, attendanceRecords, recordAttendance, deleteAttendance } = data;
    const [classDate, setClassDate] = useState(new Date().toISOString().split('T')[0]);
    const [classType, setClassType] = useState(TicketType.GROUP);
    const [selectedClients, setSelectedClients] = useState(new Set());
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
    
    const addSelectedClient = (clientId) => {
        setSelectedClients(prev => new Set(prev).add(clientId));
        setSearchTerm('');
    };

    const removeSelectedClient = (clientId) => {
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

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedClients.size === 0) {
            alert('Please select at least one client.');
            return;
        }
        recordAttendance(new Date(classDate), classType, Array.from(selectedClients));
        setSelectedClients(new Set());
    };
    
    const handleDelete = (recordId) => {
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 sticky top-28">
                    <h2 className="text-2xl font-bold text-primary-dark mb-6">Record Attendance</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Class Date</label>
                            <input type="date" value={classDate} onChange={e => setClassDate(e.target.value)} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Class Type</label>
                            <select value={classType} onChange={e => { setClassType(e.target.value); setSelectedClients(new Set()); }} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-accent focus:border-accent">
                                <option value={TicketType.GROUP}>Group</option>
                                <option value={TicketType.PRIVATE}>Private</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="attendee-search" className="block text-sm font-medium text-slate-700">Attendees</label>
                            <div className="mt-1 relative">
                                <div className="w-full p-2 border border-slate-300 rounded-md flex flex-wrap gap-2 min-h-[42px] items-center focus-within:ring-2 focus-within:ring-accent focus-within:border-accent">
                                    {selectedClientObjects.map(client => (
                                        <span key={client.id} className="bg-primary-dark text-white flex items-center gap-2 px-2.5 py-1 text-sm rounded-full">
                                            {client.firstName} {client.lastName}
                                            <button type="button" onClick={() => removeSelectedClient(client.id)} className="rounded-full hover:bg-primary transition-colors">
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
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl">
                                        <ul className="max-h-60 overflow-y-auto">
                                            {searchResults.length > 0 ? searchResults.map(client => (
                                                <li 
                                                    key={client.id} 
                                                    className="p-2 px-3 hover:bg-slate-100 cursor-pointer text-sm"
                                                    onMouseDown={(e) => { // use onMouseDown to prevent input blur before click registers
                                                        e.preventDefault();
                                                        addSelectedClient(client.id);
                                                    }}
                                                >
                                                    {client.firstName} {client.lastName}
                                                </li>
                                            )) : (
                                                <li className="p-2 px-3 text-sm text-slate-500">No matching eligible clients found.</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                         <button type="submit" className="w-full mt-6 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark font-semibold">
                           Record Attendance ({selectedClients.size})
                        </button>
                    </form>
                </div>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200/80">
                <h2 className="text-2xl font-bold text-primary-dark mb-6">Attendance History</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                                <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Class Type</th>
                                <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                         <tbody className="bg-white">
                            {recordsWithClientInfo.map(record => (
                                <tr key={record.id} className="border-b border-slate-200">
                                    <td className="p-4 whitespace-nowrap text-sm text-slate-800">{new Date(record.classDate).toLocaleDateString()}</td>
                                    <td className="p-4 whitespace-nowrap text-sm text-slate-800 font-medium">{record.client?.firstName} {record.client?.lastName}</td>
                                    <td className="p-4 whitespace-nowrap text-sm text-slate-500 capitalize">{record.classType}</td>
                                    <td className="p-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(record.id)} className="text-slate-400 hover:text-red-500 p-1">
                                            <Trash2 className="h-5 w-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {recordsWithClientInfo.length === 0 && <p className="text-center text-slate-500 py-8">No attendance records found.</p>}
            </div>
        </div>
    );
};

export default AttendanceScreen;