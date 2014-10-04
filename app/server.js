//
// Short URL service application sample
//

var LISTEN = '0.0.0.0';
var HOSTNAME = 'localhost';
var PORT = 80;

var DBHOST = process.env.DB_PORT_3306_TCP_ADDR;
var DBPORT = process.env.DB_PORT_3306_TCP_PORT;
var DBNAME = process.env.NODE_DBNAME;
var DBUSER = process.env.NODE_DBUSER;
var DBPASS = process.env.NODE_DBPASS;

var sys = require('sys'),
    express = require('express'),
    ejs = require('ejs'),
    mysql = require('mysql'),
    crypto = require('crypto')

// Helper function to query MySQL
function db_access(callback) {
    var client = mysql.createConnection({
        host: DBHOST,
        port: DBPORT,
        user: DBUSER,
        password: DBPASS,
        database: DBNAME
    });
    client.connect(function(err) {
        if (err) {
            throw err;
        }
        callback(client);
    });
}

var app = express();
app.use(express.json());
app.use(express.urlencoded());
app.engine('ejs', require('ejs').renderFile);

// Request to input URL to shorten
app.get('/', function(req, res) {
    res.render('index.ejs');
});

// Receive URL to shorten
app.post('/', function(req, res) {
    var locals = {
        error: null,
        short_url: null
    };

    if (!req.body.url) {
        locals.error = 'URLが入力されていません。';
    } else if (req.body.url > 256) {
        locals.error = 'URLが長すぎます。';
    }
    if (locals.error) {
        res.render('result.ejs', {
            locals: locals
        });
        return;
    }

    function render_short_url(hash) {
        locals.short_url = req.protocol + '://' + req.get('host')
            + '/' + hash;
        res.render('result.ejs', {
            locals: locals
        });
    }

    db_access(function(client) {
        var md5 = crypto.createHash('md5');
        md5.update(req.body.url, 'utf8');
        var hash = md5.digest('hex').substr(0,8);
        client.query(
            'INSERT INTO url_list (hash,url) VALUES (?,?)',
            [hash, req.body.url],
            function(err, results) {
                if (err && err.number != mysql.ERROR_DUP_ENTRY) {
                    client.end();
                    throw err;
                }
                render_short_url(hash);
                return;
            }
        );
    });
});

// Redirect to a new page 
app.get(/^\/([0-9a-z]+)$/, function(req, res) {
    db_access(function(client) {
        client.query(
            'SELECT url FROM url_list WHERE hash = ?',
            [req.params[0]],
            function(err, results, fields) {
                if (err) {
                    client.end();
                    throw err;
                }
                client.end();

                if (results.length == 0) {
                    res.send('Not Found', 404);
                } else {
                    res.redirect(results[0].url);
                }
            }
        );
    });
});

app.listen(PORT, LISTEN);
console.log('Server running at %s:%s', LISTEN, PORT);
