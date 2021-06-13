let connection;
var oracledb = require('oracledb');

(async function() {
try{
   connection = await oracledb.getConnection({
        user : 'SYSTEM',
        password : '',
        connectString : 'localhost/XE'
   });
   console.log("Successfully connected to Oracle!");
} catch(err) {
    console.log("Error: ", err);
  } finally {
    if (connection) {
      try{
        await connection.execute(`CREATE TABLE users(username VARCHAR2(100) PRIMARY KEY, password VARCHAR2(200), address VARCHAR2(200), email VARCHAR2(100), contact VARCHAR2(10))`);
     
    }catch(err){
    console.log(err);
  }
  }
  }
})()