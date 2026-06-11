
const jwt=require('jsonwebtoken')
const bcrypt =require('bcryptjs')
const dotenv=require('dotenv')
const crypto=require('crypto')

dotenv.config({path:"../../.env"})

const User = require("../../models/User");


const generateAccessToken=(id,role)=>{
    const accessSecret=process.env.accessSecret
    return jwt.sign({
        id:id, role:role
    },accessSecret,{
        expiresIn:"7d"
    })
}

const generateRefreshToken=(id,role)=>{
    const refreshSecret=process.env.refreshSecret
    const tokenID= bcrypt.hash(refreshSecret,5)
    return jwt.sign({id:id,role:role,tokenID:tokenID},refreshSecret,{
        expiresIn:'7d'
    })
}


const signup=async (req,res)=>{
    try{

    const{name,email,password,role,avatar,phone,location}=req.body
    const createdat=new Date()

    if(!email||!password||!name){
        return res.sendStatus(400)
    }

    const doublecheckemail=await User.findOne({email:email}) 
    if(doublecheckemail){
        return res.status(400).json({
            message:"Email est déjà utilisé !"
        })
    }
    const doublecheckusername=await User.findOne({name:name})
    if(doublecheckusername){
        return res.status(400).json({
            message:"Nom d'utilisateur est déjà utilisé !"
        })
    }


    const user = await User.create({ name,email,password,role,avatar,phone,location});
    const acctok=generateAccessToken(user.id,user.role)
     const reftok=generateRefreshToken(user.id,user.role)

     res.cookie("accessToken",acctok,{
        httpOnly:true,
        secure:process.env.node_env==='production',
        sameSite:'Strict',
        maxAge:7*24*60*60*1000
     })
     res.cookie("refreshToken",reftok,{
        httpOnly:true,
        secure:process.env.node_env==='production',
        sameSite:'Strict',
        maxAge:7*24*60*60*1000
     })
     console.log('User signed up successfully !')


    return res.status(200).json({ id:user.id,name:user.name,role:user.role,
    message: 'User signed up successfully !' 
    });


    }catch(err){
        res.status(500).json({ 
        message: 'Error while signing up !' 
        }); 
    }
}


const signin=async(req,res)=>{

  try{
    const email=req.body.email
    const password=req.body.password
    if(!email||!password){
        return res.sendStatus(400)
    }
    const user = await User.findOne({ email: email }).select("+password");;
    if (!user) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

    const isMatch = await user.comparePassword(password);
     if (!isMatch) {
      return res.status(400).json({ message: "Identifiants invalides" });
    }

     const acctok=generateAccessToken(user.id,user.role)
     const reftok=generateRefreshToken(user.id,user.role)

     res.cookie("accessToken",acctok,{
        httpOnly:true,
        secure:process.env.node_env==='production',
        sameSite:'Strict',
        maxAge:10*60*1000
     })
     res.cookie("refreshToken",reftok,{
        httpOnly:true,
        secure:process.env.node_env==='production',
        sameSite:'Strict',
        maxAge:7*24*60*60*1000
     })
     

     console.log( "Connexion réussie !")

    return res.status(200).json({ id:user.id,name:user.name,role:user.role,
    message: "Connexion réussie !"
    }); 
}catch(err){
    res.status(500).json({ 
       message: "Erreur lors de la connexion" 
       }); 
}
}



const signout=(req,res)=>{
    const acctok=req.cookies.accessToken
    const reftok=req.cookies.refreshToken

    if(!acctok&&!reftok)
        return res.sendStatus(400)
    try{
        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")
        return res.status(200).json({message:"logged out successfully !"})
    }catch(err){
    res.status(500).json({ 
       message: 'Error while signing out !' 
       }); 
}
}



module.exports={
    signin,
    signup,
    signout,
   
}
