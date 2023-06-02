
require("dotenv").config();   //for using environment variable which increases security
const express = require('express');
const app=express();
const mongoose = require('mongoose');
require("./db/conn")
const cors = require('cors');

const cookieParser =require("cookie-parser")

const Products=require("./models/productsSchema");
const defaultData = require("./defaultData");
const router = require("./routes/Router");



app.use(express.json());
app.use(cookieParser("")); 
app.use(cors());
app.use(router);

const  port=8005;

app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
    
});

defaultData();

