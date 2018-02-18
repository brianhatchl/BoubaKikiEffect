var NoSQL = require('nosql');
var db = NoSQL.load('db/bk.nosql');

//[date, age, order, flip, choose, correct]
//date = datetime of the test
//age = age of the participant
//order = 0 means bouba listed first, 1 means kiki listed first in shape question
//flip = 0 means kiki on the left, 1 means bouba on the left
//choose = which shape was the user asked to identify
//correct = did the user correctly identify bouba or kiki?

var express = require('express'),
    app = express();
var bodyParser = require('body-parser');

app.listen('8080');
console.log('server running');

app.use(express.static('.'));
app.use(bodyParser.json());
app.post('/', function (req, res) {
    db.insert(req.body)
    .callback(function(err, data) {
        db.count()
        .callback(function(err, data) {
            res.json(data);
        });
    });
});

app.get('/results/raw', function(req, res) {
    db.find()
    .callback(function(err, data) {
        res.json(data);
    });
});

app.get('/results/sort', function(req, res) {
    db.find().sort('age')
    .callback(function(err, data) {
        res.json(data);
    });
});

app.get('/results/count', function(req, res) {
    db.count()
    .callback(function(err, data) {
        res.json(data);
    });
});

app.get('/results/overall', function(req, res) {
    db.scalar('group', 'correct')
    .callback(function(err, data) {
        res.json(data);
    });
});

app.get('/results/by_age', function(req, res) {
    db.find()
    .callback(function(err, data) {
        var json = data.reduce(function(obj, d) {
            var bin = Math.trunc(d.age / 10);
            if (!obj[bin]) {
                obj[bin] = {
                    "true": 0,
                    "false": 0
                }
            }
            obj[bin][d.correct]++;

            return obj;
        }, {});
        res.json(json);
    });
});

function splitHalf(prop, callback) {
    db.find().sort(prop)
    .callback(function(err, data) {
        var json = data.reduce(function(obj, d, i) {
            if ((i*2) < data.length) {
                obj.first[d.correct]++;
            } else {
                obj.second[d.correct]++;
            }

            return obj;
        }, {
            first: {true: 0, false: 0},
            second: {true: 0, false: 0}
        });
        json.median = data[Math.trunc(data.length/2)][prop];
        callback(json);
    });
}

app.get('/results/by_halftime', function(req, res) {
    splitHalf('date', function(json) {
        res.json(json);
    });
});

app.get('/results/by_halfage', function(req, res) {
    splitHalf('age', function(json) {
        res.json(json);
    });
});

app.get('/results/by_order', function(req, res) {
    db.find()
    .callback(function(err, data) {
        var json = data.reduce(function(obj, d) {
            var key = [
                (d.order) ? 'kiki' : 'bouba',
                (d.flip) ? 'bouba' : 'kiki',
                d.choose,
            ].join('-');
            if (!obj[key]) {
                obj[key] = {
                    "true": 0,
                    "false": 0
                }
            }
            obj[key][d.correct]++;

            return obj;
        }, {});
        res.json(json);
    });
});

app.get('/results/by_choice', function(req, res) {
    db.find()
    .callback(function(err, data) {
        var json = data.reduce(function(obj, d) {
            if (!obj[d.choose]) {
                obj[d.choose] = {
                    "true": 0,
                    "false": 0
                }
            }
            obj[d.choose][d.correct]++;

            return obj;
        }, {});
        res.json(json);
    });
});