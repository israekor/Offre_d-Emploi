// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    // --- Informations de base ---
    name: {
      type: String,
      required: [true, "Le nom est obligatoire"],
      trim: true,
      minlength: [2, "Le nom doit contenir au moins 2 caractères"],
      maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"],
    },

    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Format d'email invalide"],
    },

    password: {
      type: String,
      required: [true, "Le mot de passe est obligatoire"],
      minlength: [6, "Le mot de passe doit contenir au moins 6 caractères"],
      select: false, // Ne jamais retourner le mot de passe dans les requêtes
    },

    // --- Rôle : chercheur d'emploi ou recruteur ---
    role: {
      type: String,
      enum: {
        values: ["candidate", "recruiter", "admin"],
        message: "Rôle invalide. Valeurs acceptées : candidate, recruiter, admin",
      },
      default: "candidate",
    },

    // --- Profil optionnel ---
    avatar: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
    },

    location: {
      type: String,
      trim: true,
      default: null,
    },

    // --- Compte actif ou désactivé ---
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Index ──────────────────────────────────────────────────
/* UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 }); */

// ─── Middleware : hashage du mot de passe avant save ────────
UserSchema.pre("save", async function (next) {
  // Seulement si le mot de passe a été modifié
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Méthode : comparer le mot de passe (pour le login) ─────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Virtuel : nombre de candidatures (peuplé via Application) ─
UserSchema.virtual("applications", {
  ref: "Application",
  localField: "_id",
  foreignField: "candidate",
});

module.exports = mongoose.model("User", UserSchema);
