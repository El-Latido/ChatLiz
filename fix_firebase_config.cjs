const fs = require('fs');
let file = fs.readFileSync('src/firebaseConfig.ts', 'utf8');

if (!file.includes('firestoreDatabaseId')) {
    const targetConfig = `const firebaseConfig = {
  apiKey: "AIzaSyBgTuV7xHa3PAPSzacRsEkcnJ59Fukye1A",
  authDomain: "eighth-ability-8szp9.firebaseapp.com",
  projectId: "eighth-ability-8szp9",
  storageBucket: "eighth-ability-8szp9.appspot.com",
  messagingSenderId: "389253128291",
  appId: "1:389253128291:web:087a456f72bbc4bf0b1856"
};`;

    const newConfig = `const firebaseConfig = {
  apiKey: "AIzaSyBgTuV7xHa3PAPSzacRsEkcnJ59Fukye1A",
  authDomain: "eighth-ability-8szp9.firebaseapp.com",
  projectId: "eighth-ability-8szp9",
  storageBucket: "eighth-ability-8szp9.appspot.com",
  messagingSenderId: "389253128291",
  appId: "1:389253128291:web:087a456f72bbc4bf0b1856"
};

const databaseId = "ai-studio-chatliz-19b8032a-22a9-4b1d-9b50-b3d4b9771a26";`;

    file = file.replace(targetConfig, newConfig);
    file = file.replace("export const db = getFirestore(app);", "export const db = getFirestore(app, databaseId);");
    fs.writeFileSync('src/firebaseConfig.ts', file);
}
