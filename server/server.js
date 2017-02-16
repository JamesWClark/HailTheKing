var fs = require('fs'); // file systems
var jwt = require('jsonwebtoken'); // json web tokens
var express = require('express'); // web server
var request = require('request'); // http trafficer
var jwkToPem = require('jwk-to-pem'); // converts json web key to pem
var bodyParser = require('body-parser'); // http body parser
var Mongo = require('mongodb').MongoClient; // MongoDB driver
var socketio = require('socket.io');

const MONGO_URL = 'mongodb://localhost:27017/king';
const users = JSON.parse(fs.readFileSync('secret.json', 'utf8'));

/**
 * MongoDB operations
 * connects to MongoDB and registers a series of asynchronous methods
 */
Mongo.connect(MONGO_URL, function(err, db) {
    
    // TODO: handle err

    Mongo.ops = {};
            
    Mongo.ops.find = function(collection, json, callback) {
        db.collection(collection).find(json).toArray(function(err, docs) {
            if(callback) callback(err, docs);
        });
    };
    
    Mongo.ops.findOne = function(collection, json, callback) {
        db.collection(collection).findOne(json, function(err, doc) {
            if(callback) callback(err, doc);
        });
    };

    Mongo.ops.insert = function(collection, json, callback) {
        db.collection(collection).insert(json, function(err, result) {
            if(callback) callback(err, result);
        });
    };

    Mongo.ops.upsert = function(collection, query, json, callback) {
        db.collection(collection).updateOne(query, { $set: json }, { upsert: true }, function(err, result) {
            if (callback) callback(err, result);
        });
    };
    
    Mongo.ops.updateOne = function(collection, query, json, callback) {
        db.collection(collection).updateOne(query, { $set : json }, function(err, result) {
            if(callback) callback(err, result);
        });
    };
    
    Mongo.ops.deleteOne = function(collection, query, callback) {
        db.collection(collection).deleteOne(query, function(error, result) {
            if(callback) callback(error, result);
        });
    };
    
    Mongo.ops.deleteMany = function(collection, query, callback) {
        db.collection(collection).deleteMany(query, function(error, result) {
            if(callback) callback(error, result);
        });
    };
});

// web server
var app = express();

// listen on port 3000
var server = app.listen(3000, function() {
    log('listening on port 3000');
});

var io = socketio.listen(server, { origins : '*:*' });

io.sockets.on('connection', function(socket) {
    log('connection');
});

// use middlewares
app.use(bodyParser.json());
//app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(allowCrossDomain);
app.use(authorize);

app.post('/dht', function(req,res) {
    
});

app.post('/ask/the/king', function(req, res) {
    
});

app.post('/echo', function(req, res) {
    log(req.body);
    io.sockets.emit('echo', req.body);
    res.status(201).send(req.body);
});



/**
 * Middleware:
 * allows cross domain requests
 * ends preflight checks
 */
function allowCrossDomain(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE');

    // end pre flights
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
    } else {
        next();
    }
}

/**
 * Middlware:
 * validate tokens and authorize users
 */
function authorize(req, res, next) {
    var key = req.query.key;
    if(users.keys.hasOwnProperty(key)) {
        log(users.keys[key]);
        next();
    } else {
        res.writeHead(403);
        res.end();
    }
}

/**
 * Custom logger to prevent circular reference in JSON.parse(obj)
 */
function log(msg, obj) {
    console.log('\n');
    if (obj) {
        try {
            console.log(msg + JSON.stringify(obj));
        } catch (err) {
            var simpleObject = {};
            for (var prop in obj) {
                if (!obj.hasOwnProperty(prop)) {
                    continue;
                }
                if (typeof(obj[prop]) == 'object') {
                    continue;
                }
                if (typeof(obj[prop]) == 'function') {
                    continue;
                }
                simpleObject[prop] = obj[prop];
            }
            console.log('circular-' + msg + JSON.stringify(simpleObject)); // returns cleaned up JSON
        }
    } else {
        console.log(msg);
    }
}
