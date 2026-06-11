const router = require('express').Router()
const { applyJob, getApplications, updateStatus } = require('../controllers/cvControllers')
const { verifyAccessToken } = require('../middlewares/authMiddlewares')

router.post('/', verifyAccessToken, applyJob)
router.get('/', verifyAccessToken, getApplications)
router.put('/:id', verifyAccessToken, updateStatus)

module.exports = router