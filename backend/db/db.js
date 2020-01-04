const mysql = require('mysql');

const mySqlConnection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rootpassword",
  database: "webweek",
});

mySqlConnection.connect((err) => {
  if (err) throw err;
  console.log("Database Connected!");
});

module.exports = mySqlConnection;
