
import React, { useState } from 'react';
import { AppData } from '../hooks/useAppData';
import { Client, ClientStatus, PurchasedPack, TicketPackTemplate } from '../types';
import { PlusCircle, Edit, History } from 'lucide-react';

const ClientFormModal: React.FC<{
    client: Client | null;
    onSave: (client: Client) => void;
    onClose: () => void;
    onToggleStatus: (client: Client) => void;
}> = ({ client, onSave, onClose, onToggleStatus }) => {
    const [formData, setFormData] = useState<Omit<Client, 'id' | 'status'>>({
        firstName: client?.firstName || '',
        lastName: client?.lastName || '',
        email: client?.email || '',
        phone: client?.phone || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: client?.id || '', status: client?.status || ClientStatus.ACTIVE });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-primary-dark">{client ? 'Edit Client' : 'Add New Client'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">First Name</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"/>
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Last Name</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"/>
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"/>
                    </div>
                     <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"/>
                    </div>
                    <div className="flex justify-between items-center pt-6">
                        <div>
                             {client && (
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        onToggleStatus(client);
                                        onClose();
                                    }}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        client.status === ClientStatus.ACTIVE
                                            ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    }`}
                                >
                                    {client.status === ClientStatus.ACTIVE ? 'Set to Inactive' : 'Set to Active'}
                                </button>
                            )}
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold">Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-primary-dark text-white rounded-md hover:bg-primary font-semibold">Save Client</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

const PurchaseFormModal: React.FC<{
    client: Client;
    templates: TicketPackTemplate[];
    onSave: (clientId: string, templateId: string, purchaseDate: Date) => void;
    onClose: () => void;
}> = ({ client, templates, onSave, onClose }) => {
    const [templateId, setTemplateId] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!templateId) {
            alert('Please select a pack template.');
            return;
        }
        onSave(client.id, templateId, new Date(purchaseDate));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-primary-dark">Record Purchase for {client.firstName}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="templateId" className="block text-sm font-medium text-slate-700">Ticket Pack</label>
                        <select name="templateId" value={templateId} onChange={e => setTemplateId(e.target.value)} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-accent focus:border-accent">
                            <option value="">Select a pack</option>
                            {templates.filter(t => t.status === 'active').map(t => (
                                <option key={t.id} value={t.id}>{t.name} - ${t.price}</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="purchaseDate" className="block text-sm font-medium text-slate-700">Purchase Date</label>
                        <input type="date" name="purchaseDate" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"/>
                    </div>
                     <div className="flex justify-end space-x-4 pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark font-semibold">Record Purchase</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ClientDetailView: React.FC<{
    client: Client;
    packs: (PurchasedPack & { template?: TicketPackTemplate })[];
    templates: TicketPackTemplate[];
    onBack: () => void;
    onRecordPurchase: (clientId: string, templateId: string, purchaseDate: Date) => void;
    onUpdateExpiry: (packId: string, newExpiry: Date) => void;
}> = ({ client, packs, templates, onBack, onRecordPurchase, onUpdateExpiry }) => {
    const [purchasing, setPurchasing] = useState(false);
    const [editingExpiryPackId, setEditingExpiryPackId] = useState<string | null>(null);
    const [newExpiryDate, setNewExpiryDate] = useState('');

    const handleEditExpiry = (pack: PurchasedPack) => {
        setEditingExpiryPackId(pack.id);
        setNewExpiryDate(new Date(pack.expiryDate).toISOString().split('T')[0]);
    };
    
    const handleSaveExpiry = () => {
        if (editingExpiryPackId && newExpiryDate) {
            onUpdateExpiry(editingExpiryPackId, new Date(newExpiryDate));
            setEditingExpiryPackId(null);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200/80">
            <button onClick={onBack} className="mb-6 text-accent hover:underline font-semibold">← Back to Client List</button>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-4 sm:mb-0">
                    <h2 className="text-3xl font-bold text-primary-dark">{client.firstName} {client.lastName}</h2>
                    <p className="text-slate-500">{client.email} | {client.phone}</p>
                </div>
                 <button onClick={() => setPurchasing(true)} className="flex items-center px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark font-semibold">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Record Purchase
                </button>
            </div>
            <div className="mt-8">
                <h3 className="text-xl font-semibold text-primary-dark mb-4">Purchased Packs</h3>
                <div className="space-y-4">
                    {packs.length > 0 ? packs.map(pack => {
                        const getPackStatus = (p: PurchasedPack) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            if (new Date(p.expiryDate) < today) {
                                return { text: 'Expired', color: 'bg-slate-200 text-slate-800' };
                            }
                            if (p.ticketsRemaining <= 0) {
                                return { text: 'Used', color: 'bg-amber-100 text-amber-800' };
                            }
                            return { text: 'Active', color: 'bg-emerald-100 text-emerald-800' };
                        };
                        const status = getPackStatus(pack);

                        return (
                            <div key={pack.id} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-lg text-primary-dark">{pack.template?.name}</p>
                                        <p className="text-sm text-slate-500 capitalize">{pack.template?.ticketType} Tickets</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                        {status.text}
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500">Purchased</p>
                                        <p className="font-semibold text-primary-dark">{new Date(pack.purchaseDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Expires</p>
                                        <p className="font-semibold text-primary-dark">{new Date(pack.expiryDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="col-span-2 sm:col-span-1">
                                        <div className="flex justify-between items-baseline">
                                            <span className="text-slate-500">Tickets Remaining</span>
                                            <span className="font-semibold text-primary-dark text-lg">{pack.ticketsRemaining} / {pack.initialTickets}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 mt-1">
                                            <div
                                                className="bg-accent h-2.5 rounded-full transition-all duration-500"
                                                style={{ width: `${pack.initialTickets > 0 ? (pack.ticketsRemaining / pack.initialTickets) * 100 : 0}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <div className="flex justify-between items-center">
                                        <details>
                                            <summary className="cursor-pointer text-accent font-medium flex items-center text-sm">
                                                <History className="h-4 w-4 mr-2"/>
                                                View History
                                            </summary>
                                            <ul className="mt-2 space-y-1 text-sm text-slate-600 pl-6 list-disc">
                                                {pack.history.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                                                    <li key={log.id}>
                                                        <strong>{new Date(log.date).toLocaleDateString()}:</strong> {log.details}
                                                    </li>
                                                ))}
                                            </ul>
                                        </details>
                                        
                                        <div>
                                            {editingExpiryPackId === pack.id ? (
                                                <div className="flex justify-end items-center space-x-2">
                                                    <input type="date" value={newExpiryDate} onChange={e => setNewExpiryDate(e.target.value)} className="border-slate-300 rounded-md shadow-sm text-sm p-1" />
                                                    <button onClick={handleSaveExpiry} className="px-3 py-1 bg-primary-dark text-white text-xs rounded-md font-semibold">Save</button>
                                                    <button onClick={() => setEditingExpiryPackId(null)} className="px-3 py-1 bg-slate-200 text-xs rounded-md font-semibold">Cancel</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => handleEditExpiry(pack)} className="flex items-center text-sm text-accent hover:underline font-semibold">
                                                    <Edit className="h-4 w-4 mr-1"/> Pause/Edit Expiry
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : <p className="text-slate-500">No packs purchased yet.</p>}
                </div>
            </div>
            {purchasing && <PurchaseFormModal client={client} templates={templates} onClose={() => setPurchasing(false)} onSave={(...args) => { onRecordPurchase(...args); setPurchasing(false); }} />}
        </div>
    );
}

