const Products=require("./models/productsSchema")
const productsdata=require('./constant/productsdata')

 
const DefaultData=async()=>{
    try {
        
        //kyuki ye function har baar ctrl+S se save karne me call hoga to extra data add na ho isiliye hum delete bhi karvaa rahe hai
       await Products.deleteMany({});

      const storeData=await Products.insertMany(productsdata);
    //    console.log(storeData);
       


    } catch (error) {
         console.log('Error while storing products data in mongodb'+ error.message);
         
    }
}

module.exports=DefaultData;