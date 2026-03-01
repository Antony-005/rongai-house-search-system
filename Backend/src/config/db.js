const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Kenya@2022", 
  database: "rongai_house_search"
});

module.exports = db;