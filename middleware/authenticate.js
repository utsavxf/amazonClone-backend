const jwt = require('jsonwebtoken');
const User = require('../models/userSchema')

const keysecret=process.env.KEY;


const authenticate=async(req,res,next)=>{
    try {
        const token=req.cookies.Amazonweb;

        const verifyToken=jwt.verify(token,keysecret); 
        // console.log(verifyToken);    //if verified console par hume milega ek id and fir isi id ko hum use karenge user ko find karne ke liye,as ye vo waala id hai jo humne payload me bheja tha
        
         //see below for more details
        const rootUser=await User.findOne({_id:verifyToken._id,"tokens.token":token})  
        // console.log(rootUser);

        if(!rootUser){throw new Error("user not found")}

        req.token=token
        req.rootUser=rootUser
        req.userID=rootUser._id;
        //ye sab upar isiliye likha hai taaki ab hum router vaale page par req.token likhu to iski value aajaye
        
        next();


    } catch (error) {
         res.status(401).send("unauthorized:No token provided")
    }
}


module.exports=authenticate;




// const token=req.cookies.Amazonweb: This line extracts the JWT token from the Amazonweb cookie that was sent with the request.
// const verifyToken=jwt.verify(token,keysecret): This line verifies the token using the jwt.verify function and the secret key. If the token is valid, it returns the decoded token. If it is invalid, it will throw an error.
// console.log(verifyToken): This line logs the decoded token to the console.
// const rootUser=await User.findOne({_id:verifyToken._id,"tokens.token":token}): This line finds the user in the database by searching for the user with the matching ID and token. If a user is found, it is stored in the rootUser variable.

