# Firestore Data Import Guide

This guide will walk you through the process of importing your existing client and attendance data from the provided JSON files into your Firebase Firestore database.

## Prerequisites

1.  **Node.js:** You must have Node.js installed on your computer. You can download it from [https://nodejs.org/](https://nodejs.org/).
2.  **Firebase Project Access:** You must be the owner or editor of your Firebase project (`ticket-tora`).

## Step-by-Step Instructions

### Step 1: Get Your Firebase Service Account Key

The import script needs administrator credentials to write data to your database.

1.  Go to your Firebase Project Settings by clicking this link: [https://console.firebase.google.com/project/ticket-tora/settings/serviceaccounts/adminsdk](https://console.firebase.google.com/project/ticket-tora/settings/serviceaccounts/adminsdk)
2.  Make sure the "Node.js" option is selected.
3.  Click the **"Generate new private key"** button. A confirmation dialog will appear.
4.  Click **"Generate key"**. A JSON file will be downloaded to your computer.
5.  Rename this downloaded file to `serviceAccountKey.json`.
6.  Move the `serviceAccountKey.json` file into this `import` directory.

**IMPORTANT:** Treat this file like a password. Do not share it or commit it to a public GitHub repository.

### Step 2: Get Your User ID

The data needs to be associated with your specific user account in the app.

1.  Log in to your "Lesson Navi" application.
2.  Go to your Firestore Database console: [https://console.firebase.google.com/project/ticket-tora/firestore/data](https://console.firebase.google.com/project/ticket-tora/firestore/data)
3.  You will see a collection called `users`. Click on it.
4.  You will see one or more documents with long, random-looking IDs. Find the one corresponding to your account (it probably has your email address inside if you click on it).
5.  Click on the Document ID to select it, and copy it to your clipboard. It will look something like `aBcDeFgHiJkLmNoPqRsTuVwXyZ12`.

### Step 3: Configure and Run the Import Script

1.  Open the `import.js` file in a text editor.
2.  Find the line that says `const TARGET_USER_ID = 'PASTE_YOUR_USER_ID_HERE';`.
3.  Replace `PASTE_YOUR_USER_ID_HERE` with the actual User ID you copied in the previous step. Save the file.
4.  Open a terminal or command prompt on your computer.
5.  Navigate into this `import` directory.
6.  Run the command `npm install` to download the necessary Firebase library.
7.  Run the script with the command `node import.js`.

You will see log messages in your terminal as the script uploads clients, templates, and processes purchases and attendance. Once it's finished, refresh your app, and all your data will be there!
