const Application = require('../../models/Application');
const User = require('../../models/User');

// ─── Candidate Dashboard: Récupère toutes les stats du candidat ───
const getCandidateDashboard = async (req, res, next) => {
  try {
    const candidateId = req.user.id;

    // Récupérer l'utilisateur
    const user = await User.findById(candidateId).select('name email phone location');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Utilisateur non trouvé" });
    }

    // Récupérer toutes les applications du candidat avec détails du job
    const applications = await Application.find({ candidate: candidateId })
      .populate('job', 'title company location contractType skills createdAt')
      .sort({ createdAt: -1 });

    // Calculer les stats
    const stats = {
      total: applications.length,
      pending: applications.filter(a => a.status === 'pending').length,
      reviewed: applications.filter(a => a.status === 'reviewed').length,
      interview: applications.filter(a => a.status === 'interview').length,
      accepted: applications.filter(a => a.status === 'accepted').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
    };

    // Grouper applications par statut
    const applicationsByStatus = {
      pending: applications.filter(a => a.status === 'pending'),
      reviewed: applications.filter(a => a.status === 'reviewed'),
      interview: applications.filter(a => a.status === 'interview'),
      accepted: applications.filter(a => a.status === 'accepted'),
      rejected: applications.filter(a => a.status === 'rejected'),
    };

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
      },
      stats,
      applications,
      applicationsByStatus,
    });
  } catch (err) {
    next(err);
  }
};

// ─── Récupérer applications filtrées par statut ───
const getApplicationsByStatus = async (req, res, next) => {
  try {
    const candidateId = req.user.id;
    const { status } = req.query;

    if (!status) {
      return res.status(400).json({ success: false, message: "Le statut est obligatoire" });
    }

    const applications = await Application.find({ candidate: candidateId, status })
      .populate('job', 'title company location contractType skills')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      status,
      count: applications.length,
      data: applications,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCandidateDashboard,
  getApplicationsByStatus,
};
