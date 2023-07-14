const express = require("express");
const app = express();
const cors = require("cors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 10;
// parse or stringify data
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

const mongoose = require("mongoose");
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://Malika:Auma123@cluster0.gffsotd.mongodb.net/?retryWrites=true&w=majority');
}
// model
const User = mongoose.model("User", {
  username: String,
  password: String,
})

// sign up routes
app.post("/signup", async (req, res)=>{
  // check if user exists
  const checkUser = await User.findOne({username: req.body.username})
  if (checkUser){
    res.status(409).send({msg:"Username already taken!"})
  }

  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.password, salt, async function(err, hash) {
      const user = { "username": req.body.username, "password": hash}
      await User.create(user);
      res.send({msg: "user created successfully"})
        
    });
});
})

// login routes
app.post("/login", async (req, res)=>{
  const user =  await User.findOne({username: req.body.username});
  if (user) {
    bcrypt.compare(req.body.password, user.password, function(err, result) {
      if (result) {
        //delete user.password;
        // let data = {_id: user._id, username: user.username}
        // create a token and send to front
        // payload = { id: user._id }
        // payload + secret = token
        var token = jwt.sign({id: user._id }, 'authtesting', { expiresIn: 30});
        res.send({token})
      } else {
        res.send({msg: "wrong password"})
      }
  })
  } else {
    res.send({msg: "wrong username"})
  }
})

app.post("/verify", async (req, res)=>{
  // return the user data if token is valid
  // get token from frontend, 
  if (!req.body.token) {
    res.send({msg: false})
  }
  try {
    // decrypt and get back user id
  let payload = jwt.verify(req.body.token, "authtesting")

  // check if user exists with that id
  if (payload) {
    let user = await User.findOne({_id: payload.id})

  // if user exists send back user data
  if (user) {
    // every verify will give a new token on refresh
    var token = jwt.sign({id: user._id }, 'authtesting', { expiresIn: 30});
    res.send({
      data: user,
      token: token
    })
  } else {
    res.send("Invalid token")
  }
  } else {
    res.send({"error": true,"message":"Token expired or invalid."})
  } 
  } catch (error) {
    res.status(401).json({'error': error,'message':'Unauthorized'})
  }
  
})



app.listen(3636, () => {
  console.log("server is running on port 3636")
})