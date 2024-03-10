// Import the functions you need from the SDKs you need
import admin from 'firebase-admin';
import * as fireorm from 'fireorm';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import svc from './beauty-svc-key.json';

// const firebaseConfig = {
//   apiKey: `${process.env.FIREBASE_API_KEY}`,
//   authDomain: `${process.env.FIREBASE_AUTH_DOMAIN}`,
//   projectId: `${process.env.FIREBASE_PROJECT_ID}`,
//   storageBucket: `${process.env.FIREBASE_STORAGE_BUCKET}`,
//   messagingSenderId: `${process.env.FIREBASE_MESSAGING_SENDER_ID}`,
//   appId: `${process.env.FIREBASE_APP_ID}`,
//   measurementId: `${process.env.FIREBASE_MEASUREMENT_ID}`
// };

const App = admin.initializeApp({
  credential: admin.credential.cert(svc as admin.ServiceAccount)
});
const Auth = admin.auth(App);

const firestore = admin.firestore();
fireorm.initialize(firestore);

export { App, Auth };
