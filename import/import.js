
const admin = require('firebase-admin');

// --- CONFIGURATION ---
// 1. Path to your service account key file
const serviceAccount = require('./serviceAccountKey.json'); 
// 2. The ID of the user you want to import this data for
const TARGET_USER_ID = 'PASTE_YOUR_USER_ID_HERE'; // <-- IMPORTANT!
// 3. The JSON files containing your data
const clientsData = require('./data/clients.json'); 
const templatesData = require('./data/packTemplates.json');
const purchasesAndAttendanceData = require('./data/purchasesAndAttendance.json');
// ---------------------


// --- INITIALIZE FIREBASE ADMIN SDK ---
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
const { Timestamp } = admin.firestore;


// --- HELPER FUNCTIONS ---
const getCollectionRef = (collectionName) => db.collection('users').doc(TARGET_USER_ID).collection(collectionName);

// --- MAIN IMPORT LOGIC ---
async function runImport() {
  console.log('--- Starting Lesson Navi Data Import ---');
  
  if (TARGET_USER_ID === 'PASTE_YOUR_USER_ID_HERE') {
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    console.error('!!! ERROR: Please update TARGET_USER_ID in import.js !!!');
    console.error('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    return;
  }
  
  // These maps will store the new Firestore IDs against a unique identifier from your old data
  const clientEmailToIdMap = new Map();
  const templateNameToIdMap = new Map();

  // --- 1. Import Clients ---
  console.log('\n[1/3] Importing Clients...');
  const clientsRef = getCollectionRef('clients');
  for (const client of clientsData) {
    // Check if client already exists to avoid duplicates
    const existingClientQuery = await clientsRef.where('email', '==', client.email).get();
    if (!existingClientQuery.empty) {
        const existingId = existingClientQuery.docs[0].id;
        console.log(`  - Client "${client.firstName} ${client.lastName}" already exists. Skipping. (ID: ${existingId})`);
        clientEmailToIdMap.set(client.email, existingId);
    } else {
        const docRef = await clientsRef.add(client);
        console.log(`  + Added client: ${client.firstName} ${client.lastName} (ID: ${docRef.id})`);
        clientEmailToIdMap.set(client.email, docRef.id);
    }
  }

  // --- 2. Import Pack Templates ---
  console.log('\n[2/3] Importing Pack Templates...');
  const templatesRef = getCollectionRef('packTemplates');
  for (const template of templatesData) {
    const existingTemplateQuery = await templatesRef.where('name', '==', template.name).get();
    if (!existingTemplateQuery.empty) {
        const existingId = existingTemplateQuery.docs[0].id;
        console.log(`  - Template "${template.name}" already exists. Skipping. (ID: ${existingId})`);
        templateNameToIdMap.set(template.name, existingId);
    } else {
        const docRef = await templatesRef.add(template);
        console.log(`  + Added template: ${template.name} (ID: ${docRef.id})`);
        templateNameToIdMap.set(template.name, docRef.id);
    }
  }

  // --- 3. Process Purchases and Attendance ---
  console.log('\n[3/3] Importing Purchases and Attendance Records...');
  const purchasedPacksRef = getCollectionRef('purchasedPacks');
  const attendanceRecordsRef = getCollectionRef('attendanceRecords');

  for (const record of purchasesAndAttendanceData) {
    const clientId = clientEmailToIdMap.get(record.clientEmail);
    const templateId = templateNameToIdMap.get(record.purchase.templateName);
    const template = templatesData.find(t => t.name === record.purchase.templateName);

    if (!clientId || !templateId || !template) {
      console.error(`  ! ERROR: Could not find matching client or template for purchase record: ${record.clientEmail} - ${record.purchase.templateName}. Skipping.`);
      continue;
    }

    // Check if a similar purchase already exists to prevent duplicates
    const purchaseDate = new Date(record.purchase.purchaseDate);
    const existingPurchaseQuery = await purchasedPacksRef
      .where('clientId', '==', clientId)
      .where('templateId', '==', templateId)
      .where('purchaseDate', '==', Timestamp.fromDate(purchaseDate))
      .get();

    if (!existingPurchaseQuery.empty) {
        console.log(`  - Purchase for "${record.clientEmail}" on ${record.purchase.purchaseDate} already exists. Skipping.`);
        continue;
    }

    console.log(`  * Processing purchase for: ${record.clientEmail}`);

    // Create the PurchasedPack document
    const expiryDate = new Date(purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + template.expiryMonths);

    let ticketsRemaining = template.ticketCount;
    const history = [];

    // Add purchase to history
    history.push({
      date: Timestamp.fromDate(purchaseDate),
      type: 'purchase',
      details: `Purchased pack for $${template.price}` // Note: App uses formatCurrency, this is a simplified version.
    });

    // Add attendance records and update history
    for (const attDateStr of record.attendance) {
      ticketsRemaining--;
      const classDate = new Date(attDateStr);
      
      history.push({
        date: Timestamp.fromDate(classDate),
        type: 'attendance',
        details: `Attended ${template.ticketType} class`
      });
    }
    
    // Sort history by date, as attendance might be out of order
    history.sort((a, b) => a.date.toMillis() - b.date.toMillis());

    const newPack = {
      clientId,
      templateId,
      purchaseDate: Timestamp.fromDate(purchaseDate),
      expiryDate: Timestamp.fromDate(expiryDate),
      initialTickets: template.ticketCount,
      ticketsRemaining: ticketsRemaining,
      purchasePrice: template.price,
      history: history
    };

    const purchasedPackRef = await purchasedPacksRef.add(newPack);
    console.log(`    + Created purchased pack (ID: ${purchasedPackRef.id}) with ${ticketsRemaining}/${template.ticketCount} tickets remaining.`);

    // Create the individual AttendanceRecord documents
    for (const attDateStr of record.attendance) {
        const attendanceRecord = {
            classDate: Timestamp.fromDate(new Date(attDateStr)),
            classType: template.ticketType,
            clientId: clientId,
            purchasedPackId: purchasedPackRef.id
        };
        await attendanceRecordsRef.add(attendanceRecord);
    }
    if (record.attendance.length > 0) {
        console.log(`    + Created ${record.attendance.length} attendance records.`);
    }
  }

  console.log('\n--- Data Import Complete! ---');
}

runImport().catch(console.error);
