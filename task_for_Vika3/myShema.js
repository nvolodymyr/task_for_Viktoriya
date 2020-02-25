const mongoose = require('mongoose')

const fanSchema = new mongoose.Schema({
    id: {
        type: Number,
    },
    text: {
        type: String,
        required: true
    }


})

module.exports = mongoose.model('Fan', fanSchema)