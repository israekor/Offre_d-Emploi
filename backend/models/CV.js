// models/CV.js
const mongoose = require("mongoose");

// ─── Sous-schémas ────────────────────────────────────────────

const ExperienceSchema = new mongoose.Schema({
  title: { type: String, required: true },        // Ex: "Développeur Backend"
  company: { type: String, required: true },       // Ex: "Orange Maroc"
  location: { type: String, default: null },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },          // null = poste actuel
  isCurrent: { type: Boolean, default: false },
  description: { type: String, default: null },
}, { _id: false });

const EducationSchema = new mongoose.Schema({
  degree: { type: String, required: true },        // Ex: "Licence Informatique"
  school: { type: String, required: true },        // Ex: "ENSA Tanger"
  location: { type: String, default: null },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  isCurrent: { type: Boolean, default: false },
  grade: { type: String, default: null },          // Ex: "Mention Bien"
}, { _id: false });

const LanguageSchema = new mongoose.Schema({
  name: { type: String, required: true },          // Ex: "Arabe"
  level: {
    type: String,
    enum: ["Débutant", "Intermédiaire", "Avancé", "Courant", "Natif"],
    default: "Intermédiaire",
  },
}, { _id: false });

// ─── Schéma principal CV ─────────────────────────────────────

const CVSchema = new mongoose.Schema(
  {
    // --- Propriétaire du CV ---
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Un seul CV par utilisateur (peut être mis à jour)
    },

    // --- Informations personnelles ---
    headline: {
      type: String,
      trim: true,
      maxlength: [150, "Le titre ne peut pas dépasser 150 caractères"],
      default: null,
      // Ex: "Développeur Full-Stack passionné par le NoSQL"
    },

    summary: {
      type: String,
      maxlength: [1000, "Le résumé ne peut pas dépasser 1000 caractères"],
      default: null,
    },

    // --- Compétences (flexible MongoDB) ---
    skills: {
      technical: { type: [String], default: [] },   // Ex: ["MongoDB", "React", "Node.js"]
      soft: { type: [String], default: [] },         // Ex: ["Leadership", "Communication"]
    },

    // --- Expériences professionnelles ---
    experiences: {
      type: [ExperienceSchema],
      default: [],
    },

    // --- Formations ---
    education: {
      type: [EducationSchema],
      default: [],
    },

    // --- Langues ---
    languages: {
      type: [LanguageSchema],
      default: [],
    },

    // --- Liens ---
    links: {
      linkedin: { type: String, default: null },
      github: { type: String, default: null },
      portfolio: { type: String, default: null },
    },

    // --- Fichier CV uploadé (chemin ou URL) ---
    fileUrl: {
      type: String,
      default: null,
      // Rempli par M3 (route /cv avec multer)
    },

    fileName: {
      type: String,
      default: null,
    },

    // --- Visibilité du CV ---
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Index ───────────────────────────────────────────────────
CVSchema.index({ candidate: 1 }, { unique: true });
CVSchema.index({ "skills.technical": 1 });
CVSchema.index({ isPublic: 1 });

module.exports = mongoose.model("CV", CVSchema);
