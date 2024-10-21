const admin = require("firebase-admin");
const fireCreds = require("../firebase.json");

let bucket = null;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(fireCreds),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

bucket = admin.storage().bucket();

module.exports = bucket;
