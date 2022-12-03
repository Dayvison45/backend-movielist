import axios from 'axios'
import  express  from  'express'
import cors from "cors"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import bcrypt from "bcrypt"
import * as dotenv from 'dotenv' 
dotenv.config()
const secret = process.env.DB_SECRET


import userModel from "./models/userModel.js"
const linkDB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3v8vfkh.mongodb.net/MovieList?retryWrites=true&w=majority`
mongoose.connect(linkDB).then(console.log("database connect")).catch(err=>console.log(err))

async function checktoken (req,res,next){
  const authHeader = await req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if(!token){
    return res.status(401).json({msg:"acesso negado"+token})}
  try{
jwt.verify(token,secret)
next()}
catch(err){console.log(err)}}




const PORT = process.env.PORT || 3000

express()
.use(cors())
  .use(express.json())
  .set('view engine', 'ejs')
  .post("/login", async(req,res)=>{
    const {name,password} = req.body
   const user = await userModel.findOne({name:name})
   if(user){try{const token= jwt.sign({
    id:user._id
      },secret,{expiresIn:600000})
  user.updateOne({token:token})
  let  newuser = user
  newuser.password = null

  res.status(200).json({newuser,token})
  }catch(err){
  console.log(err)}}else{
    res.status(401).json({msg:"dados errados"}) }}
    ).post("/subscribe", async(req,res)=>{
  const {name,password} = await req.body

  if(!name){
      res.status(422).json({msg:"Coloque um nome válido"})}
  if(!password){
      res.status(422).json({msg:"Coloque uma senha válido "})}
  //criar usuario e senha
  const salt = await  bcrypt.genSalt(12)
  const passwordHash = await bcrypt.hash(password,salt)
  const userexist = await userModel.findOne({name:name})
  if(userexist){
    res.status(401).json({msg:"user ja existente"})
  }else{const user = await new userModel({ name:name,password:passwordHash});
  user.save()
  res.status(200).json({msg:"usuario criado com sucesso"})}}
  ).post('/log',checktoken, async(req,res)=>{
  const {id} = req.body
   const user = await userModel.findOne({_id:id})
   try{const token= jwt.sign({
    id:user._id },secret,{expiresIn:600000})
  user.updateOne({token:token})
  let  newuser = user
  newuser.password = null
  res.status(200).json({newuser,token})
  }catch(err){
res.status(401).json(err)}
  }
  ).post('/addlist',  checktoken, async(req,res)=>{
 const {list,id} = req.body
 const newuser = await userModel.findOne({_id:id})
 let mapear=false
 newuser.list.map((e)=>e.id===list.id?mapear=true:"")
 mapear===false?addMovie(list):removeMovie(list)
 async function removeMovie(x){
    const newlist= await newuser.list.filter(e=> e.id!==x.id)
    newuser.list = newlist
  await  newuser.save().then(res.status(200).json({msg:"item removido da sua lista"}))
  console.log('item removido')}

 async function addMovie(x){
   newuser.list.push(x)
    newuser.save().then(res.status(200).json({msg:'item adicionado a sua lista'}))
    console.log('item adicionado')
 }
}
).post("/search",async(req,res)=>{
  const {data,genre,type} = req.body
  console.log(data)
  const respo = []
console.log(genre)
if(genre){
  await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}&language=en-US&with_genres=${genre}`).then(response=>response.data.results[0]?respo.push(response.data.results):'').catch(err=>console.log(err)) 
  res.status(200).json(respo)

}
if(data){
  await axios.get(`https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&language=en-US&query=${data.replaceAll(" ","+")}`).then(response=>respo.push(response.data.results)).catch(err=>console.log(err))
  res.status(200).json(respo)
}

  // await axios.get(`https://api.themoviedb.org/3/search/tv?api_key=39113d47500d6a832e88e500d36006ec&language=en-US&query=Mr Robot`)
  // await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}&language=en-US&query=${data.replaceAll(" ","+")}&without_genres=${genre}`).then(response=>response.data.results[0]?respo.push(response.data.results):'').catch(err=>console.log(err))
  // await axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${process.env.API_KEY}&language=en-US&query=${data.replaceAll(" ","+")}&without_genres=${genre}`).then(response=>response.data.results[0]?respo.push(response.data.results):'').catch(err=>console.log(err))
}).post('/list',checktoken ,async(req,res)=>{
  const {id} = req.body
   const user = await userModel.findOne({_id:id})
   const data = user.list
 
  const respo = []
  //const data = [{name:"The Godfather",type:"movie"},{name:"Mr robot",type:"tv"}]   
  data.map(async(e)=> await axios.get(`https://api.themoviedb.org/3/search/${e.release_date?"movie":"tv"}?api_key=${process.env.API_KEY}&query=${e.name?e.name.replaceAll(" ","+"):e.title.replaceAll(" ","+")}`).then(response=>respo.push(response.data.results[0])).catch(err=>console.log("nome errado")) )
  setTimeout(resposta,2000)
  function resposta(){
    res.status(200).json(respo)
  }
  }).get('/movies', async(req,res)=>{
  const movies = []
  await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}&page=1`).then(response=>movies.push(response.data)).catch(err=>console.log(err))
  await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}&language=en-US&with_genres=28`).then(response=>movies.push(response.data)).catch(err=>console.log(err))
  await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}&language=en-US&with_genres=12`).then(response=>movies.push(response.data)).catch(err=>console.log(err))
  await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}&language=en-US&with_genres=16`).then(response=>movies.push(response.data)).catch(err=>console.log(err))
   res.status(200).json(movies)
  }).get('/series', async(req,res)=>{
  const movies = []
  await axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${process.env.API_KEY}&page=1`).then(response=>movies.push(response.data)).catch(err=>console.log(err))
  await axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${process.env.API_KEY}&language=en-US&with_genres=10759`).then(response=>movies.push(response.data)).catch(err=>console.log(err))
  await axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${process.env.API_KEY}&language=en-US&with_genres=16`).then(response=>movies.push(response.data)).catch(err=>console.log(err))
  await axios.get(`https://api.themoviedb.org/3/discover/tv?api_key=${process.env.API_KEY}&language=en-US&with_genres=35`).then(response=>movies.push(response.data)).catch(err=>console.log(err))
  res.status(200).json(movies)}
  ).get("/", async(req,res)=>{
const movies = []
await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${process.env.API_KEY}&language=en-US`).then(response=>movies.push(response.data)).catch(err=>console.log(err))
await axios.get(`https://api.themoviedb.org/3/tv/popular?api_key=${process.env.API_KEY}&language=en-US`).then(response=>movies.push(response.data)).catch(err=>console.log(err))
await axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${process.env.API_KEY}&language=en-US&page=1`).then(response=>movies.push(response.data)).catch(err=>console.log(err))
res.status(200).json(movies)})



  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
