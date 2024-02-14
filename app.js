//LIBRAIRIE

var express = require('express');
var app = express();
//Middleware pour recuperer la donnée
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: false}));

//fichier de configuration
require('dotenv').config();

// var path = require('path');

//Connexion mongodb :
var mongoose = require('mongoose'); 
const url = process.env.DATABASE_URL;

mongoose.connect(url)
.then(console.log("Mongodb connected"))
.catch(err => console.log(err));

//Systeme de vue EJS
app.set('view engine', 'ejs');

//Mettre a disposition les données et les rendres accessible pour le front
const cors = require('cors');
//De base
// app.use(cors());
//Transmettre TOUT type de données meme sensible (JWT)
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));


//Method put et delete pour express
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

//bcrypt : hashage de mot de passe
const bcrypt = require('bcrypt');

//Cookie parser : passage des données en cookie
const cookieParser = require('cookie-parser')
app.use(cookieParser());

//Import JWT
// const {createTokens, validateToken} = require('./JWT');

//Import jwt decode
const {jwtDecode} = require('jwt-decode');

//Multer : téléchargement d'image/fichier
const multer = require('multer')
app.use(express.static('uploads'));

const storage = multer.diskStorage({
    destination : (req, file, cb) =>{
        cb(null, 'uploads/')
    },
    filename : (req, file, cb) =>{
        cb(null, file.originalname);
    }
})
const upload = multer({storage})

app.get("/", function (req,res){
    res.render("Hero");
})


//INSCRIPTION PRO

var UtilisateurPro = require("./models/UtilisateurPro")

app.post("/api/inscriptionpro", function (req, res){
    const Data = new UtilisateurPro({
        nom : req.body.nom,
        prenom : req.body.prenom,
        email : req.body.email,
        tel : req.body.tel,
        societe : req.body.societe,
        siretTva : req.body.siretTva,
        adresse : req.body.adresse,
        url : req.body.url,
        password : bcrypt.hashSync(req.body.password, 10),
    })
    Data.save()
    .then(()=>{
        console.log("User saved");
        res.redirect("/accueil")

    })
    .catch(err=>{console.log(err);})
})

app.get("/inscriptionpro", function (req,res){
    res.render("InscriptionPro");
})

app.get("/recupdataform", function (req,res){
    res.render("recupdataform");
})

app.get("/connexion", function (req,res){
    res.render("Connexion");
})

app.get("/accueil", function (req,res){
    res.render("Accueil");
})


// RECUPERATION UTILISATEUR PRO
app.get("/utilisateurPro", function(req, res){
    UtilisateurPro.find()
    .then((data)=>{
        res.json(data);
    })
})


//CONNEXION 

app.post("/connexion", function (req, res){
    UtilisateurPro.findOne({
        email : req.body.email
    }).then(utilisateurPro =>{
        if(!utilisateurPro)
        {
            return res.status(404).send("No user found");
        }
        if (!bcrypt.compareSync(req.body.password, utilisateurPro.password)){
            return res.status(404).send("Invalid password")
        }
        //JWT à ce niveau la, mettre tout en public puis sécuriser à la fin

        // req.session.user = utilisateurPro;
        // res.render("accueil", {data : utilisateurPro})
        console.log("Connected");
        // res.json('LOGGED IN')
        res.redirect("http://localhost:3000/profil");
    })
    .catch(err =>{
        console.log(err);
        res.status(500).send("Erreur");
    })
});

app.get("/recupdataform/:id", function (req,res){
    UtilisateurPro.findOne({
        _id : req.params.id
    })
    .then((data)=>{
        res.json(data);
    })
    .catch(err => console.log(err));
})


//DECONNEXION 

app.get('/deconnexion', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Deconnected")
        res.redirect('/connexion');
      }
    });
});


//MODIFIER COMPTE

app.put("/recupdataform/:id", function (req, res) {  
    const Data = {
        nom : req.body.nom,
        prenom : req.body.prenom,
        email : req.body.email,
        tel : req.body.tel,
        siret : req.body.siret,
        adresse : req.body.adresse,
        url : req.body.url,
        password : bcrypt.hashSync(req.body.password, 10)
    }
    UtilisateurPro.updateOne({_id : req.params.id},{$set: Data})
    .then(()=>{
        console.log("Account updated");
        res.redirect("/Profil/"+req.params.id);
    })
    .catch(err=>{console.log(err);});
});

app.get("/profil/:id", function (req,res){
    UtilisateurPro.findOne({_id : req.params.id})
    .then((data)=>{
        res.render("Profil",{data : data})
    .catch(err =>{console.log(err);})
})
});
 

//SUPPRIMER COMPTE

app.delete("/supprimer/:id", function (req,res){
    UtilisateurPro.findOneAndDelete({_id:req.params.id})
    .then(()=>{
        console.log("Account deleted");
        req.session.user = UtilisateurPro;
        res.redirect("/accueil");
    })
    .catch((err)=>{console.log(err);})
});



//TISSU

var Tissu = require('./models/Tissu');
//formulaire nouveau produit
app.get('/newproduit', function(req, res){
    res.render('NewProduit')
});

//ajout du produit (tissu)
app.post('/newproduit',function(req, res){ 
    // avec les données reçues dans la requête on crée un nouveau produit/tissu
    const Data = new Tissu({
        titre : req.body.titre,
        couleur : req.body.couleur,
        // imageName : req.file.filename,
        description : req.body.description,
    })
    console.log(req.file);

    // Image obligatoire pour l'enregistrement d'un blog
    // if(!req.file){
    //     res.status(400).json("No File Uploaded")
    //     //si erreur d'ajout d'image
    // }
    // else{
        Data.save()
        .then(() =>{
            console.log("Fabric saved");
            res.status(201).json({"result" : "Fabric saved"})
            res.redirect('http://localhost:3000/affichertissu')
        })
        .catch(err =>console.error(err));
    // }

});

//recupération des tissu
app.get('/affichertissu', function(req, res){
    Tissu.find()
    .then((data)=>{
        res.json(data);
    })
});


// MODIFIER TISSU
app.put('/modiftissu/:id', function(req, res){
    const Data = {
        titre : req.body.titre,
        couleur : req.body.couleur,
        description : req.body.description,
    }
    Tissu.updateOne({
        _id : req.params.id
    }, {$set:Data})
    .then(()=>{
        res.redirect('http://localhost:3000/affichertissu/')
    })  
    .catch((err)=>{
        console.log(err);
    }); 
});


//SUPPRIMER TISSU 
app.delete('/supprimtissu/:id', function(req, res) {
    Tissu.findOneAndDelete({_id:req.params.id})
    .then(()=>{
        console.log("Fabric deleted");
        res.redirect('http://localhost:3000/affichertissu/');
    })
    .catch((err)=>{console.log(err);})
});


var server = app.listen(5000, function() {
    console.log("Server listening on port 5000");
});