const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get } = require("firebase/database");

const firebaseConfig = require("./firebaseConfig.js");

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function testConnection() {
  try {
    const testRef = ref(db, "test");
    const snapshot = await get(testRef);

    console.log("Firebase connection successful!");
    console.log("Data:", snapshot.val());
  } catch (error) {
    console.error("Firebase connection failed:", error);
  }
}

testConnection();
