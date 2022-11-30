import mongoose from "mongoose"


const user = mongoose.Schema({
    password:String,
    name:String,
    email:String,
    list:Array,
    login:Boolean
})

const userModel = mongoose.model("users",user)


export default userModel