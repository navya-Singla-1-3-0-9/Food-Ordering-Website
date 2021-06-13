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
        await connection.execute(`CREATE TABLE menuItem(id NUMBER, category VARCHAR2(100), dish VARCHAR2(500), price Number, description VARCHAR2(1000), img VARCHAR2(2000))`);
     
    }catch(err){
    console.log(err);
  }
  }
  }
})()