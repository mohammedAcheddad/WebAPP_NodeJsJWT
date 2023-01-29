const { default: mongoose } = require("mongoose");

const schema= new mongoose.Schema({
    date:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    }
})
const Memo=mongoose.model("memos",schema)

module.exports={schemaMemo:schema,Memo:Memo}