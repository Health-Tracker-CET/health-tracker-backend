
var admin = require("firebase-admin");

var serviceAccount = require("./../service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://companion-a27d5.firebaseio.com"
});

export default admin;