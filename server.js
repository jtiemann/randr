var restify = require('restify');
var fs = require('fs');
require('./db_server.js')
//var r = require('request')

var server = restify.createServer();
server.use(restify.bodyParser({ mapParams: false })); // mapped in req.body

server.get(/\/?.*/, restify.serveStatic({
  directory: __dirname,
  default: '/index.html'
}));

server.get('\/node_modules\/gmaps\/?.*', restify.serveStatic({
  directory: './node_modules/gmaps',
  default: 'index.html'
}));

server.post('/postR', function create(req, res) {
    console.log('posted: ', req.body)

    var qa = `merge (p:Person {lname:'${req.body.lname}'})  merge (w:Where {where:'${req.body.where}'})
                create (p)-[l:AUTHORED]->(m:Message {text:'${req.body.text}', latlng:[${req.body.latlng}], timedate: timestamp() })-[:IS_A]->(:Rant) 
                create (m)-[:LOCATED]->(w) `

    var qb = `merge (p:Person {lname:'${req.body.lname}'})  merge (w:Where {where:'${req.body.where}'})
                create (p)-[l:AUTHORED]->(m:Message {text:'${req.body.text}', latlng:[${req.body.latlng}], timedate: timestamp()  })-[:IS_A]->(:Rave) 
                create (m)-[:LOCATED]->(w) `
    

    var query = req.body.type=='rant' ? qa : qb

    db.cypherQuery(query, 
        function(err, result){
            if(err) throw err;
            console.log(result.data); // delivers an array of query results
            res.send(result.data)
    });     
});

server.post('/getDataByCoords', function create(req, res) {
    console.log('lo: ', req.body)

    var qa = `match (p:Person)-[l:AUTHORED]->(m:Message)-[:IS_A]->(:Rave), (m)-[:LOCATED]->(w:Where) where m.latlng[0]<${req.body.nelat} and m.latlng[0]>${req.body.swlat} 
              and  m.latlng[1]<${req.body.nelng} and m.latlng[1]>${req.body.swlng}
              return p, m {.text, r:'Rave', .latlng, .timedate}, w UNION 
          match (p:Person)-[l:AUTHORED]->(m:Message)-[:IS_A]->(:Rant), (m)-[:LOCATED]->(w:Where) where m.latlng[0]< ${req.body.nelat} and m.latlng[0]>${req.body.swlat} 
              and  m.latlng[1]<${req.body.nelng} and m.latlng[1]>${req.body.swlng}
              return p, m {.text, r:'Rant', .latlng, .timedate}, w  `

    db.cypherQuery(qa, 
        function(err, result){
            if(err) throw err;

            //console.log(result.data); // delivers an array of query results
            //console.log(result.columns); // delivers an array of names of objects getting returned
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
