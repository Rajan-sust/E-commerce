var mysql = require('mysql')
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'tensor',
    password: '12345',
    database: 'OnlineMarket'
})

connection.connect();

module.exports = connection;