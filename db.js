const neo4j = require('neo4j');

var db = new neo4j.GraphDatabase('http://neo4j:kermit@192.168.0.30:7474');
 
jim = () => db.cypher({
    query: 'MATCH (p:Person) RETURN p',
    params: {},
}, function (err, results) {
    if (err) throw err;
    var result = results[0];
    if (!result) {
        console.log('No user found.');
    } else {
        var user = result['p'];
        console.log(JSON.stringify(results, null, 4));
    }
});

phil = (fnam) => db.cypher({
    query: `MATCH (p:Person {fname:'Jon'})-[r:AUTHORED]->(q) RETURN q LIMIT 25`,
    params: {},
}, function (err, results) {
    if (err) throw err;
    var result = results[0];
    if (!result) {
        console.log('No user found.');
    } else {
        var user = result['p'];
        console.log(JSON.stringify(results, null, 4));
    }
    return JSON.stringify(results)
});
