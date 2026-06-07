// models/Job.js
const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    // --- Informations principales ---
    title: {
      type: String,
      required: [true, "Le titre du poste est obligatoire"],
      trim: true,
      maxlength: [100, "Le titre ne peut pas dépasser 100 caractères"],
    },

    description: {
      type: String,
      required: [true, "La description est obligatoire"],
      maxlength: [5000, "La description ne peut pas dépasser 5000 caractères"],
    },

    // --- Compétences requises (schéma flexible — avantage MongoDB) ---
    skills: {
      type: [String],
      default: [],
      // Ex: ["Node.js", "MongoDB", "Docker"]
    },

    experience: {
      type: String,
      required: [true, "L'expérience requise est obligatoire"],
      // Ex: "2 ans", "Junior", "3-5 years"
    },

    // --- Type de contrat ---
    contractType: {
      type: String,
      enum: {
        values: ["CDI", "CDD", "Stage", "Freelance", "Alternance", "Temps partiel"],
        message: "Type de contrat invalide",
      },
      default: "CDI",
    },

    // --- Localisation ---
    location: {
      type: String,
      required: [true, "La localisation est obligatoire"],
      trim: true,
    },

    isRemote: {
      type: Boolean,
      default: false,
    },

    // --- Salaire (optionnel, flexible) ---
    salary: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      currency: { type: String, default: "MAD" },
      period: {
        type: String,
        enum: ["mois", "an", "jour", "heure"],
        default: "mois",
      },
    },

    // --- Entreprise ---
    company: {
      name: {
        type: String,
        required: [true, "Le nom de l'entreprise est obligatoire"],
        trim: true,
      },
      logo: { type: String, default: null },
      website: { type: String, default: null },
      sector: { type: String, default: null },
    },

    // --- Recruteur qui a publié l'offre ---
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // --- Statut de l'offre ---
    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "active",
    },

    // --- Date limite de candidature ---
    deadline: {
      type: Date,
      default: null,
    },

    // --- Exigences supplémentaires (schéma flexible) ---
    requirements: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Peut contenir n'importe quoi : langues, certifications, etc.
      // Ex: { languages: ["Français", "Anglais"], certifications: ["AWS"] }
    },

    // --- Compteur de vues ---
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Index pour la recherche rapide ─────────────────────────
JobSchema.index({ title: "text", description: "text", skills: "text" }); // Recherche full-text
JobSchema.index({ status: 1, createdAt: -1 });
JobSchema.index({ "company.name": 1 });
JobSchema.index({ location: 1 });
JobSchema.index({ postedBy: 1 });

// ─── Virtuel : nombre de candidatures ───────────────────────
JobSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "job",
});

// ─── Méthode : incrémenter les vues ─────────────────────────
JobSchema.methods.incrementViews = async function () {
  this.views += 1;
  await this.save();
};

module.exports = mongoose.model("Job", JobSchema);
