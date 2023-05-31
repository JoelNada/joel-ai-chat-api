const mysql = require("mysql");
require("dotenv").config();
const password = process.env.dbpassword;
const database = process.env.database;
const db_port = process.env.db_port;
const user = process.env.user;
const host = process.env.host;

const db = mysql.createConnection({
  host: host,
  port: db_port,
  user: user,
  password: password,
  database: database,
});

module.exports = db;
