const express= require('express')
const {Memo} = require('../models/Memo');
const { User } = require('../models/User');
const jwt = require("jsonwebtoken");
const router = express.Router();

// ajouter
router.post("",async (req,res)=>{

    // recuperation des donnees envoyees
   const {date, content} =  req.body
   // verification
   if(!date || !content)
    return res.status(400).json({message:"date and content are required"})

    // creer une instance du model
    const memo=new Memo({
        date:date,
        content:content
    })
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, "SECRET");
    try{
    const dataMemo =  await memo.save()
    const user=await User.findOne({login:decoded.login})
    user.memos.push(dataMemo)
    const data = await user.save();
    res.json(data.memos[data.memos.length-1]);
    }catch(err)
    {
        res.status(500).send({message:err})
    }
})

// lister
router.get("",async (req,res)=>{
    const token = req.headers.authorization;
    try {
    const decoded = jwt.verify(token, "SECRET");
    const user=await User.findOne({login:decoded.login})
    const nbr = req.query.nbr || user.memos.length
    const dataToSend=user.memos.filter((elem,index)=>index<nbr)
    res.json(dataToSend)
    } catch(err){
    alert("login First")
    res.status(401).json({message:"unauthorized"})
    }
})
    


router.delete("/:idMemo",async (req,res)=>{
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, "SECRET");
    const idMemo = req.params.idMemo
    try{
    const user= await User.findOne({login:decoded.login})

    if(!user.memos.find(memo=>memo._id==idMemo))
        throw ("not allowed sorry")
        
    // suppression depuis la collection des memos
      await Memo.findByIdAndDelete(idMemo)
    
     user.memos.remove({_id:idMemo})
     await user.save();
    res.json({message:'delete with success'})

    
    }
    catch(err){
        res.status(500).send({message:err})
    }
})


module.exports.memosRouter= router;
