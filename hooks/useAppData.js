import { useState, useEffect, useCallback } from 'https://esm.sh/react@^19.1.1';
import { ClientStatus, PackTemplateStatus, TicketType, PackHistoryType } from '../types.js';

const APP_DATA_KEY = 'ticketTrackPilatesData';

const getInitialData = () => {
    try {
        const storedData = localStorage.getItem(APP_DATA_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.error("Failed to parse data from localStorage", error);
    }
    
    // Default initial data if nothing in localStorage or parsing fails
    const client1Id = crypto.randomUUID();
    const client2Id = crypto.randomUUID();
    const template1Id = crypto.randomUUID();
    const template2Id = crypto.randomUUID();

    const today = new Date();
    const purchaseDate1 = new Date(today);
    purchaseDate1.setDate(today.getDate() - 40); // Purchased 40 days ago

    const purchaseDate2 = new Date(today);
    purchaseDate2.setDate(today.getDate() - 15); // Purchased 15 days ago

    const attendanceDate1 = new Date(today);
    attendanceDate1.setDate(today.getDate() - 20); // Attended 20 days ago

    const attendanceDate2 = new Date(today);
    attendanceDate2.setDate(today.getDate() - 10); // Attended 10 days ago

    const expiryDate1 = new Date(purchaseDate1);
    expiryDate1.setMonth(expiryDate1.getMonth() + 6);
    
    const expiryDate2 = new Date(purchaseDate2);
    expiryDate2.setMonth(expiryDate2.getMonth() + 3);

    const purchasedPack1Id = crypto.randomUUID();

    return {
        clients: [
            { id: client1Id, firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', phone: '123-456-7890', status: ClientStatus.ACTIVE },
            { id: client2Id, firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com', phone: '098-765-4321', status: ClientStatus.ACTIVE },
            { id: crypto.randomUUID(), firstName: 'Emily', lastName: 'Jones', email: 'emily.jones@example.com', phone: '555-555-5555', status: ClientStatus.INACTIVE },
        ],
        packTemplates: [
            { id: template1Id, name: '10 Group Classes', ticketCount: 10, ticketType: TicketType.GROUP, price: 200, expiryMonths: 6, status: PackTemplateStatus.ACTIVE },
            { id: template2Id, name: '5 Private Sessions', ticketCount: 5, ticketType: TicketType.PRIVATE, price: 450, expiryMonths: 3, status: PackTemplateStatus.ACTIVE },
            { id: crypto.randomUUID(), name: '20 Group Classes (Old)', ticketCount: 20, ticketType: TicketType.GROUP, price: 350, expiryMonths: 12, status: PackTemplateStatus.INACTIVE },
        ],
        purchasedPacks: [
            {
                id: purchasedPack1Id,
                clientId: client1Id,
                templateId: template1Id,
                purchaseDate: purchaseDate1.toISOString(),
                expiryDate: expiryDate1.toISOString(),
                initialTickets: 10,
                ticketsRemaining: 8,
                purchasePrice: 200,
                history: [
                    { id: crypto.randomUUID(), date: purchaseDate1.toISOString(), type: PackHistoryType.PURCHASE, details: 'Purchased pack for $200.00' },
                    { id: crypto.randomUUID(), date: attendanceDate1.toISOString(), type: PackHistoryType.ATTENDANCE, details: 'Attended group class' },
                    { id: crypto.randomUUID(), date: attendanceDate2.toISOString(), type: PackHistoryType.ATTENDANCE, details: 'Attended group class' },
                ]
            },
            {
                id: crypto.randomUUID(),
                clientId: client2Id,
                templateId: template2Id,
                purchaseDate: purchaseDate2.toISOString(),
                expiryDate: expiryDate2.toISOString(),
                initialTickets: 5,
                ticketsRemaining: 5,
                purchasePrice: 450,
                history: [
                    { id: crypto.randomUUID(), date: purchaseDate2.toISOString(), type: PackHistoryType.PURCHASE, details: 'Purchased pack for $450.00' },
                ]
            }
        ],
        attendanceRecords: [
            { id: crypto.randomUUID(), classDate: attendanceDate1.toISOString(), classType: TicketType.GROUP, clientId: client1Id, purchasedPackId: purchasedPack1Id },
            { id: crypto.randomUUID(), classDate: attendanceDate2.toISOString(), classType: TicketType.GROUP, clientId: client1Id, purchasedPackId: purchasedPackId },
        ],
    };
};


export const useAppData = () => {
    const [clients, setClients] = useState([]);
    const [packTemplates, setPackTemplates] = useState([]);
    const [purchasedPacks, setPurchasedPacks] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    
    useEffect(() => {
        const data = getInitialData();
        setClients(data.clients);
        setPackTemplates(data.packTemplates);
        setPurchasedPacks(data.purchasedPacks);
        setAttendanceRecords(data.attendanceRecords);
    }, []);

    useEffect(() => {
        try {
            const appData = JSON.stringify({ clients, packTemplates, purchasedPacks, attendanceRecords });
            localStorage.setItem(APP_DATA_KEY, appData);
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }, [clients, packTemplates, purchasedPacks, attendanceRecords]);
    
    // Client Actions
    const addClient = (client) => setClients(prev => [...prev, { ...client, id: crypto.randomUUID() }]);
    const updateClient = (updatedClient) => setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));

    // Template Actions
    const addPackTemplate = (template) => setPackTemplates(prev => [...prev, { ...template, id: crypto.randomUUID() }]);
    const updatePackTemplate = (updatedTemplate) => {
        if (updatedTemplate.status === PackTemplateStatus.INACTIVE) {
            const hasActivePacks = purchasedPacks.some(p => 
                p.templateId === updatedTemplate.id &&
                p.ticketsRemaining > 0 &&
                new Date(p.expiryDate) > new Date()
            );
            if (hasActivePacks) {
                alert('Cannot make template inactive as there are active client packs using it.');
                return;
            }
        }
        setPackTemplates(prev => prev.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    };
    
    // Purchase Actions
    const recordPurchase = (clientId, templateId, purchaseDate) => {
        const template = packTemplates.find(t => t.id === templateId);
        if (!template) return;

        const expiryDate = new Date(purchaseDate);
        expiryDate.setMonth(expiryDate.getMonth() + template.expiryMonths);

        const newPack = {
            id: crypto.randomUUID(),
            clientId,
            templateId,
            purchaseDate: purchaseDate.toISOString(),
            expiryDate: expiryDate.toISOString(),
            initialTickets: template.ticketCount,
            ticketsRemaining: template.ticketCount,
            purchasePrice: template.price,
            history: [
                { id: crypto.randomUUID(), date: purchaseDate.toISOString(), type: PackHistoryType.PURCHASE, details: `Purchased pack for $${template.price.toFixed(2)}` }
            ]
        };
        setPurchasedPacks(prev => [...prev, newPack]);
    };

    const updatePurchasedPackExpiry = (packId, newExpiryDate) => {
        setPurchasedPacks(prev => prev.map(pack => {
            if (pack.id === packId) {
                const oldExpiryDate = new Date(pack.expiryDate).toLocaleDateString();
                const updatedHistory = {
                    id: crypto.randomUUID(),
                    date: new Date().toISOString(),
                    type: PackHistoryType.EXPIRY_CHANGE,
                    details: `Expiry date changed from ${oldExpiryDate} to ${newExpiryDate.toLocaleDateString()}`
                };
                return {
                    ...pack,
                    expiryDate: newExpiryDate.toISOString(),
                    history: [...pack.history, updatedHistory]
                };
            }
            return pack;
        }));
    };

    // Attendance Actions
    const recordAttendance = useCallback((classDate, classType, clientIds) => {
        const updatedPacks = [...purchasedPacks];
        const newAttendanceRecords = [];

        clientIds.forEach(clientId => {
            const clientPacks = updatedPacks
                .filter(p => {
                    const template = packTemplates.find(t => t.id === p.templateId);
                    return p.clientId === clientId &&
                           template?.ticketType === classType &&
                           p.ticketsRemaining > 0 &&
                           new Date(p.expiryDate) >= classDate;
                })
                .sort((a, b) => {
                    const expiryA = new Date(a.expiryDate).getTime();
                    const expiryB = new Date(b.expiryDate).getTime();
                    if (expiryA !== expiryB) return expiryA - expiryB;
                    return new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
                });

            if (clientPacks.length > 0) {
                const packToDeduct = clientPacks[0];
                packToDeduct.ticketsRemaining -= 1;
                packToDeduct.history.push({
                    id: crypto.randomUUID(),
                    date: classDate.toISOString(),
                    type: PackHistoryType.ATTENDANCE,
                    details: `Attended ${classType} class`
                });
                
                newAttendanceRecords.push({
                    id: crypto.randomUUID(),
                    classDate: classDate.toISOString(),
                    classType,
                    clientId,
                    purchasedPackId: packToDeduct.id
                });
            }
        });

        setPurchasedPacks(updatedPacks);
        setAttendanceRecords(prev => [...prev, ...newAttendanceRecords]);
    }, [purchasedPacks, packTemplates]);

    const deleteAttendance = useCallback((recordId) => {
        const recordToDelete = attendanceRecords.find(r => r.id === recordId);
        if (!recordToDelete) return;

        // Restore ticket
        setPurchasedPacks(prev => prev.map(pack => {
            if (pack.id === recordToDelete.purchasedPackId) {
                return {
                    ...pack,
                    ticketsRemaining: pack.ticketsRemaining + 1,
                    history: pack.history.filter(h => h.type !== PackHistoryType.ATTENDANCE || new Date(h.date).getTime() !== new Date(recordToDelete.classDate).getTime())
                };
            }
            return pack;
        }));

        // Remove attendance record
        setAttendanceRecords(prev => prev.filter(r => r.id !== recordId));
    }, [attendanceRecords]);
    
    return {
        clients,
        addClient,
        updateClient,
        packTemplates,
        addPackTemplate,
        updatePackTemplate,
        purchasedPacks,
        recordPurchase,
        updatePurchasedPackExpiry,
        attendanceRecords,
        recordAttendance,
        deleteAttendance
    };
};