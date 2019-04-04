//----------------------- libraries------------------------------------------
var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var cookieParser = require('cookie-parser');
var request = require('request');
var axios = require('axios');
var bodyParser =  require('body-parser');
const {client_id,client_secret,uri,dbname,collec} = require('./config');
//----------------------- mongo db ------------------------------------------
const MongoClient = require('mongodb').MongoClient;

// -------------------- Express config --------------------------------------
var app = express();
app.set('port', process.env.PORT || 8081);
app.use(morgan('dev'));
app.use( bodyParser.json());       
app.use(bodyParser.urlencoded({     
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
  //prueba con request
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
  //prueba con axios
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
    const uri = "mongodb://127.0.0.1:27018/albumes";
    const client = new MongoClient(uri, { useNewUrlParser: true });
    client.connect((err) => {
      if(err) throw err;
      console.log("conected to the db");
      const collection = client.db(dbname).collection(collec);
      collection.insertMany(parseditems);
      // perform actions on the collection object
      client.close();
    });
    res.json({'data':parseditems})
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

