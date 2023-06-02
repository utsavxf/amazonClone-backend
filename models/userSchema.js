
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt=require("bcryptjs")
const jwt = require("jsonwebtoken");
const keysecret = process.env.KEY;

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("not valid email address");
            }
        }
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    cpassword: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    carts:Array
});



userSchema.pre("save",async function(next){
  
    if(this.isModified("password")){
        
    this.password=await bcrypt.hash(this.password,12);  
    this.cpassword=await bcrypt.hash(this.cpassword,12); 
    } 

    next();

})


//token generation process
//as soon as we match the password after user has logged in ,this function will be called
userSchema.methods.generateAuthtoken = async function(){
    try {
        let token = jwt.sign({ _id:this._id},keysecret,{  //we are sending our id as a payload,and yeh waali id hai mongodb waali
            expiresIn:"1d"
        });
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;

    } catch (error) {
        console.log(error);
    }
}

//add data to the cart
userSchema.methods.addcartdata=async function(cart){
    try {
        this.carts=this.carts.concat(cart);
        await this.save();
    } catch (error) {
        console.log('Error while saving product to cart',+error);
        
    }
}












const User = new mongoose.model("USER", userSchema);





module.exports = User;




