var express = require('express');
var request = require('request');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var axios = require('axios');
var morgan = require('morgan');

//ids de spotify
var client_id = '5de5cc1dea9a49248447e9c1fc8c883e'; // Your client id
var client_secret = 'f96497e6b670460a8b68279f9d9a1375'; // Your secret
var redirect_uri = 'http://127.0.0.1:3000/callback'
//inicio de instancia
var app = express();
//conf de puerto
app.set('port', process.env.PORT || 3000);


//rutas de la SPA 
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

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

app.get('/search',(req,res) => {
  res.end("se busca en el servicio");
})

//--------------------- 404 not found -------------------------------
app.get('*',(req,res) => {
  res.end("404 not found");
})


app.listen(app.get('port'), function() {
  console.log('La app de node esta corriendo en', app.get('port'));
});

