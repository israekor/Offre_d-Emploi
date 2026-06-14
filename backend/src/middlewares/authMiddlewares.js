const jwt=require("jsonwebtoken")
const dotenv=require('dotenv')

dotenv.config({path:'../../.env'})





 const verifyAccessToken=async(req,res,next)=>{
    const publicRoutes=[
        '/auth/signin','/auth/signup','/auth/sendcode','/auth/verifycode','/auth/resetpwd'
    ]
    if(publicRoutes.includes(req.path)){
      return  next()
    }
    try{
        const acctok=req.cookies.accessToken
        if(!acctok){
            return res.status(421).send("Access token missing")
        }
        const accessSecret=process.env.ACCESS_SECRET
        const decoded = jwt.verify(acctok,accessSecret)
        req.user = decoded;
        return next()

    }catch(err){
        res.status(421).send("Invalid or expired access token")
    }

}


function callingRefreshToken(req,res){
    const reftok=req.cookies.refreshToken
    if(!reftok){
        console.log("Refresh token est invalide !")
        return res.status(422).json({message:'Veuillez vous reconnecter !'})
    }
    
    try{
        const decoded=jwt.verify(reftok,process.env.REFRESH_SECRET)
        const at=generateAccessToken(decoded.id,decoded.role)

        res.cookie('accessToken',at,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:'Strict',
            maxAge:10*60*1000
        })
        return res.status(200)
    }catch(err){
        console.log("Refresh token is invalid !")
        res.status(422).json({message:'Session expirée !'})

    }

}


module.exports={verifyAccessToken,
    callingRefreshToken
}