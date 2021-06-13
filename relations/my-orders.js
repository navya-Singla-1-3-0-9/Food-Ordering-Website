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
       await connection.execute(`CREATE TABLE orders(name VARCHAR2(100), itemnum NUMBER, quantity NUMBER, when VARCHAR2(20), FOREIGN KEY(name) references users(username), FOREIGN KEY(itemnum) references menuItem(id))`);
        //name VARCHAR2(100), itemid NUMBER, quantity NUMBER, date VARCHAR2(20),FOREIGN KEY(itemid) references menuItem(id), FOREIGN KEY(name) references users(username)
     
    }catch(err){
    console.log(err);
  }
  }
  }
})()