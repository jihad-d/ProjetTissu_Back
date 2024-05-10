const mongoose = require('mongoose');
const utilisateurProSchema = mongoose.Schema({
    nom : { type: "string"}, 
    prenom : { type: "string"},
    email : { type : "string", required: true},
    tel : { type : "number"},
    societe : { type: "string", required: true},
    siretTva : { type : "number", required: true},
    adresse : { type: "string"},
    url : { type: "string"},
    vendeur: { type: Boolean, default: true },
    password : {type: 'string', required: true},
})

module.exports = mongoose.model("Users", utilisateurProSchema);