'use strict';
/*
 'use strict' is not required but helpful for turning syntactical errors into true errors in the program flow
 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode
*/

/*
 Modules make it possible to import JavaScript files into your application.  Modules are imported
 using 'require' statements that give you a reference to the module.

  It is a good idea to list the modules that your application depends on in the package.json in the project root
 */
var util = require('util');
var sql = require('./db.js');


/*
 Once you 'require' a module you can reference the things that it exports.  These are defined in module.exports.

 For a controller in a127 (which this is) you should export the functions referenced in your Swagger document by name.

 Either:
  - The HTTP Verb of the corresponding operation (get, put, post, delete, etc)
  - Or the operationId associated with the operation in your Swagger document

  In the starter/skeleton project the 'get' operation on the '/hello' path has an operationId named 'hello'.  Here,
  we specify that in the exports of this module that 'hello' maps to the function named 'hello'
 */
module.exports = {
    add_buy_record : add_buy_record,
    buy_record : buy_record
};


/*POST*/
function add_buy_record(req, res) {

    var buyInfo = JSON.stringify(req.swagger.params.buyInfo);
    buyInfo = JSON.parse(buyInfo).value;


   // console.log(buyInfo.id, buyInfo.name, buyInfo.price);

    var queryStmt = `INSERT INTO buyrecords (id,name,price) VALUES (${buyInfo.id},'${buyInfo.name}',${buyInfo.price})`;

    //console.log(queryStmt);

    sql.query(queryStmt, function (err, result) {
        if(err) throw err;

    });

    res.json("success");


}

/*GET*/

function buy_record(req, res) {

    var id = req.swagger.params.id.value;
    var queryStmt = `select * from buyrecords where id = ${id}`;

    sql.query(queryStmt, function (err, result) {
        res.json(JSON.stringify(result));

    });
}
