var firebase = require('firebase');
import firebaseConfig from './firebaseConfig';
firebase.initializeApp(firebaseConfig);

export default firebase;