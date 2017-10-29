var express = require('express')
var bodyParser = require("body-parser");

var app = express()
var admin = require("firebase-admin");

var serviceAccount = require("./intellectdesignapi-firebase-adminsdk-aw85w-315c69a931.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://intellectdesignapi.firebaseio.com"
});

const db = admin.database();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/user/:id', function (req, res) {
  const userId = req.params.id;
  db.ref('users/'+userId).on("value", function(snapshot) {
    console.log(snapshot.val());
    res.send(snapshot);
    // snapshot.forEach(function(data) {
    //     console.log(data.key);
    // });
});
})

app.post('/user', function (req, res) {

db.ref("users").orderByChild("email").equalTo(req.body.email).once("value",snapshot => {
    const userData = snapshot.val();
    if (userData){
      var data = {
                    "resMsg" : "User Already exits!.",
                    "userId" : null,
                    "valErrors" : 201
                }
     res.send(data);
    } else {
        db.ref(`users/`).push(req.body, error => {
            if (error) {
            var data = {
                    "resMsg" : "Something went wrong.TryAgin!.",
                    "userId" : null,
                    "valErrors" : "500"
                }
            // Log error to external service, e.g. Sentry
            } else {
                var data = {
                    "resMsg" : "User created successfully.",
                    "userId" :  db.ref('users').push().getKey(),
                    "valErrors" : ""
                }
            res.send({data});
            }
        });
    }
});
})

app.put('/user/:id', function (req, res) {
    var hopperRef = db.ref("users/"+ req.params.id);
        hopperRef.update({
        "fName": req.body.fName,
        "lName": req.body.lName,
        "email": req.body.email,
        "pinCode": req.body.pinCode,
        "birthDate": req.body.birthDate,
        "isActive": req.body.isActive,
    }, function(error) {
    if (error) {
        var data = {
            "resMsg" : "Oops!Something went wrong.Try Again.",
            "userId" :  null,
            "valErrors" : 500
        }
        res.send({data});
    } else {
        var data = {
            "resMsg" : "User updated successfully.",
            "userId" :  req.params.id,
            "valErrors" : 200
        }
        res.send({data});
    }
    });
})

app.delete('/user/:id', function (req, res) {
 var hopperRef = db.ref("users/"+ req.params.id);
        hopperRef.update({
        "isActive": false,
    }, function(error) {
    if (error) {
        var data = {
            "resMsg" : "Oops!Something went wrong.Try Again.",
            "userId" :  null,
            "valErrors" : 500
        }
        res.send({data});
    } else {
        var data = {
            "resMsg" : "User deleted successfully.",
            "userId" :  req.params.id,
            "valErrors" : 200
        }
        res.send({data});
    }
    });
})
 
app.listen(3000)