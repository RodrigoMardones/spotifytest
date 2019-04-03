//----------------------- libraries------------------------------------------
var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var request = require('request');
var axios = require('axios');
var bodyParser =  require('body-parser');

//----------------------- mongo db ------------------------------------------

const mongoose = require('mongoose');
var Schema = mongoose.Schema;
var album = new Schema({
  type: String,
  artistName:String,
  AlbumDisc :String,
  releaseDate:String,
})
var Album = mongoose.model('Album',album);
//---------------------------------------------------------------------------

var client_id = '5de5cc1dea9a49248447e9c1fc8c883e'; 
var client_secret = 'f96497e6b670460a8b68279f9d9a1375'; 

var app = express();
app.set('port', process.env.PORT || 8081);

// -------------------- rutas de la SPA --------------------------------------
app.use(morgan('dev'));
app.use( bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());



//------------------ token -------------------------------------------------
app.get('/token', function(req, resp) {
  resp.header('Access-Control-Allow-Origin', '*');
  resp.header('Access-Control-Allow-Headers', 'X-Requested-With');

  // your application requests authorization
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      Authorization:
        'Basic ' +
        Buffer.from(client_id + ':' + client_secret).toString('base64')
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      resp.json({ token: body.access_token });
    }
  });
});
//------------------------- search ----------------------------------

app.post('/search',(req,res) => {
  let album = req.body.album;
  let token = req.body.token;
  let instance = axios.create({
    baseURL:`https://api.spotify.com/v1/search?q=${album}&type=album`,
    headers:{'Authorization':`Bearer ${token}`}
  })
  instance.get(
  )
  .then((resp)=>{
    let listitems = resp.data.albums.items;
    let parseditems = []
    let parsedalbum = (album) =>{
      parseditems.push({
        "type": album.album_type,
        "artistName":album.artists[0].name,
        "AlbumDisc" :album.name,
        "releaseDate":album.release_date,
        "AlbumImage" :album.images[0]
      })
    }
    
    listitems.forEach(element => {
      parsedalbum(element)
    });
    //conexion a base de datos aqui
    const uri = "mongodb+srv://RodrigoMardones:<asdfasdf12>@cluster0-y37sm.mongodb.net/test?retryWrites=true";
    mongoose.connect(uri,{ useNewUrlParser: true }).then(()=>{
      console.log("conectado a la bd")
    })
      .catch((err)=>{
        console.error(err)
      })
    res.json({'data':listitems})
  }).catch((err)=>{
    console.log('ERROR: ',err);
  })
})

//--------------------- 404 not found -------------------------------
app.get('*',(req,res) => {
  res.end("404 not found");
})
  

app.listen(app.get('port'), function() {
  console.log('La app de node esta corriendo en', app.get('port'));
});

