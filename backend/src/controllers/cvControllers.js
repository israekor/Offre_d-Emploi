const CV = require('../../models/CV')
const Application = require('../../models/Application')

// Déposer/Modifier un CV
exports.uploadCV = async (req, res) => {
  try {
    const userId = req.user.id
    
    // Build update object
    let updateData = { ...req.body, candidate: userId }

    // If there is an uploaded file, store its URL and name
    if (req.file) {
      updateData.fileUrl = `/uploads/${req.file.filename}`
      updateData.fileName = req.file.originalname
    }

    // Parse skills, experiences, education, languages, links if sent as stringified JSON (FormData)
    const jsonFields = ['skills', 'experiences', 'education', 'languages', 'links']
    jsonFields.forEach(field => {
      if (updateData[field] && typeof updateData[field] === 'string') {
        try {
          updateData[field] = JSON.parse(updateData[field])
        } catch (e) {
          // If JSON parsing fails, keep it as is
        }
      }
    })

    // Upsert (update if exists, create if not) the CV for this candidate
    const cv = await CV.findOneAndUpdate(
      { candidate: userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    )

    res.status(200).json(cv)
  } catch (err) {
    console.error("Error in uploadCV:", err)
    res.status(500).json({ message: err.message })
  }
}

// Consulter le CV de l'utilisateur connecté
exports.getMyCV = async (req, res) => {
  try {
    const cv = await CV.findOne({ candidate: req.user.id })
    res.json(cv)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Consulter un CV par ID
exports.getCV = async (req, res) => {
  try {
    const cv = await CV.findById(req.params.id)
    if (!cv) {
      return res.status(404).json({ message: "CV non trouvé" })
    }
    res.json(cv)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Postuler à une offre
exports.applyJob = async (req, res) => {
  try {
    const candidateId = req.user.id
    const { job, coverLetter } = req.body

    if (!job) {
      return res.status(400).json({ message: "L'offre d'emploi est obligatoire." })
    }

    // Retrieve candidate's CV to link it
    const cv = await CV.findOne({ candidate: candidateId })

    // Check if already applied
    const existingApp = await Application.findOne({ candidate: candidateId, job })
    if (existingApp) {
      return res.status(400).json({ message: "Vous avez déjà postulé à cette offre." })
    }

    const app = await Application.create({
      candidate: candidateId,
      job,
      cv: cv ? cv._id : null,
      coverLetter
    })

    res.status(201).json(app)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Récupérer les candidatures de l'utilisateur connecté
exports.getApplications = async (req, res) => {
  try {
    const apps = await Application.find({ candidate: req.user.id })
      .populate('job')
      .sort({ createdAt: -1 })
    res.json(apps)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Changer le statut (recruteur)
exports.updateStatus = async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status }, // matches 'status' in ApplicationSchema
      { new: true }
    )
    if (!app) {
      return res.status(404).json({ message: "Candidature non trouvée" })
    }
    res.json(app)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}