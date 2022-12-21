const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    name: String,
    body:String,
    imagePath:String
})
module.exports = mongoose.model('POST', postSchema)