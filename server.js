var restify = require('restify');
var fs = require('fs');
require('./db_server.js')
//var r = require('request')

var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false })); // mapped in req.body

// server.get('/index.htmlp', function indexHTML(req, res, next) {
//     fs.readFile(__dirname + '/index.html', function (err, data) {
//         if (err) {
//             next(err);
//             return;
//         }
// console.log(data)
//         res.setHeader('Content-Type', 'text/html');
//         //res.writeHead(200);
//         res.send(data);
//         //next();
//     });
// });

server.get(/\/?.*/, restify.serveStatic({
  directory: __dirname,
  default: '/index.html'
}));

server.get('\/node_modules\/gmaps\/?.*', restify.serveStatic({
  directory: './node_modules/gmaps',
  default: 'index.html'
}));

server.post('/postR', function create(req, res) {
    console.log('lo: ', req.body)

    var qa = `merge (p:Person)-[l:AUTHORED]->(m:Message)-[:IS_A]->(:Rave) where m.latlng[0]<${req.body.nelat} and m.latlng[0]>${req.body.swlat} 
              and  m.latlng[1]<${req.body.nelng} and m.latlng[1]>${req.body.swlng} 
              return p, m {.text, r:'Rave', .latlng, .timedate} UNION 
          match (p:Person)-[l:AUTHORED]->(m:Message)-[:IS_A]->(:Rant) where m.latlng[0]< ${req.body.nelat} and m.latlng[0]>${req.body.swlat} 
              and  m.latlng[1]<${req.body.nelng} and m.latlng[1]>${req.body.swlng}
              return p, m {.text, r:'Rant', .latlng, .timedate}  `

    db.cypherQuery(qa, 
        function(err, result){
            if(err) throw err;

            console.log(result.data); // delivers an array of query results
            console.log(result.columns); // delivers an array of names of objects getting returned
            res.send(result.data)
    });     
});

server.post('/getDataByCoords', function create(req, res) {
    console.log('lo: ', req.body)
var q = "match (m:Message)-[:IS_A]->(:Rave) where m.latlng[0]<" 
        + req.body.nelat + " and m.latlng[0]>" + req.body.swlat 
        + " and  m.latlng[1]<" + req.body.nelng + " and m.latlng[1]>" + req.body.swlng 
        + " return m {.text, r:'Rave', .latlng} UNION match (m:Message)-[:IS_A]->(:Rant) where m.latlng[0]<" 
        + req.body.nelat + " and m.latlng[0]>" + req.body.swlat 
        + " and  m.latlng[1]<" + req.body.nelng + " and m.latlng[1]>" + req.body.swlng 
        + " return m {.text, r:'Rant', .latlng}  "

var qa = `match (p:Person)-[l:AUTHORED]->(m:Message)-[:IS_A]->(:Rave) where m.latlng[0]<${req.body.nelat} and m.latlng[0]>${req.body.swlat} 
              and  m.latlng[1]<${req.body.nelng} and m.latlng[1]>${req.body.swlng} 
              return p, m {.text, r:'Rave', .latlng, .timedate} UNION 
          match (p:Person)-[l:AUTHORED]->(m:Message)-[:IS_A]->(:Rant) where m.latlng[0]< ${req.body.nelat} and m.latlng[0]>${req.body.swlat} 
              and  m.latlng[1]<${req.body.nelng} and m.latlng[1]>${req.body.swlng}
              return p, m {.text, r:'Rant', .latlng, .timedate}  `

    db.cypherQuery(qa, 
        function(err, result){
            if(err) throw err;

            console.log(result.data); // delivers an array of query results
            console.log(result.columns); // delivers an array of names of objects getting returned
            res.send(result.data)
    });     
});

server.get('/dist/:file', function indexHTML(req, res, next) {
    fs.readFile(__dirname + req.params.file, function (err, data) {
        if (err) {
            next(err);
            return;
        }

        //res.writeHead(200);
        res.send(data);
        next();
    });
});


server.listen(8035, function () {
    console.log('server listening at %s', server.url);
});
