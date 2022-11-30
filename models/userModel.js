const mongoose = require("mongoose")


const user = mongoose.Schema({
    password:String,
    name:String,
    email:String,
    list:Array,
    login:Boolean
})

const userModel = mongoose.model("users",user)
module.exports = userModel