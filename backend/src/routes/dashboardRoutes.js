const express = require('express');
const router = express.Router();
const { 
  getCandidateDashboard, 
  getApplicationsByStatus 
} = require('../controllers/dashboardControllers');
const { verifyAccessToken } = require('../middlewares/authMiddlewares');

// Toutes les routes dashboard requièrent l'authentification
router.use(verifyAccessToken);

// ─── Dashboard principal du candidat ───
router.get('/candidate', getCandidateDashboard);

// ─── Applications filtrées par statut ───
router.get('/candidate/status', getApplicationsByStatus);

module.exports = router;
