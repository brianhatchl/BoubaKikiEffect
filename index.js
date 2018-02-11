var NoSQL = require('nosql');
var db = NoSQL.load('db/bk.nosql');

//[date, age, order, flip, choose, correct]
//date = datetime of the test
//age = age of the participant
//order = 0 means bouba listed first, 1 means kiki listed first in shape question
//flip = 0 means kiki on the left, 1 means bouba on the left
//choose = which shape was the user asked to identify
//correct = did the user correctly identify bouba or kiki?

db.view('raw').make(function(builder) {
    // builder.where('sex', 'female');
    builder.sort('date');
});

db.view('sort').make(function(builder) {
    // builder.where('sex', 'female');
    builder.sort('age');
});

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
            // console.log(d);

            var bin = Math.trunc(d.age / 10);
            if (!obj[bin]) {
                obj[bin] = {
                    "true": 0,
                    "false": 0
                }
            }
            obj[bin][d.correct]++;

            return obj;
        }, {})
        res.json(json);
    });
});

// app.get('/results/by_time', function(req, res) {
//     db.find('all')
//     // .search('name', 'Anna')
//     .callback(function(err, data) {
//         res.json(data);
//     });
// });

// app.get('/results/by_order_flip', function(req, res) {
//     db.find('all')
//     // .search('name', 'Anna')
//     .callback(function(err, data) {
//         res.json(data);
//     });
// });

// app.get('/results/by_choice', function(req, res) {
//     db.find('all')
//     // .search('name', 'Anna')
//     .callback(function(err, data) {
//         res.json(data);
//     });
// });