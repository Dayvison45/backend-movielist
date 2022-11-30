import axios from 'axios'
import  express  from 'express'

const PORT = process.env.PORT || 3000
import fetch from 'node-fetch'
express()
  .use(express.json())
  .set('view engine', 'ejs')
  .get('/', async(req, res) =>{
    
    const newdata = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=39113d47500d6a832e88e500d36006ec&language=en-US`)
    setTimeout(resposta,1000)
    function resposta(){
      console.log(newdata.data.results)
      res.status(200).json(newdata.data.results)
    }    
  
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
