const router = require('express').Router()
const { uploadCV, getCV, getMyCV } = require('../controllers/cvControllers')
const { verifyAccessToken } = require('../middlewares/authMiddlewares')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/'
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /pdf|doc|docx|jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Uniquement les fichiers PDF, DOC, DOCX, JPG, JPEG, PNG sont autorisés.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
})

const cpUpload = upload.fields([
  { name: 'cvFile', maxCount: 1 },
  { name: 'profilePic', maxCount: 1 },
  { name: 'coverPic', maxCount: 1 }
])

router.get('/my-cv', verifyAccessToken, getMyCV)
router.post('/', verifyAccessToken, cpUpload, uploadCV)
router.get('/:id', verifyAccessToken, getCV)

module.exports = router