const express = require('express');
const router = express.Router();
const { 
  createJob, 
  getJobs, 
  getJobById, 
  updateJob, 
  deleteJob 
} = require('../controllers/jobsControllers.js');


router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', createJob);
router.put('/:id',  updateJob);
router.delete('/:id',deleteJob);

module.exports = router;