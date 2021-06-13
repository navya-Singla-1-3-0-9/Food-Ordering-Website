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
        await connection.execute(`CREATE TABLE cart(userid VARCHAR2(100), itemid NUMBER, qty NUMBER, total NUMBER, FOREIGN KEY(itemid) references menuItem(id), FOREIGN KEY(userid) references users(username))`);
     
    }catch(err){
    console.log(err);
  }
  }
  }
})()