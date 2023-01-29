const { default: mongoose } = require("mongoose");
const { schemaMemo } = require("./Memo");

const schema= new mongoose.Schema({
    login:{
        type:String,
        required:true
    },
    pwd:{
        type:String,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    memos:[schemaMemo]
})
const User=mongoose.model("users",schema)
module.exports.User=User