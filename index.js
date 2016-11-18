var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var massive = require('massive');
//Need to enter username and password for your database
var connString = "postgres://localhost/assessbox";

var app = express();
app.use(bodyParser.json());
app.use(cors());

//The test doesn't like the Sync version of connecting,
//  Here is a skeleton of the Async, in the callback is also
//  a good place to call your database seeds.
var db = massive.connect({connectionString : connString},
  function(err, localdb){
    db = localdb;
    app.set('db', db);
    //
    db.user_create_seed(function(){
      console.log("User Table Init");
    });
    db.vehicle_create_seed(function(){
      console.log("Vehicle Table Init")
    });
});


////////////////////////////////////////
/////////       ENDPOINTS      /////////
////////////////////////////////////////

// Get all users
app.get('/api/users', function(req, res) {
  db.get_users(function(err, users) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(users);
    }
  });
});

// Get all vehicles
app.get('/api/vehicles', function(req, res) {
  db.get_vehicles(function(err, vehicles) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(vehicles);
    }
  });
});

// Add new user to database
app.post('/api/users', function(req, res) {
  db.add_user([req.body.firstname, req.body.lastname, req.body.email], function(err, response) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(response)
    }
  });
});

// Add new vehicle to database
app.post('/api/vehicles', function(req, res) {
  db.add_vehicle([req.body.make, req.body.model, req.body.year, parseInt(req.body.ownerId)], function(err, response) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(response)
    }
  });
});

// Return # of vehicles for each owner as count object
app.get('/api/user/:userId/vehiclecount', function(req, res) {
  db.vehicle_count(parseInt(req.params.userId), function(err, response) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(response);
    }
  });
});

// Return all vehicles that belong to specified user
app.get('/api/user/:userId/vehicle', function(req, res) {
  db.user_vehicles(parseInt(req.params.userId), function(err, response) {
    console.log(req.params.userId);
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(response);
    }
  });
});

// Return all vehicles that belong to user specified by email OR whose first name starts with provided letters
app.get('/api/vehicle', function(req, res) {
  if (req.query.userFirstStart) {
    var query = req.query.userFirstStart + '%';
    db.get_vehicle_by_firstname([query], function(err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(response);
      }
    });
  } else {
    db.get_vehicle_by_email([req.query.UserEmail], function(err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.status(200).send(response);
      }
    });
  }
});

// Get all vehicles newer than 2000 sorted with newest first and including owner first/last name
app.get('/api/newervehiclesbyyear', function(req, res) {
  var year = 2000;
  db.vehicles_by_year([year], function(err, response) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(response);
    }
  });
});

// Change ownership of provided vehicle to new user
app.put('/api/vehicle/:vehicleId/user/:userId', function(req, res) {
  var userId = parseInt(req.params.userId);
  var vehicleId = parseInt(req.params.vehicleId);
  db.change_ownership([vehicleId, userId], function(err, response) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(response);
    }
  });
});

// Remove ownership of vehicle, but not delete vehicle
app.delete('/api/user/:userId/vehicle/:vehicleId', function(req, res) {
  // var userId = parseInt(req.params.userId);
  var vehicleId = parseInt(req.params.vehicleId);
  db.remove_ownership([vehicleId], function(err, response) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(response);
    }
  });
});

// Delete specified vehicle from database
app.delete('/api/vehicle/:vehicleId', function(req, res) {
  var id = parseInt(req.params.vehicleId);
  db.delete_vehicle([id], function(err, response) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(response);
    }
  });
});


////////////////////////////////////////
////////      Setup Server      ////////
////////////////////////////////////////
app.listen('3000', function(){
  console.log("Server is now live on port 3000!")
})

module.exports = app;
