const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Ces options évitent les warnings Mongoose
      serverSelectionTimeoutMS: 5000, // Timeout après 5s si MongoDB injoignable
    });

    console.log(`✅ MongoDB connecté : ${conn.connection.host}`);
    console.log(`📦 Base de données   : ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ Erreur de connexion MongoDB :", error.message);
    process.exit(1); // Arrête le serveur si la DB est inaccessible
  }
};

// Événements de connexion (utile pour le debug)
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB déconnecté");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 MongoDB reconnecté");
});

module.exports = connectDB;
