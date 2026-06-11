// mongo-init.js
// Exécuté automatiquement au premier démarrage de MongoDB
// Crée un utilisateur dédié à l'application + les collections

db = db.getSiblingDB("talentbridge"); // Se connecter à la base  (créée automatiquement si n'existe pas)

// Créer un utilisateur avec accès uniquement à la base app
db.createUser({
  user: "talentbridge_user",
  pwd: "talentbridge_pass",
  roles: [{ role: "readWrite", db: "app" }],
});

// Créer les collections avec validation basique
db.createCollection("users");
db.createCollection("jobs");
db.createCollection("cvs");
db.createCollection("applications");

// Index utiles (Mongoose les recrée aussi, mais c'est une bonne pratique)
db.users.createIndex({ email: 1 }, { unique: true });
db.jobs.createIndex({ title: "text", description: "text" });
db.applications.createIndex({ candidate: 1, job: 1 }, { unique: true });

print("✅ app DB initialisée avec succès");
