const Job = require('../../models/Job');
const jwt=require('jsonwebtoken')


const createJob = async (req, res, next) => {

  try {

    const acctok=req.cookies.accessToken
    if(!acctok){
    return res.status(421)
    }
    const accessSecret=process.env.accessSecret
    const tok= jwt.verify(acctok,accessSecret)
    const id=tok.id


    const job = await Job.create({
      ...req.body,
      postedBy: id,  
    });

    res.status(201).json({
      success: true,
      message: "Offre publiée avec succès",
      data: job
    });
  } catch (err) {
    next(err);
  }
};


const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ status: 'active' })
      .populate('postedBy', 'name email company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (err) {
    next(err);
  }
};


const getJobById = async (req, res, next) => {
  try {
    
    const job = await Job.findById(req.params.id).populate('postedBy', 'name');

    if (!job) {
      return res.status(404).json({ success: false, message: "Offre non trouvée" });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (err) {
    next(err);
  }
};


const updateJob = async (req, res, next) => {
  try {
    const acctok=req.cookies.accessToken
    if(!acctok){
    return res.status(421)
    }
    const accessSecret=process.env.accessSecret
    const tok= jwt.verify(acctok,accessSecret)
    const id=tok.id

    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Offre non trouvée" });
    }

    if (job.postedBy.toString() !== id) {
      return res.status(403).json({ success: false, message: "Non autorisé" });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: "Offre mise à jour",
      data: job
    });
  } catch (err) {
    next(err);
  }
};

const deleteJob = async (req, res, next) => {
  try {
     const acctok=req.cookies.accessToken
    if(!acctok){
    return res.status(421)
    }
    const accessSecret=process.env.accessSecret
    const tok= jwt.verify(acctok,accessSecret)
    const id=tok.id

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Offre non trouvée" });
    }

    if (job.postedBy.toString() !== id) {
      return res.status(403).json({ success: false, message: "Non autorisé" });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: "Offre supprimée avec succès"
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob
};