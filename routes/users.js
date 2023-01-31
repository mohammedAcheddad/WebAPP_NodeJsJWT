const express=require('express');
const bcrypt=require('bcrypt');
const { User } = require('../models/User');

const router=express.Router();
const jwt = require("jsonwebtoken");


//register
router.post("/register", async (req, res) => {
  const { login, pwd, pwd2, name } = req.body;
  if (!login || !pwd || !pwd2 || !name)
    return res.status(400).json({ message: "all fields are required" });
  if (pwd !== pwd2)
    return res.status(400).json({ message: "passwords don't match" });
  let searchUser = await User.findOne({ login: login });
  if (searchUser)
    return res.status(400).json({ message: "login already exists" });
  const mdpCrypted = await bcrypt.hash(pwd, 10);
  const user = new User({
    login: login,
    name: name,
    pwd: mdpCrypted,
    memos: [],
  });
  user.save()
    .then(() => res.status(201).json({ message: "success" }))
    .catch((err) => res.status(500).json({ message: err }));
});


//login
router.post("/login", async (req, res) => {
  const { login, pwd } = req.body;
  const findUser = await User.findOne({ login: login });
  if (!findUser) return res.status(404).json({ message: "no user found" });
  const match = await bcrypt.compare(pwd, findUser.pwd);
  const hashedpass = findUser.pwd
  if (match) {
    const token = jwt.sign({ login ,hashedpass}, "SECRET", {
      expiresIn: "1h",
    });
    return res.json({ message: "login success", token, name: findUser.name });
  }
  res.status(400).json({ message: "incorrect password" });
});


//logout
router.post("/logout", async (req, res) => {
  const token = req.headers.authorization;
  jwt.verify(token, "SECRET", (err, decoded) => {
    if (err) return res.status(400).json({ message: "invalid token" });
    res.json({ message: "logout success" });
  });
});


//deleting a user 
router.delete("",async (req,res)=>{
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, "SECRET");
  try{
  const user= await User.findOne({login:decoded.login})

  if(!user)
      throw ("not allowed sorry")
      
  // Deleting user from databse
  await User.findOneAndDelete({login:decoded.login})

  res.json({message:'delete with success'})

  
  }
  catch(err){
      res.status(500).send({message:err})
  }
})



//update user's informations login/password/name
router.post("/update",async (req,res)=>{
  const {login, pwd , name} = req.body
  const token = req.headers.authorization;
  const decoded = jwt.verify(token, "SECRET");
  const user= await User.findOne({login:decoded.login})
  if(login =="a" && pwd == "a")
    user.name = name;
  //we need to check in this case if there is another user with the same login
  if(name =="a" && pwd == "a"){
    user.login = login
    let searchUser = await User.findOne({ login: login });
    if (searchUser)
      return res.status(400).json({ message: "login already exists" });
  }
  if(login =="a" && name == "a")
    user.pwd = await bcrypt.hash(pwd, 10);
  
  //we need to create a new token since the data has been changed
  const newtoken = jwt.sign({ login:user.login ,pwd:user.pwd}, "SECRET", {
      expiresIn: "1h",
    });
  // saving the new user
  user.save()
  .then(() => res.status(201).json({ message: "saving succesful" ,token:newtoken,user:user}))
  .catch((err) => res.status(500).json({ message: err }));
  

})

module.exports.UserRouter = router;