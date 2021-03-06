var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var session = require('express-session');

var config ={
    user:'sidhuparas1234',
    database: 'sidhuparas1234',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};
var pool = new Pool(config);
var app = express();
app.use(morgan('combined'));

app.use(session({
    secret:''
}));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.post('/login', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    
    pool.query('SELECT * FROM users username = $1',[username], function (err, result){
        if(err){
            res.status(500).send(err.toString());
        } else{
            if(result.rows.length===0){
                
            }
            res.send('User successfully created: '+username);
        }
    });
});

app.post('/create-user', function(req, res){
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(128).toString('hex');
    var dbString = hash(password, salt);
    
    pool.query('INSERT INTO users (username, password) VALUES ($1, $2)',[username, dbString], function (err, result){
        if(err){
            res.status(500).send(err.toString());
        } else{
            res.send('User successfully created: '+username);
        }
    });
});

function hash(input, salt){
    var hashed = crypto.pbkdf2Sync(input, salt,10000,20,'sha512');
    return ['pkdf2','10000', salt, hashed.toString('hex')].join('$');
}

var salt = 'paras-sidhu';

app.get('/hash/:input', function(req,res){
   var hashedString = hash(req.params.input, salt);
   res.send(hashedString);
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'style.css'));
});


app.get('/test-db', function(req, res){
    pool.query('SELECT * FROM test', function(err, result){
       if(err) {
           res.status(500).send(err.toString());
       }else{
           res.send(JSON.stringify(result.rows));
       }
    });
});

app.get('/ui/madi.png', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'madi.png'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'main.js'));
});

app.get('/article-one', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'article-one.html'));
});

var counter = 0;
app.get('/counter', function(req,res){
    counter = counter+1;
    res.send(counter.toString());
    
});

var names = [];
app.get('/submit-name', function(req,res){
   
   var name = req.query.name;
   names.push(name);
    res.send(JSON.stringify(names));    
});



// Do not change port, otherwise your app won't run on IMAD servers
// Use 8080 only for local development if you already have apache running on 80

var port = 80;
app.listen(port, function () {
  console.log(`IMAD course app listening on port ${port}!`);
});
