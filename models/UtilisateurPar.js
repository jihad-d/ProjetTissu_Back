const mongoose = require('mongoose');
const utilisateurParSchema = mongoose.Schema({
    nom : { type: "string"}, 
    prenom : { type: "string"},
    dateDeNaissance : { type: "string"},
    tel : { type: "string"},
    email : { type : "string"},
    password : {type: 'string', required: true},

})

module.exports = mongoose.model("Info", utilisateurParSchema);