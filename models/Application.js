// models/Application.js
const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema(
  {
    // --- Candidat qui postule ---
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le candidat est obligatoire"],
    },

    // --- Offre d'emploi ciblée ---
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "L'offre d'emploi est obligatoire"],
    },

    // --- CV soumis au moment de la candidature ---
    cv: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CV",
      default: null,
    },

    // --- Lettre de motivation ---
    coverLetter: {
      type: String,
      maxlength: [3000, "La lettre de motivation ne peut pas dépasser 3000 caractères"],
      default: null,
    },

    // --- Statut de la candidature ---
    status: {
      type: String,
      enum: {
        values: ["pending", "reviewed", "interview", "accepted", "rejected"],
        message: "Statut invalide",
      },
      default: "pending",
    },

    // --- Notes du recruteur (privé, non visible par le candidat) ---
    recruiterNotes: {
      type: String,
      default: null,
      select: false, // Non retourné par défaut
    },

    // --- Date du dernier changement de statut ---
    statusUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Contrainte : un candidat ne peut postuler qu'une fois par offre ──
ApplicationSchema.index({ candidate: 1, job: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ job: 1, createdAt: -1 });
ApplicationSchema.index({ candidate: 1, createdAt: -1 });

// ─── Middleware : mettre à jour statusUpdatedAt quand le statut change ─
ApplicationSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusUpdatedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("Application", ApplicationSchema);
