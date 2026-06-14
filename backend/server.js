require("dotenv").config();
const cookieParser = require('cookie-parser'); 
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// Connexion MongoDB
connectDB();

// App Express
const app = express();

// Middlewares globaux
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:8080" ||"http://172.25.16.1:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Dossier statique pour les fichiers uploadés (CVs)
app.use("/uploads", express.static("uploads"));

// Route de santé (health check)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "App API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});



const authRoutes =require('./src/routes/authRoutes')
app.use("/auth",authRoutes)

const jobRoutes = require('./src/routes/jobsRoutes');
app.use('/jobs', jobRoutes);

const cvRoutes = require('./src/routes/cv');
app.use('/cv', cvRoutes);

const applyRoutes = require('./src/routes/apply');
app.use('/applications', applyRoutes);

const dashboardRoutes = require('./src/routes/dashboardRoutes');
app.use('/dashboard', dashboardRoutes);

const recruiterDashboardRoutes = require('./src/routes/recruiterDashboardRoutes');
app.use('/dashboard', recruiterDashboardRoutes);

// Middleware : route non trouvée
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} non trouvée`,
  });
});

// ─── Middleware : gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur :", err.stack);

  // Erreur de validation Mongoose
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: messages.join(", ") });
  }

  // Clé dupliquée MongoDB (ex: email déjà utilisé)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `La valeur du champ "${field}" existe déjà`,
    });
  }

  // Erreur JWT invalide
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Token invalide" });
  }

  // Erreur par défaut
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Erreur interne du serveur",
  });
});


// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n App API démarrée`);
  console.log(` Port         : ${PORT}`);
  console.log(` Environnement: ${process.env.NODE_ENV}`);
  console.log(` URL: http://localhost:${PORT}\n`);
});

module.exports = app;
