var mysql = require('mysql')
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'tensor',
    password: '12345',
    database: 'Supplier'
});

connection.connect();

module.exports = connection;