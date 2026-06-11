const express=require('express')

const {signin, signup, signout}=require('../controllers/authControllers')

const router=express.Router()

router.post('/signup',signup)
router.post('/signin',signin)
router.post('/signout',signout)


module.exports=router


