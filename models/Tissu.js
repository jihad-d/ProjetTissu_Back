const mongoose = require('mongoose')

const TissuSchema = mongoose.Schema({
    titre : {type: 'String'},
    image : {type: 'String'},
    couleur : {type: 'String'},
    description: {type: 'String'},
})

module.exports = mongoose.model('Tissu', TissuSchema);