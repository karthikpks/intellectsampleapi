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

function jsonData(resMsg, userId, valErrors, callback) {
     var data = {
        "resMsg" : resMsg,
        "userId" :  userId,
        "valErrors" : valErrors
    };
    callback(data);
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/user/:id', function (req, res) {
  const userId = req.params.id;
  if (req.params.id ==null && req.params.id =="") {
    jsonData("Please give user id for further process..", null, 500, function(result) {
            console.log(result);
            res.send(result);
    });
    } else {
        db.ref('users/'+userId).on("value", function(snapshot) {
            console.log(snapshot.val());
            res.send(snapshot);
        });   
    }
})

app.post('/user', function (req, res) {

db.ref("users").orderByChild("email").equalTo(req.body.email).once("value",snapshot => {
    const userData = snapshot.val();
    if (userData){
        jsonData("User Already exits!", null, 500, function(result) {
            console.log(result);
            res.send(result);
        });
    } else {
        db.ref('users/').push(req.body, error => {
            if (error) {
            jsonData("Something went wrong.TryAgin!.", null, 500, function(result) {
                    console.log(result);
                    res.send(result);
                });
            } else {
            db.ref("users").orderByChild("email").equalTo(req.body.email).once("value", function(snapshot) {
                    jsonData("User created successfully.",Object.keys(snapshot.val())[0], 500, function(result) {
                    res.send(result);
                });
            });
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
        jsonData("Oops!Something went wrong.Try Again.", null, 500, function(result) {
                    console.log(result);
                    res.send(result);
                });
    } else {
        jsonData("User updated successfully.", req.params.id, 200, function(result) {
            console.log(result);
            res.send(result);
        });
    }
    });
})

app.delete('/user/:id', function (req, res) {
    if (req.params.id ==null && req.params.id =="") {
            jsonData("Please user id for further process!.",  req.params.id, 500, 
            function(result) {
                    console.log(result);
                    res.send(result);
            });  
        } else {
        var hopperRef = db.ref("users/"+ req.params.id);
            hopperRef.update({
            "isActive": false,
        }, function(error) {
        if (error) {
            jsonData("Oops something went wrong.TryAgain!.",  req.params.id, 500, 
            function(result) {
                    console.log(result);
                    res.send(result);
                });    
            
        } else {
            jsonData("User deleted successfully.",  req.params.id, 200, 
            function(result) {
                    console.log(result);
                    res.send(result);
                });        }
        });
    }
})
 
app.listen(3000)