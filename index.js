const { default: axios } = require('axios')
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 3000

express()
  .use(express.json())
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', async(req, res) =>{
    const data = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=39113d47500d6a832e88e500d36006ec&language=en-US`)
let newdata = data.data.results
console.log("essa bosta de data era pra funcionar",newdata)
    res.json(newdata)})
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
