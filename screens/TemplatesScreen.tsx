
import React, { useState } from 'react';
import { AppData } from '../hooks/useAppData';
import { TicketPackTemplate, PackTemplateStatus, TicketType } from '../types';
import { PlusCircle, Edit } from 'lucide-react';

const TemplateFormModal: React.FC<{
    template: TicketPackTemplate | null;
    onSave: (template: TicketPackTemplate) => void;
    onClose: () => void;
}> = ({ template, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: template?.name || '',
        ticketCount: template?.ticketCount || 0,
        ticketType: template?.ticketType || TicketType.GROUP,
        price: template?.price || 0,
        expiryMonths: template?.expiryMonths || 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: template?.id || '', status: template?.status || PackTemplateStatus.ACTIVE });
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{template ? 'Edit Template' : 'Add New Template'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Pack Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Number of Tickets</label>
                            <input type="number" name="ticketCount" value={formData.ticketCount} onChange={handleChange} required min="1" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Ticket Type</label>
                            <select name="ticketType" value={formData.ticketType} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                                <option value={TicketType.GROUP}>Group</option>
                                <option value={TicketType.PRIVATE}>Private</option>
                            </select>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Expiry (Months)</label>
                            <input type="number" name="expiryMonths" value={formData.expiryMonths} onChange={handleChange} required min="1" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Save Template</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TemplatesScreen: React.FC<{ data: AppData }> = ({ data }) => {
    const { packTemplates, addPackTemplate, updatePackTemplate } = data;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<TicketPackTemplate | null>(null);

    const handleSaveTemplate = (templateData: TicketPackTemplate) => {
        if (editingTemplate) {
            updatePackTemplate(templateData);
        } else {
            addPackTemplate(templateData);
        }
        setIsModalOpen(false);
        setEditingTemplate(null);
    };

    const handleToggleStatus = (template: TicketPackTemplate) => {
        const newStatus = template.status === PackTemplateStatus.ACTIVE ? PackTemplateStatus.INACTIVE : PackTemplateStatus.ACTIVE;
        updatePackTemplate({ ...template, status: newStatus });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-800">Ticket Pack Templates</h2>
                <button onClick={() => { setEditingTemplate(null); setIsModalOpen(true); }} className="flex items-center px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary-dark">
                    <PlusCircle className="h-5 w-5 mr-2" />
                    Add Template
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {packTemplates.sort((a,b) => a.name.localeCompare(b.name)).map(template => (
                         <li key={template.id} className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${template.status === PackTemplateStatus.INACTIVE ? 'opacity-50' : ''}`}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                                <div className="mb-2 sm:mb-0">
                                    <p className="text-lg font-semibold text-primary">{template.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {template.ticketCount} {template.ticketType} tickets for ${template.price} (Expires in {template.expiryMonths} months)
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${template.status === PackTemplateStatus.ACTIVE ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {template.status}
                                    </span>
                                    <button onClick={() => { setEditingTemplate(template); setIsModalOpen(true); }} className="p-2 text-gray-500 hover:text-primary"><Edit className="h-5 w-5"/></button>
                                    <button onClick={() => handleToggleStatus(template)} className="p-2 text-gray-500 hover:text-accent">
                                        {template.status === PackTemplateStatus.ACTIVE ? 'Set Inactive' : 'Set Active'}
                                    </button>
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
