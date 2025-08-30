import React, { useState } from 'https://esm.sh/react@^19.1.1';
import { PackTemplateStatus, TicketType } from '../types.js';
import { PlusCircle, Edit } from 'https://esm.sh/lucide-react@^0.539.0';

const TemplateFormModal = ({ template, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: template?.name || '',
        ticketCount: template?.ticketCount || 10,
        ticketType: template?.ticketType || TicketType.GROUP,
        price: template?.price || 0,
        expiryMonths: template?.expiryMonths || 1,
    });

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, id: template?.id || '', status: template?.status || PackTemplateStatus.ACTIVE });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-primary-dark">{template ? 'Edit Template' : 'Add New Template'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Pack Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Number of Tickets</label>
                            <input type="number" name="ticketCount" value={formData.ticketCount} onChange={handleChange} required min="1" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Ticket Type</label>
                            <select name="ticketType" value={formData.ticketType} onChange={handleChange} className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-accent focus:border-accent">
                                <option value={TicketType.GROUP}>Group</option>
                                <option value={TicketType.PRIVATE}>Private</option>
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Price ($)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700">Expiry (Months)</label>
                            <input type="number" name="expiryMonths" value={formData.expiryMonths} onChange={handleChange} required min="1" className="mt-1 block w-full border-slate-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"/>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-dark text-white rounded-md hover:bg-primary font-semibold">Save Template</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TemplatesScreen = ({ data }) => {
    const { packTemplates, addPackTemplate, updatePackTemplate } = data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState(null);

    const handleSaveTemplate = (templateData) => {
        if (editingTemplate) {
            updatePackTemplate(templateData);
        } else {
            addPackTemplate(templateData);
        }
        setIsModalOpen(false);
        setEditingTemplate(null);
    };

    const handleToggleStatus = (template) => {
        const newStatus = template.status === PackTemplateStatus.ACTIVE ? PackTemplateStatus.INACTIVE : PackTemplateStatus.ACTIVE;
        updatePackTemplate({ ...template, status: newStatus });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-primary-dark">Ticket Pack Templates</h2>
                <button onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-primary-dark text-white rounded-md shadow-sm hover:bg-primary font-semibold">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Add Template
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200/80">
                <ul className="divide-y divide-slate-200">
                    {packTemplates.sort((a,b) => a.name.localeCompare(b.name)).map(template => (
                         <li key={template.id} className={`p-4 sm:p-5 hover:bg-slate-50/50 transition-colors duration-200 ${template.status === PackTemplateStatus.INACTIVE ? 'opacity-60' : ''}`}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                <div className="mb-2 sm:mb-0">
                                    <p className="text-lg font-semibold text-primary-dark">{template.name}</p>
                                    <p className="text-sm text-slate-500">
                                        {template.ticketCount} {template.ticketType} tickets for ${template.price} (Expires in {template.expiryMonths} months)
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${template.status === PackTemplateStatus.ACTIVE ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                        {template.status}
                                    </span>
                                    <button 
                                        onClick={() => handleToggleStatus(template)} 
                                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full"
                                        title={template.status === PackTemplateStatus.ACTIVE ? 'Set to Inactive' : 'Set to Active'}
                                    >
                                        {template.status === PackTemplateStatus.ACTIVE ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button onClick={() => { setEditingTemplate(template); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-primary-dark hover:bg-slate-100 rounded-md"><Edit className="h-5 w-5"/></button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            
            {isModalOpen && <TemplateFormModal template={editingTemplate} onClose={() => setIsModalOpen(false)} onSave={handleSaveTemplate} />}
        </div>
    );
};

export default TemplatesScreen;