const ClientsScreen: React.FC<{ data: AppData }> = ({ data }) => {
    const { clients, updateClient, addClient, purchasedPacks, packTemplates, recordPurchase, updatePurchasedPackExpiry } = data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const handleSaveClient = (clientData: Client) => {
        if (editingClient) {
            updateClient(clientData);
        } else {
            addClient(clientData);
        }
        setIsModalOpen(false);
        setEditingClient(null);
    };
    
    const handleToggleStatus = (client: Client) => {
        const newStatus = client.status === ClientStatus.ACTIVE ? ClientStatus.INACTIVE : ClientStatus.ACTIVE;
        updateClient({ ...client, status: newStatus });
    };

    if (selectedClient) {
        const clientPacks = purchasedPacks
            .filter(p => p.clientId === selectedClient.id)
            .map(p => ({ ...p, template: packTemplates.find(t => t.id === p.templateId) }))
            .sort((a,b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
        
        return <ClientDetailView 
            client={selectedClient} 
            packs={clientPacks}
            templates={packTemplates}
            onBack={() => setSelectedClient(null)}
            onRecordPurchase={recordPurchase}
            onUpdateExpiry={updatePurchasedPackExpiry}
        />;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-primary-dark">Clients</h2>
                <button onClick={() => { setEditingClient(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-primary-dark text-white rounded-md shadow-sm hover:bg-primary font-semibold">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Add Client
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200/80">
                <ul className="divide-y divide-slate-200">
                    {clients.sort((a,b) => a.lastName.localeCompare(b.lastName)).map(client => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const activePacks = purchasedPacks.filter(p => 
                            p.clientId === client.id &&
                            p.ticketsRemaining > 0 &&
                            new Date(p.expiryDate) >= today
                        );
        
                        const totalTicketsRemaining = activePacks.reduce((sum, p) => sum + p.ticketsRemaining, 0);
                        const totalInitialTickets = activePacks.reduce((sum, p) => sum + p.initialTickets, 0);

                        return (
                            <li key={client.id} className={`p-4 sm:p-5 hover:bg-slate-50/50 transition-colors duration-200 ${client.status === ClientStatus.INACTIVE ? 'opacity-60' : ''}`}>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                    <div className="mb-2 sm:mb-0">
                                        <button onClick={() => setSelectedClient(client)} className="text-lg font-semibold text-primary-dark hover:text-accent text-left">
                                            {client.firstName} {client.lastName}
                                        </button>
                                        <p className="text-sm text-slate-500">{client.email}</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        {totalInitialTickets > 0 && (
                                            <span className="text-sm text-slate-600 font-medium">
                                                {totalTicketsRemaining}/{totalInitialTickets} Tickets
                                            </span>
                                        )}
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${client.status === ClientStatus.ACTIVE ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                            {client.status}
                                        </span>
                                        <button onClick={() => { setEditingClient(client); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-primary-dark hover:bg-slate-100 rounded-md"><Edit className="h-5 w-5"/></button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
            
            {isModalOpen && <ClientFormModal client={editingClient} onClose={() => setIsModalOpen(false)} onSave={handleSaveClient} onToggleStatus={handleToggleStatus} />}
        </div>
    );
};

export default ClientsScreen;