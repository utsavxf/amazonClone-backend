const express = require('express');

const router = new express.Router();
const Products = require("../models/productsSchema");
const User = require('../models/userSchema');
const bcrypt = require("bcryptjs");
const authenticate = require('../middleware/authenticate');



//get product data
router.get("/getproducts", async (req, res) => {
    try {

        const productsdata = await Products.find();
        // console.log(productsdata);
        res.status(200).json(productsdata);


    } catch (error) {
        console.log('Error while retrieving products from database' + error.message);
        res.status(400).json("Error in getproductsone");
    }
})


//get individual data and show it in cart section
//this id is the id which is already present in the products data,note that we are not using mongodb id here ,(the diff id in mongodb-_id and here we are  just using id)
router.get("/getproductsone/:id", async (req, res) => {
    try {
        const { id } = req.params;  //url se hi lelenge jis par endpoint hit hua hai
        //  console.log(id);

        const individualdata = await Products.findOne({ id: id })//first waali to key hai and second waala jo hum req.params se get kar rahe  hai vo (SO WE CAN ONLY WRITE ID ALSO AS KEY AND ID ARE SAME)


        // console.log(individualdata);

        return res.status(200).json(individualdata)


    } catch (error) {
        return res.status(200).json("Error in getproductsone")
    }
})


//signing up users

router.post("/register", async (req, res) => {
    //   console.log(req.body);

    //performing validations
    const { fname, email, mobile, password, cpassword } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ error: "filll the all details" });
    };

    try {

        const preuser = await User.findOne({ email: email });

        if (preuser) {
            res.status(422).json({ error: "This email is already exist" });
        } else if (password !== cpassword) {
            res.status(422).json({ error: "password are not matching" });;
        } else {

            const finaluser = new User({
                fname, email, mobile, password, cpassword
            });

            // yaha pe hasing krenge




            //password hashing using pre.save method



            const storedata = await finaluser.save();
            // console.log(storedata + "user successfully added");
            res.status(201).json(storedata);
        }

    } catch (error) {
        console.log("Error while user registration" + error.message);
        res.status(422).send(error);
    }


})


//login user

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "fill all the data" })
    }

    try {




        const userlogin = await User.findOne({ email: email })
        //  console.log(userlogin);

        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password)  //first one is the password which user sent from the frontend and second one jo uselogin hai uska database se laayenge 
            // console.log(isMatch);


            if (!isMatch) {
                return res.status(400).json({ error: "password do not match" })
            } else {

                //generation of token
                const token = await userlogin.generateAuthtoken();
                // console.log(token);

                res.cookie("Amazonweb", token, {     //cookie banayi with the name Amazonweb and store the jwt token in it ,set the expiry date and send it to the frontend using cookieParser
                    expires: new Date(Date.now() + 9000000),
                    httpOnly: true
                })

                return res.status(201).json(userlogin)
            }

        } else {
            return res.status(400).json({ error: "user does not exist" })
        }


    } catch (error) {
        return res.status(400).json({ error: "invalid details" })

    }



})


//adding the data into the cart
//firslt this authenticate(middleware) function will be called
router.post("/addcart/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const cart = await Products.findOne({ id: id });
        // console.log(cart+"cart value");

        const UserContact = await User.findOne({ _id: req.userID })
        // console.log(UserContact);

        //Ab product ki jo id(value) thi vo to hume milgayi thi jab hum kisi product ko addtocart karenge,user ki jo id thi vo middleware se mili,jab humne authenticate karke token me se pata lagaya knosa user hai,ya koi hai bhi
        //now what we'll do is us User ke cart me product daaldenge,and we'll do that by creating a function in UserSchema

        if (UserContact) {
            const cartData = await UserContact.addcartdata(cart)   //using instance method for addtocart
            await UserContact.save();
            // console.log(cartData);
            res.status(201).json(UserContact);

        } else {
            res.status(401).json({ error: "invalid user" })
        }


    } catch (error) {
        res.status(401).json({ error: "invalid user" })
    }


})


//getting data from cart
router.get('/cartdetails', authenticate, async (req, res) => {
    try {
        //ab bolege ye useriD kaha se aayi,abe ye hume middleware se mil rahi hai
        const buyuser = await User.findOne({ _id: req.userID })
        res.status(201).json(buyuser);
    } catch (error) {
        console.log('Error while retrieving carts data' + error);

    }

})

//get valid user
router.get('/validuser', authenticate, async (req, res) => {
    try {
        //ab bolege ye useriD kaha se aayi,abe ye hume middleware se mil rahi hai
        const validuserone = await User.findOne({ _id: req.userID })
        res.status(201).json(validuserone);
    } catch (error) {
        console.log('Error while retrieving carts data' + error);

    }

})

//remove item from cart
router.delete('/remove/:id', authenticate, async (req, res) => {

    try {

        const { id } = req.params;

        //matalb us item ko chodkar baaki saari items return karvaenge
        //this filter  method returns us a new array
        req.rootUser.carts = req.rootUser.carts.filter((currentval) => {
            return currentval.id != id;
        })


        req.rootUser.save();
        res.status(201).json(req.rootUser);
        console.log('item removed');

    } catch (error) {
        console.log('Error while deleting item from cart' + error);

        res.status(400).json(req.rootUser);
    }


})

//for user logout
//we want ki logout ke click par token and cookie both should be deleted
router.get("/logout", authenticate, async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
            return curelem.token !== req.token
        })


        res.clearCookie("Amazonweb", { path: "/" });

        req.rootUser.save();

        res.status(201).json(req.rootUser.tokens);
        console.log('user logout');
    } catch (error) {
        console.log('error while logging out user');

    }
})










module.exports = router;