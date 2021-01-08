var firebase = require('firebase');
const firebaseConfig = {
    apiKey: "AIzaSyCYEgp2ZeFPMcVnkEDvdD7KEWR6rb8DXFU",
    authDomain: "companion-a27d5.firebaseapp.com",
    databaseURL: "https://companion-a27d5.firebaseio.com",
    projectId: "companion-a27d5",
    storageBucket: "companion-a27d5.appspot.com",
    messagingSenderId: "26925186540",
    appId: "1:26925186540:web:328f1071c5dfd1143b54c9"
  };
firebase.initializeApp(firebaseConfig);

export default firebase;