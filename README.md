# Social CRM

This is a Next.js starter project for a Social CRM application, designed to be used with Firebase Studio.

## Features

- **Lead Generation:** Automatically identify potential leads from social media platforms.
- **AI-Powered Lead Scoring:** Score leads based on their confidence level using AI.
- **Automated Reply Generation:** Generate automated replies to leads.
- **Firebase Integration:** Built to work seamlessly with Firebase services.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [Firebase CLI](https://firebase.google.com/docs/cli)

### Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Log in to Firebase:**

   ```bash
   firebase login
   ```

### Running the Application

1. **Start the Next.js development server:**

   ```bash
   npm run dev
   ```

   Your application will now be running at [http://localhost:3000](http://localhost:3000).

## Local Development with Firebase Emulators

This project is configured to use the Firebase Emulator Suite for local development. This allows you to test your application and Firebase features without interacting with live Firebase services.

### Running the Emulators

1. **Start the emulators:**

   ```bash
   npm run emulators
   ```

   This command will start the emulators for Authentication, Firestore, Functions, Hosting, and Storage. It will also import any existing data from the `./emulator-data` directory and export the data on exit.

2. **Seed the database:**

   In a separate terminal window, run the following command to seed the Firestore emulator with test data:

   ```bash
   npm run seed-emulator
   ```

3. **Access the Emulator UI:**

   You can view and manage the emulators in your browser at [http://localhost:4000](http://localhost:4000).

### Testing Workflow

1. **Start emulators:** `npm run emulators`
2. **Run seed script:** `npm run seed-emulator`
3. **Open Emulator UI:** `http://localhost:4000`
4. **Test app:** `http://localhost:3000`
5. **Verify data** in the Firestore Emulator UI.
6. **Test Cloud Functions** locally.

## Deployment

To deploy your application to Firebase Hosting, run the following command:

```bash
npm run build
firebase deploy
```
