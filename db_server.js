const neo4j = require('node-neo4j');

db = new neo4j('http://neo4j:kermit@192.168.0.30:7474');

phil = (fnam) => db.cypherQuery("MATCH (p:Person {fname:'Jon'})-[r:AUTHORED]->(q) RETURN q LIMIT 25", function(err, result){
    if(err) throw err;

    console.log(result.data); // delivers an array of query results
    console.log(result.columns); // delivers an array of names of objects getting returned
    return result.data
});

// jim = () => db.cypher({
//     query: 'MATCH (p:Person) RETURN p',
//     params: {},
// }, function (err, results) {
//     if (err) throw err;
//     var result = results[0];
//     if (!result) {
//         console.log('No user found.');
//     } else {
//         var user = result['p'];
//         console.log(JSON.stringify(results, null, 4));
//     }
// });

// phil = (fnam) => db.cypher({
//     query: `MATCH (p:Person {fname:'Jon'})-[r:AUTHORED]->(q) RETURN q LIMIT 25`,
//     params: {},
// }, function (err, results) {
//     if (err) throw err;
//     var result = results[0];
//     if (!result) {
//         console.log('No user found.');
//     } else {
//         var user = result['p'];
//         console.log(JSON.stringify(results, null, 4));
//     }
//     return JSON.stringify(results)
// });
