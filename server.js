// server.js
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

app.use(express.static(__dirname + '/public'));
//redirect / to our index.html file
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/public/index.html');
});

// 5 min in millisecond:xˀ
var timeLimit = 5*60*60*1000;

let checkIfUserIsOnline = (lastSeen) => {
    return ( Date.now() - lastSeen <= timeLimit )
}

const getData = (dbo) => {
return dbo.collection("user_status").find().toArray();
}

app.get('/status/:userId',function(req, res, next) {
    var userIdFromParam = parseInt(req.params['userId']);
    MongoClient.connect( url, function(err, db){
        if (err) throw err;
        var dbo = db.db("offline-online-indicator");
        var findQuery = { userId :  userIdFromParam }
        const result = dbo.collection("user_status").find(findQuery).toArray(function(err, res) {
                                if (err) throw err;
                                if( this.checkIfUserIsOnline(res[0].lastSeen)){
                                       res.send("User" + userIdFromParam + "is online")
                                       console.log("User : is online")
                                }
                                else{
                                      res.send("User" + userIdFromParam + "is offline")
                                      console.log("User is offline")
                                }
                                db.close()
                     });
        });
});


app.get('/getAllUsers',function(req, resp, next) {
    let userOnline = [], userOffline = [], arr = [];
    MongoClient.connect( url, function(err, db){
        if (err) throw err;
        var dbo = db.db("offline-online-indicator");
        return getData(dbo).then((res) => {
        console.log(res)
            res.forEach((item, index) => {
                if( checkIfUserIsOnline(item.lastSeen)){
                   // userOnline.push(item.userId);
                   userOnline = [...userOnline, item.userId]
                }
                else{
                    //userOffline.push(item.userId);
                     userOffline = [...userOffline, item.userId]

                }
            })
            resp.send([...userOnline, ...userOffline])
            console.log({userOnline});
            console.log({userOffline});
        }).catch((err) => {
            throw err
        })
        });


});

//when a client connects, do this
io.on('connection', function(client) {
    console.log('Client connected...')
    client.on('HeartBeat', function(data) {

            // update the last_seen for the userId in the DB.

            MongoClient.connect(url, function(err, db) {
              if (err) throw err;
              var dbo = db.db("offline-online-indicator");
              var myQuery = { userId : parseInt(data.userId) };
              var newValues = { $set : { userId: parseInt(data.userId) , lastSeen: data.timeStamp }};
              const options = { upsert: true };
              const result = dbo.collection("user_status").findOneAndUpdate(myQuery, newValues, options, function(err, res) {
                console.log(res)
                if(err)
                    throw err;
                console.log("Updated epoch for user id: ".concat(data.userId));
                db.close();
              });
              console.log(result);
            })

            console.log("userId : ".concat(data.userId))
            console.log("timestamp : ".concat(data.timeStamp))
    });
});

//start our web server and socket.io server listening
server.listen(3000, function(){
  console.log('listening on *:3000');
});