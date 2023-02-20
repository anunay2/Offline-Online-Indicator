var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("offline-online-indicator");
  var userData = [];
  for( let i = 100; i < 200; i++){
    userData.push({userId : i, lastSeen : Date.now()});
  }
  console.log(userData);

  dbo.collection("user_status").insertMany(userData, function(err, res) {
    if (err) throw err;
    console.log("Number of documents inserted: " + res.insertedCount);
    db.close();
  });
});