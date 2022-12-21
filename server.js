const express = require('express')
const mongoose = require('mongoose')
const { v4 } = require('uuid')
const Post = require('./model')
const cors = require('cors')
const { writeFile, unlink, createReadStream } = require('fs')
const path = require('path')
const { log } = require('console')
require('dotenv').config()
const app = express()
const _path = path.join(__dirname, 'public')
mongoose.set('strictQuery', true)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Uploads')
app.use(cors())
app.use(express.static(_path))
app.use(express.json())


app.get('/', (req, res) => {
   res.sendFile(_path + '/index.html')
})

app.post('/', async (req, res) => {
   const { name, body, image } = req.body

   try {
         if(name.length < 6 || !name) {
         res.send(JSON.stringify('Name field must be greater than 6 letters'))
         }

         if(body.length < 25 || !body) {
            res.send(JSON.stringify('Body field must be greater than 25 letters'))
         }
         const filePath = `./images/${v4()}.jpeg`
   
       writeFile(filePath, Buffer.from(image.split(',')[1], 'base64'),  (err, data) => {})
        
       const post = new Post({...req.body, imagePath:filePath.split('/')[2]})
       await post.save()
       return res.send(JSON.stringify(post))
   
         
   } catch (error) {
      return res.send(JSON.stringify(error.message))
   }

})

app.post('/edit', async (req, res) => {
  try {
           const { postId, name, body } = req.body
           const post = await Post.findById(postId)
           if(name.length < 6 || !name) {
              res.send(JSON.stringify('Name field must be greater than 6 letters'))
            }

           if(body.length < 25 || !body) {
                res.send(JSON.stringify('Body field must be greater than 25 letters'))
           }
           if('image' in req.body){
                const { postId, name, body, image } = req.body
                
               writeFile(`./images/${post.imagePath}`, Buffer.from(image.split(',')[1], 'base64'), async ( err, data) => {
                  console.log('updated profile');
                })
                const getPost = await Post.findByIdAndUpdate(postId, { name, body }, {new:true})
                return res.send(JSON.stringify({...getPost, isEdited:true }))
          
           }else{
               const { postId, name, body } = req.body
               const getPost = await Post.findByIdAndUpdate(postId, { name, body }, {new:true})
               return res.send(JSON.stringify({...getPost, isEdited:true }))
           }

  } catch (error) {
      return res.send(JSON.stringify(error.message))
  }
})

app.get('/post/:id', async(req, res) => {
     const { id } = req.params
    try {
        const post = await Post.findById(id)

        return res.send(JSON.stringify(post))
    } catch (error) {
      return res.send(JSON.stringify(error.message))
    }
})

app.get('/delete/:postId', async (req, res) => {
   try {
           const { postId } = req.params
           const { imagePath } = await Post.findById(postId)
           const deletedPost = await Post.findByIdAndDelete(postId)
           unlink( `./images/${imagePath}`, (err) => { })

           return res.send(JSON.stringify(deletedPost))

   } catch (error) {
       return res.send(JSON.stringify(error.message))
   }
})

app.get('/posts', async(req, res) => {
    try {
         const posts = await Post.find()
         if(posts.length <= 0){
            return res.send(JSON.stringify('No Post to show'))
         }
         return res.send(JSON.stringify(posts.reverse()))
    } catch (error) {
        return res.send(JSON.stringify(error.message))
    }
})

app.get('/image/:filename', async (req, res) => {
    try {
          const { filename } = req.params
          const { imagePath } = await Post.findOne({imagePath:filename})
          const imageReadStream = await createReadStream(`./images/${imagePath}`) // split data and pass it in chunks
          return imageReadStream.pipe(res)                  
    } catch (error) {
     return res.send(JSON.stringify('defaultImage.png'))
    }
})

app.listen( process.env.PORT || 3000, () => console.log(`server is running on port ${process.env.PORT}...`))

