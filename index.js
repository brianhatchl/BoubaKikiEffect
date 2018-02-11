var NoSQL = require('nosql');
var db = NoSQL.load('bk.nosql');

//[date, age, order, flip, choose, correct]
//date = datetime of the test
//age = age of the participant
//order = 0 means bouba listed first, 1 means kiki in shape question
//flip = 0 means kiki on the left, 1 means bouba
//choose = which shape was the user asked to identify
//correct = did the user correctly identify bouba or kiki?

db.view('all').make(function(builder) {
    // builder.where('sex', 'female');
    builder.sort('date');
});

var express = require('express'),
    app = express();

app.listen('8080');
console.log('server running');

app.use(express.static('.'));

app.post('/', function (req, res) {
    db.insert(req.body);
});

app.get('/results', function(req, res) {
    db.find('all')
        // .search('name', 'Anna')
        .callback(function(err, response) {
            res.json(response);
    });
});