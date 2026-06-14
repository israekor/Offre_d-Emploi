const router = require('express').Router();
const {
  getRecruiterDashboard,
  getApplicationsForRecruiter,
  getCandidateProfile,
  getJobApplicationStats,
  updateApplicationStatus
} = require('../controllers/recruiterDashboardControllers');
const { verifyAccessToken } = require('../middlewares/authMiddlewares');

// Vérifier que c'est un recruteur (middleware à ajouter si nécessaire)
const isRecruiter = (req, res, next) => {
  // On suppose que req.user est set par verifyAccessToken
  // Vous pouvez ajouter une vérification du rôle ici si nécessaire
  next();
};

// 📊 Dashboard principal - Stats globales
router.get('/recruiter', verifyAccessToken, isRecruiter, getRecruiterDashboard);

// 📋 Lister toutes les candidatures
router.get('/recruiter/applications', verifyAccessToken, isRecruiter, getApplicationsForRecruiter);

// 📊 Stats pour un job spécifique
router.get('/recruiter/jobs/:jobId/stats', verifyAccessToken, isRecruiter, getJobApplicationStats);

// 👤 Voir le profil d'un candidat
router.get('/recruiter/candidates/:candidateId', verifyAccessToken, isRecruiter, getCandidateProfile);

// ✏️ Mettre à jour le statut d'une candidature
router.patch('/recruiter/applications/:applicationId/status', verifyAccessToken, isRecruiter, updateApplicationStatus);

module.exports = router;
