const mongoose = require('mongoose');
// rm8mkknFdobMK8uB
require("dotenv").config();


const DB=process.env.DATABASE

mongoose.connect(DB,{
    useUnifiedTopology:true,
    useNewUrlParser:true
}).then(()=> console.log('Database connected')
).catch((err)=>{
    console.log(err);
    
    console.log('An error ocurred');
    
}) 
