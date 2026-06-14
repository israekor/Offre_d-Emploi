const Job = require('../../models/Job');
const Application = require('../../models/Application');
const User = require('../../models/User');

// 📊 Dashboard principal pour recruteur - Stats globales
exports.getRecruiterDashboard = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    // Récupérer tous les jobs du recruteur
    const jobs = await Job.find({ postedBy: recruiterId }).select('_id title status');
    const jobIds = jobs.map(j => j._id);

    // Récupérer toutes les candidatures pour ces jobs
    const applications = await Application.find({ job: { $in: jobIds } })
      .populate('job', 'title company location')
      .populate('candidate', 'firstName lastName email phone');

    // Calculer les stats
    const stats = {
      totalJobs: jobs.length,
      totalApplications: applications.length,
      applicationsByStatus: {
        pending: applications.filter(a => a.status === 'pending').length,
        reviewed: applications.filter(a => a.status === 'reviewed').length,
        interview: applications.filter(a => a.status === 'interview').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
      },
      applicationsByJob: jobs.map(job => ({
        jobId: job._id,
        jobTitle: job.title,
        count: applications.filter(a => a.job.toString() === job._id.toString()).length,
        byStatus: {
          pending: applications.filter(a => a.job.toString() === job._id.toString() && a.status === 'pending').length,
          reviewed: applications.filter(a => a.job.toString() === job._id.toString() && a.status === 'reviewed').length,
          interview: applications.filter(a => a.job.toString() === job._id.toString() && a.status === 'interview').length,
          accepted: applications.filter(a => a.job.toString() === job._id.toString() && a.status === 'accepted').length,
          rejected: applications.filter(a => a.job.toString() === job._id.toString() && a.status === 'rejected').length,
        }
      }))
    };

    res.status(200).json({
      success: true,
      stats,
      jobs: jobs.length > 0 ? jobs : [],
    });
  } catch (err) {
    console.error('Error in getRecruiterDashboard:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📋 Lister toutes les candidatures reçues avec filtres
exports.getApplicationsForRecruiter = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { jobId, status, sort = 'newest' } = req.query;

    // Récupérer les jobs du recruteur
    const jobs = await Job.find({ postedBy: recruiterId }).select('_id');
    const jobIds = jobs.map(j => j._id);

    // Filtrer les candidatures
    let query = { job: { $in: jobIds } };
    if (jobId) query.job = jobId;
    if (status) query.status = status;

    // Récupérer les candidatures avec données enrichies
    let applications = await Application.find(query)
      .populate('job', 'title company location salary contractType')
      .populate('candidate', 'firstName lastName email phone skills')
      .populate('cv', 'fileUrl fileName');

    // Trier
    if (sort === 'oldest') {
      applications = applications.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      applications = applications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (err) {
    console.error('Error in getApplicationsForRecruiter:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 👤 Voir les détails d'un candidat avec ses candidatures
exports.getCandidateProfile = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { candidateId } = req.params;

    // Vérifier que le candidat a postulé à une offre du recruteur
    const jobs = await Job.find({ postedBy: recruiterId }).select('_id');
    const jobIds = jobs.map(j => j._id);

    const candidateApps = await Application.find({
      candidate: candidateId,
      job: { $in: jobIds }
    });

    if (candidateApps.length === 0) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    // Récupérer le profil complet du candidat
    const candidate = await User.findById(candidateId);
    const profile = await require('../../models/CV').findOne({ candidate: candidateId });
    const allApplications = await Application.find({ candidate: candidateId })
      .populate('job', 'title company')
      .select('status createdAt job');

    res.status(200).json({
      success: true,
      candidate: {
        ...candidate.toObject(),
        profile,
        applications: allApplications
      }
    });
  } catch (err) {
    console.error('Error in getCandidateProfile:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📊 Statistiques détaillées pour un job spécifique
exports.getJobApplicationStats = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { jobId } = req.params;

    // Vérifier que le job appartient au recruteur
    const job = await Job.findOne({ _id: jobId, postedBy: recruiterId });
    if (!job) {
      return res.status(403).json({ success: false, message: 'Job non trouvé' });
    }

    // Récupérer toutes les candidatures
    const applications = await Application.find({ job: jobId })
      .populate('candidate', 'firstName lastName email');

    const stats = {
      jobId,
      jobTitle: job.title,
      totalApplications: applications.length,
      byStatus: {
        pending: applications.filter(a => a.status === 'pending').length,
        reviewed: applications.filter(a => a.status === 'reviewed').length,
        interview: applications.filter(a => a.status === 'interview').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
      },
      recentApplications: applications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
        .map(app => ({
          candidateName: `${app.candidate.firstName} ${app.candidate.lastName}`,
          candidateEmail: app.candidate.email,
          status: app.status,
          appliedAt: app.createdAt
        }))
    };

    res.status(200).json({ success: true, stats });
  } catch (err) {
    console.error('Error in getJobApplicationStats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✏️ Mettre à jour le statut d'une candidature
exports.updateApplicationStatus = async (req, res) => {
  try {
    const recruiterId = req.user.id;
    const { applicationId } = req.params;
    const { status } = req.body;

    // Vérifier que le statut est valide
    const validStatuses = ['pending', 'reviewed', 'interview', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Statut invalide' });
    }

    // Vérifier que la candidature appartient à un job du recruteur
    const application = await Application.findById(applicationId).populate('job');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Candidature non trouvée' });
    }

    const job = await Job.findOne({ _id: application.job._id, postedBy: recruiterId });
    if (!job) {
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    }

    // Mettre à jour le statut
    application.status = status;
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Statut mis à jour',
      application
    });
  } catch (err) {
    console.error('Error in updateApplicationStatus:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
