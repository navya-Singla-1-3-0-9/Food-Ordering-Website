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
        await connection.execute(`CREATE TABLE sales(itemid NUMBER,qty NUMBER, when VARCHAR2(100))`);
    
    }catch(err){
    console.log(err);
  }
  }
  }
})()