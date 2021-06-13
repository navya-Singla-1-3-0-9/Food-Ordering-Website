const express= require('express');
const app= express();
app.set("view engine","ejs");
const path = require('path');
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));
app.set('views',path.join(__dirname,'views'));
const session = require('express-session');
const passport= require('passport');
const localStrategy= require('passport-local').Strategy;
const crypto= require('crypto');
const flash= require('connect-flash')

const sessionConfig={
  secret: 'Thisisasecret',
  resave: false,
  saveUninitialized: true,
  cookie:{
    httpOnly: true,
    expires: Date.now()+1000*60*60*24*7,
    maxAge: 1000*60*60*24*7
  }
}
let order_no= 0;
let menu_item_id=0;
let profile={};
let user_orders=[];
let items=[];
let cart=[];
let rest_orders=[];
let sales=[];
let all_users=[];
let insertIntoTable;
let insertorder;
let insertsold;
let insertUser;
let findUser;
let updateItem;
let updateCart;
let ordernow;
let deldish;
let connection;
var oracledb = require('oracledb');
let name;
let role;

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
       
      //await connection.execute("ALTER TABLE menuItem ADD CONSTRAINT menuItem_pk PRIMARY KEY (id)")
      let addmyorder = async (name,itemnum,quantity,when)=>
    {
    const query='insert into orders(name,itemnum,quantity,when) values (:1,:2,:3,:4)';
    var binds=[name,itemnum,quantity,when];
    await connection.execute(query , binds, {autoCommit:true}); 
    }
    //addmyorder('abc',1,2,'10 Mar 2021');
   insertIntoTable = async (category,dish,price,description,img)=>
    {
    const query='insert into menuItem (id,category,dish,price,description,img) values (:1,:2,:3,:4,:5,:6)';
    var binds=[menu_item_id,category,dish,price,description,img];
    await connection.execute(query , binds, {autoCommit:true}); 
    }
   

    insertUser = async (username,password,address,email,contact, role,fname,lname)=>
    {
       var salt = process.env.salt;
    salt = salt+''+password;
     var encPassword = crypto.createHash('sha1').update(salt).digest('hex');
    const query='insert into users (username,password,address,email,contact,role,first_name,last_name) values (:1,:2,:3,:4,:5,:6,:7,:8)';
    var binds=[username,encPassword,address,email,contact,role,fname,lname];
    await connection.execute(query , binds, {autoCommit:true}); 
    }
    //insertUser('emp1','emp123','Saraswati Vihar','emp@email.com','9889976543','employee','employee','one');
    insertorder= async (name,itemnum,quantity,when, method, holder, c_num)=>
    {
      const prev = await connection.execute(`SELECT * from orders where name=:1 AND itemnum=:2 AND when=:3`,[name,itemnum,when]);
      if(prev.rows.length==0){

    const query='insert into orders (name,itemnum,quantity,when,payment_method) values (:1,:2,:3,:4,:5)';
    var binds=[name,itemnum,quantity,when,method];
    await connection.execute(query , binds, {autoCommit:true}); 
    if(holder){
      console.log(true);
    await connection.execute(`UPDATE orders set card_holder=:1 where itemnum=:2 AND when=:3 AND name=:4`,[holder,itemnum,when,name],{autoCommit:true});
    await connection.execute(`UPDATE orders set c_num=:1 where itemnum=:2 AND when=:3 AND name=:4`,[c_num, itemnum,when,name],{autoCommit:true});
  }
  }else{
    let qty=quantity+prev.rows[0][2]; 
    await connection.execute(`UPDATE orders set quantity=:1 where itemnum=:2 AND when=:3 AND name=:4`,[qty,itemnum,when,name],{autoCommit:true});
  }
    }
    ordernow = async (orderedby,itemordered,quantity,when)=>
    {
      const prev = await connection.execute(`SELECT * from restaurantorders where orderedby=:1 AND itemordered=:2 AND when=:3`,[orderedby,itemordered,when]);
      console.log(prev.rows);
      if(prev.rows.length==0){
        order_no++;
    const query='insert into restaurantorders (orderedby,itemordered,quantity,when,order_num) values (:1,:2,:3,:4,:5)';
    var binds=[orderedby,itemordered,quantity,when,order_no];
    await connection.execute(query , binds, {autoCommit:true}); 
  }else{
    let qty=quantity+prev.rows[0][2]; 
    await connection.execute(`UPDATE restaurantorders set quantity=:1 where itemordered=:2 AND when=:3 AND orderedby=:4`,[qty,itemordered,when,orderedby],{autoCommit:true});
  }
  

    }

    insertsold = async (itemid,qty,when)=>
    {
       const prev = await connection.execute(`SELECT * from sales where itemid=:1 AND when=:2`,[itemid,when]);
      console.log(prev.rows);
      if(prev.rows.length==0){
    const query='insert into sales (itemid,qty,when) values (:1,:2,:3)';
    var binds=[itemid,qty,when];
    await connection.execute(query , binds, {autoCommit:true}); 
  }else{
     let quant=qty+prev.rows[0][1]; 
      await connection.execute(`UPDATE sales set qty=:1 where itemid=:2 AND when=:3`,[quant,itemid,when],{autoCommit:true});
  }

    }
   
    //insertUser('abc',encPassword,'Hudson Lane','abc@123','9988776655');

  //insertIntoTable(18,'sides','Crispy Chedda Bites',190,'White and yellow Wisconsin cheese curds topped with chile spices, cilantro. Served with ancho-chile ranch.','https://static.olocdn.net/menu/chilis/ff88ecffae4f0908397d94f00bf77aba.jpg');
  //await connection.execute(`DELETE FROM cart where userid=:1`,['admin'],{autoCommit: true});
delDish= async (del_id)=>{await connection.execute(`DELETE FROM menuItem where id = :1`,[del_id],{autoCommit: true});}
//await connection.execute(`UPDATE users SET role = :1 WHERE username = :2`,['admin', 'admin'],{autoCommit: true});
 updateItem= async(item_id, category, dish, price, description,img)=>{
    await connection.execute(`UPDATE menuItem SET dish = :1 WHERE id = :2`,[dish,item_id],{autoCommit: true});
    await connection.execute(`UPDATE menuItem SET category = :1 WHERE id = :2`,[category,item_id],{autoCommit: true});
    await connection.execute(`UPDATE menuItem SET price = :1 WHERE id = :2`,[price,item_id],{autoCommit: true});
    await connection.execute(`UPDATE menuItem SET description = :1 WHERE id = :2`,[description,item_id],{autoCommit: true});
    await connection.execute(`UPDATE menuItem SET img = :1 WHERE id = :2`,[img,item_id],{autoCommit: true});
 }
 //await connection.execute(`DELETE FROM menuItem where id is null`);
  updateCart = async (itemid,qty, total,username)=>{
    await connection.execute(`UPDATE cart SET itemid = :1 WHERE userid = :2`,[itemid,username],{autoCommit: true});
    await connection.execute(`UPDATE cart SET qty = :1 WHERE userid = :2`,[qty,username],{autoCommit: true});
    await connection.execute(`UPDATE menuItem SET total = :1 WHERE id = :2`,[total,username],{autoCommit: true});
  }
  addtocart = async(userid,itemid, qty)=>{
    const query='insert into cart (userid,itemid,qty) values (:1,:2,:3)';
    var binds=[userid,itemid,qty];
    await connection.execute(query , binds, {autoCommit:true}); 
  }
   connection.execute(
      `SELECT *
       FROM menuItem`,
      [],  
     function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
      for(let i=0;i<result.rows.length;i++){
        let curr = result.rows[i];
        items.push({id:curr[0], category: curr[1], dish: curr[2], price: curr[3], description:curr[4], img: curr[5]});

          if(result.rows[i][0]>menu_item_id){
            menu_item_id= result.rows[i][0]+1;
          }
       }

        
     });

   connection.execute(
      `SELECT *
       FROM users`,
      [],  
     function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
      for(let i=0;i<result.rows.length;i++){
        all_users.push({username: result.rows[i][0], address: result.rows[i][2], email: result.rows[i][3], contact: result.rows[i][4]});
       }
       
     });

    connection.execute(
      `SELECT *
       FROM cart`,
      [],  
     function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
       
        
       
        
     });

  connection.execute(
      `SELECT *
       FROM restaurantorders`,
      [],  
     async function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        for(let i=0;i<result.rows.length;i++){
          const dish = await connection.execute(`SELECT * FROM menuItem where id =:1`,[result.rows[i][1]]);
          const user = await connection.execute(`SELECT * FROM users where username =:1`,[result.rows[i][0]]);
          rest_orders.push({dish: dish.rows[0][2], orderedby: user.rows[0][0], address:user.rows[0][2], quantity: result.rows[i][2], date:result.rows[i][3], price: dish.rows[0][3]});
          if(result.rows[i][4]>order_no){
            order_no= result.rows[i][4]+1;
          }
        }
       
        
     });

    connection.execute(
      `SELECT *
       FROM sales`,
      [],  
     async function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
     
        let b= false;
        for(let i=0;i<result.rows.length;i++){
          b= false;
          const dish = await connection.execute(`SELECT * FROM menuItem where id =:1`,[result.rows[i][0]]);
          for(let j= 0;j<sales.length;j++){
            if(sales[j].id==result.rows[i][0] && sales[j].date==result.rows[i][2]){
              b= true;
              sales[j]= {id: sales[j].id,dish:dish.rows[0][2],qty: sales[j].qty+result.rows[i][1], price:dish.rows[0][3], date:result.rows[i][2]};
              break;
            }
           
          }
           if(b==false){
              sales.push({id: result.rows[i][0], dish: dish.rows[0][2], qty:result.rows[i][1], price:dish.rows[0][3], date:result.rows[i][2]});
            }
        }
     
       
        
     });
     connection.execute(
      `SELECT *
       FROM orders`,
      [],  
     function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
       
  
       
        
     });
    

   
   /*var sql = "ALTER TABLE users ADD role varchar2(10)";
  connection.execute(sql, function (err, result) {
    if (err) throw err;
    console.log("Table altered");
  });*/

    /*var sql = "DROP TABLE orders";
  connection.execute(sql, function (err, result) {
    if (err) throw err;
    console.log("Table deleted");
  });*/
    }catch(err){
    console.log(err);
  }
  }
  }
})()
app.use(flash());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use('local',new localStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true //passback entire req to call back
} , function (req, username, password, done){
    console.log('here');
      if(!username || !password ) { return done(null, false, req.flash('message','All fields are required.')); }
      var salt = '7fa73b47df808d36c5fe328546ddef8b9011b2c6';
      connection.execute(`SELECT * FROM users where username=:1`, [username], function(err,rows){
          console.log(err);
        if (err) return done(req.flash('message',err));
        if(!rows.rows.length){ return done(null, false, req.flash('message','Invalid username or password.')); }
        salt = salt+''+password;
        var encPassword = crypto.createHash('sha1').update(salt).digest('hex');
        var dbPassword  = rows.rows[0][1];
        if(!(dbPassword == encPassword)){
            console.log(false);
            return done(null, false, req.flash('message','Invalid username or password.'));
         }
         console.log('done');
        return done(null, rows.rows[0]);
      });
    }
));

    //insertUser('abc','abc123','Hudson Lane','abc@123','9988776655');

passport.serializeUser(function(user, done){
  name=user[0];
  role = user[5];
    done(null, user[0]);
});
passport.deserializeUser(function(id, done){
  name="";
    connection.execute(`select * from users where username = :1`,[id], function (err, rows){
        done(err, rows.rows[0]);
    });
});


app.use((req,res,next)=>{
  if(req.session.passport){
   name= req.session.passport.user;
  console.log(req.session.passport.user);
}
  res.locals.currUser= req.user;
  res.locals.success=  req.flash('success');
  res.locals.error= req.flash('error');
  next();
})

const isLoggedIn= async (req,res,next)=>{
  if(!req.isAuthenticated()){
    req.flash('error','You must be logged in');
    return res.redirect('/login');
  }
  
  next();
}

const isAdmin= async (req,res,next)=>{
  if(role!='admin'){
    req.flash('error',"You don't have permission to access this page");
    return res.redirect('/order-online');
  }
  
  next();
}
const isEmp= async (req,res,next)=>{
  if(role!='employee'){
    req.flash('error',"You don't have permission to access this page");
    return res.redirect('/order-online');
  }
  
  next();
}
app.get('/add-item',(req,res)=>{

  res.render('additem');

});

app.post("/login",passport.authenticate('local',{failureFlash:'Invalid username or password', failureRedirect:'/login'}),async (req,res)=>{
  const curruserorders = await connection.execute(`SELECT * FROM orders where name=:1`,[name]);
  //reload user orders
  
   for(let i=0;i<curruserorders.rows.length;i++){
    for(let item of items){
      if(item.id==curruserorders.rows[i][1]){
      user_orders.push({item_name: item.dish, price: item.price,qty:curruserorders.rows[i][2], date:curruserorders.rows[i][3], pay_method: curruserorders.rows[i][4], holder: curruserorders.rows[i][5], num: curruserorders.rows[i][6]});
    }
    }
    
   }

   //reload user cart
    const currcart = await connection.execute(`SELECT * FROM cart where userid=:1`,[name]);
    for(let i=0;i<currcart.rows.length;i++){
      if(currcart.rows[i][1]){
      const d = await connection.execute(`SELECT * FROM menuItem where id=:1`,[currcart.rows[i][1]]);
      cart.push({item_id:currcart.rows[i][1], dish:d.rows[0][2], price:d.rows[0][3], quant: currcart.rows[i][2]});
    }
    }
    //reload profile
    const thisuser = await connection.execute(`SELECT * FROM users where username=:1`,[name]);
    profile={name:thisuser.rows[0][0], address: thisuser.rows[0][2], email: thisuser.rows[0][3], contact: thisuser.rows[0][4], first_name: thisuser.rows[0][6], last_name:thisuser.rows[0][7]};
  req.flash('success', 'Successfully logged in');
  res.redirect('/order-online');
})
app.get('/:delid/delete',isLoggedIn,async (req,res)=>{
  for(let i=0;i<items.length;i++){
    if(items[i].id==req.params.delid){
      items.splice(i,1);
    }
  }
  delDish(req.params.delid);

  res.redirect('/order-online');
})
app.get('/pay',(req,res)=>{
  res.render("pay");
})
 app.post('/order-online',isLoggedIn,(req,res)=>{
  try{
    insertIntoTable(req.body.category, req.body.dish,req.body.price, req.body.description, req.body.img);
items.push({id:req.body.id, category: req.body.category, dish: req.body.dish, price: req.body.price, description: req.body.description, img: req.body.img});
        
  }catch(e){
    console.log(e);
  }
    res.redirect('/order-online');

})
app.get('/',(req,res)=>{
  res.render("home",{name, role});
})
app.get('/login',(req,res)=>{
  res.render("login",{name , role});
});

app.get('/my-profile',isLoggedIn, (req,res)=>{
  res.render('profile',{ profile});
})

app.get('/order-online',isLoggedIn,(req,res)=>{
  res.render("orderOnline",{items, name, cart, role});

});


app.get('/register/:r',(req,res)=>{
  res.render('register',{r: req.params.r});
})
app.get('/:id/edit',isLoggedIn, async (req,res)=>{
  const d = await connection.execute(`SELECT * FROM menuItem WHERE id=:1`,[req.params.id]);
  let dishdata=[];
    dishdata.push({id: d.rows[0][0], category:d.rows[0][1], dish: d.rows[0][2], price:d.rows[0][3], description:d.rows[0][4], img: d.rows[0][5]});
  res.render('edit',{dishdata})
})
app.post('/:id/edit',isLoggedIn, async (req,res)=>{
  await updateItem(req.params.id, req.body.category, req.body.dish, req.body.price, req.body.description, req.body.img);
  const d = await connection.execute(`SELECT * FROM menuItem WHERE id=:1`,[req.params.id]);
  for(let i=0;i<items.length;i++){
    if(items[i].id==req.params.id){
      items[i]={id: d.rows[0][0], category:d.rows[0][1], dish: d.rows[0][2], price:d.rows[0][3], description:d.rows[0][4], img: d.rows[0][5]} ;
      break;
    }
  }

  res.redirect('/order-online');
})

app.post('/register/:r',async (req,res)=>{
  let r=req.params.r;
  await insertUser(req.body.username, req.body.password, req.body.address, req.body.email, req.body.contact,r,req.body.fname, req.body.lname);
  console.log("registered")
  all_users.push({username: req.body.username, address: req.body.address, email: req.body.email , contact: req.body.contact});
  res.redirect('/login');
})
app.get('/myOrders',isLoggedIn,(req,res)=>{
  let dates= []
let flags=[];
for (let i = 0; i < user_orders.length; i++){
   if (!flags[user_orders[i].date]){
      dates.push(user_orders[i].date);
      flags[user_orders[i].date] = true;
    }
  }
  console.log(dates);
  res.render('myorders',{user_orders,dates})
})
app.get('/:id/addtocart',async (req,res)=>{
  const d = await connection.execute(`SELECT * FROM menuItem WHERE id=:1`,[req.params.id]);
  let tag;
  let qty= 0;
   for(let i=0;i<cart.length;i++){
    if(cart[i].item_id==req.params.id){
      qty= cart[i].quant;
      cart[i]= {item_id:req.params.id, dish:d.rows[0][2], price: d.rows[0][3], quant:qty+1};
       await connection.execute(`UPDATE cart set qty=:1 where itemid=:2 AND userid=:3`,[qty+1,req.params.id,name],{autoCommit:true});
      break;
    }
  }
  if(qty==0){
  cart.push({item_id:req.params.id, dish:d.rows[0][2], price: d.rows[0][3], quant:qty+1});
  await addtocart(name,req.params.id,1);
}
 
  res.redirect('/order-online');
})

app.get('/:id/remove',async (req,res)=>{
  let qty = 0;
  for(let i=0;i<cart.length;i++){
    if(cart[i].item_id==req.params.id){
      qty= cart[i].quant-1;
      if(qty==0){
        await connection.execute(`DELETE FROM cart where itemid=:1 AND userid=:2`,[req.params.id,name],{autoCommit:true});
        cart.splice(i,1);
        break;
      }else{
        cart[i]= {item_id:req.params.id, dish:cart[i].dish, price: cart[i].price, quant:qty};
        await connection.execute(`UPDATE cart set qty=:1 where itemid=:2 AND userid=:3`,[qty,req.params.id,name],{autoCommit:true});
      }
      break;
    }
  }
  

  res.redirect('/order-online');
  
})

app.get('/:id/removeitem',async (req,res)=>{
  for(let i=0;i<cart.length;i++){
    if(cart[i].item_id==req.params.id){
    
        cart.splice(i,1);
         await connection.execute(`DELETE FROM cart where itemid=:1 AND userid=:2`,[req.params.id,name],{autoCommit:true});
      break;
    }
  }
  res.redirect('/order-online');
  
});
app.get('/successful',async (req,res)=>{
   const itemsOrdered = await connection.execute(`SELECT * FROM cart where userid=:1`,[name]);
   var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

   for(let i=0;i<itemsOrdered.rows.length;i++){
    const dish = await connection.execute(`SELECT * FROM menuItem where id=:1`,[itemsOrdered.rows[i][1]]);
          const user = await connection.execute(`SELECT * FROM users where username =:1`,[name]);
        const method= 'Cash on delivery'
      await insertorder(itemsOrdered.rows[i][0], itemsOrdered.rows[i][1], itemsOrdered.rows[i][2], today,method);
      await insertsold(itemsOrdered.rows[i][1],itemsOrdered.rows[i][2],today);
      //sales.push({id: itemsOrdered.rows[i][1], dish: dish.rows[0][2], qty:itemsOrdered.rows[i][2], price:dish.rows[0][3],date:today});
      let b= false;
      for(let j= 0;j<sales.length;j++){
            if(sales[j].id==itemsOrdered.rows[i][1] && sales[j].date==today){
              b= true;
              sales[j]= {id: sales[j].id,dish:dish.rows[0][2],qty: sales[j].qty+itemsOrdered.rows[i][2], price:dish.rows[0][3], date:today};
              break;
            }
           
          }
           if(b==false){
              sales.push({id: itemsOrdered.rows[i][1], dish: dish.rows[0][2], qty:itemsOrdered.rows[i][2], price:dish.rows[0][3], date:today});
            }
     await ordernow(itemsOrdered.rows[i][0], itemsOrdered.rows[i][1], itemsOrdered.rows[i][2], today);
   }
    const curruserorders = await connection.execute(`SELECT * FROM orders where name=:1`,[name]);
   
  user_orders=[];
   for(let i=0;i<curruserorders.rows.length;i++){
    for(let item of items){
      if(item.id==curruserorders.rows[i][1]){
      user_orders.push({item_name: item.dish, price: item.price,qty:curruserorders.rows[i][2], date:curruserorders.rows[i][3], pay_method:curruserorders.rows[i][4], holder: curruserorders.rows[i][5], num: curruserorders.rows[i][6]});
    }
    }
   }
   const currorders = await connection.execute(`SELECT * FROM restaurantorders`);
   const user = await connection.execute(`SELECT * FROM users where username =:1`,[name]);
   rest_orders=[];
   for(let i=0;i<currorders.rows.length;i++){
    for(let item of items){
      if(item.id==currorders.rows[i][1]){
         rest_orders.push({dish: item.dish, orderedby: currorders.rows[i][0], address:user.rows[0][2], quantity: currorders.rows[i][2], date:today, price: item.price});
      
    }
    }
   }
    await connection.execute(`DELETE FROM cart where userid=:1`,[name],{autoCommit:true});
    cart=[];
   res.render("success");
   
   
})
app.post('/successful',async (req,res)=>{
   const itemsOrdered = await connection.execute(`SELECT * FROM cart where userid=:1`,[name]);
   var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = mm + '/' + dd + '/' + yyyy;

   for(let i=0;i<itemsOrdered.rows.length;i++){
    const dish = await connection.execute(`SELECT * FROM menuItem where id=:1`,[itemsOrdered.rows[i][1]]);
          const user = await connection.execute(`SELECT * FROM users where username =:1`,[name]);
        const method= 'Credit card'
        const holder= req.body.holder;
        let s= req.body.card_num;
        const c_num= s.substring(s.length-4);
        console.log(holder+" "+c_num);
      await insertorder(itemsOrdered.rows[i][0], itemsOrdered.rows[i][1], itemsOrdered.rows[i][2], today,method,holder,c_num);
      await insertsold(itemsOrdered.rows[i][1],itemsOrdered.rows[i][2],today);
      //sales.push({id: itemsOrdered.rows[i][1], dish: dish.rows[0][2], qty:itemsOrdered.rows[i][2], price:dish.rows[0][3],date:today});
      let b= false;
      for(let j= 0;j<sales.length;j++){
            if(sales[j].id==itemsOrdered.rows[i][1] && sales[j].date==today){
              b= true;
              sales[j]= {id: sales[j].id,dish:dish.rows[0][2],qty: sales[j].qty+itemsOrdered.rows[i][2], price:dish.rows[0][3], date:today};
              break;
            }
           
          }
           if(b==false){
              sales.push({id: itemsOrdered.rows[i][1], dish: dish.rows[0][2], qty:itemsOrdered.rows[i][2], price:dish.rows[0][3], date:today});
            }
     await ordernow(itemsOrdered.rows[i][0], itemsOrdered.rows[i][1], itemsOrdered.rows[i][2], today);
   }
    const curruserorders = await connection.execute(`SELECT * FROM orders where name=:1`,[name]);
   
  user_orders=[];
   for(let i=0;i<curruserorders.rows.length;i++){
    for(let item of items){
      if(item.id==curruserorders.rows[i][1]){
      user_orders.push({item_name: item.dish, price: item.price,qty:curruserorders.rows[i][2], date:curruserorders.rows[i][3], pay_method:curruserorders.rows[i][4], holder: curruserorders.rows[i][5], num: curruserorders.rows[i][6]});
    }
    }
   }
    const currorders = await connection.execute(`SELECT * FROM restaurantorders`);
   const user = await connection.execute(`SELECT * FROM users where username =:1`,[name]);
   rest_orders=[];
   for(let i=0;i<currorders.rows.length;i++){
    for(let item of items){
      if(item.id==currorders.rows[i][1]){
         rest_orders.push({dish: item.dish, orderedby: currorders.rows[i][0], address:user.rows[0][2], quantity: currorders.rows[i][2], date:today, price: item.price});
      
    }
    }
   }
    await connection.execute(`DELETE FROM cart where userid=:1`,[name],{autoCommit:true});
    cart=[];
   res.render("success");
   
   
})
app.get('/orders',isLoggedIn,isEmp,(req,res)=>{
let distinct = []
let flags=[];
for (let i = 0; i < rest_orders.length; i++){
   if (!flags[rest_orders[i].orderedby]){
      distinct.push({name: rest_orders[i].orderedby, address: rest_orders[i].address, date:rest_orders[i].date})
      flags[rest_orders[i].orderedby] = true;
    }
  }

  res.render("restaurantorders",{rest_orders, distinct});
})
app.get('/:userid/delivered',)
app.get('/logout',(req,res)=>{
  user_orders=[];
  cart=[];
  req.logout();
  res.redirect('/');
})
app.get('/sales', isLoggedIn, isAdmin, (req,res)=>{
  let dates= []
let flags=[];
for (let i = 0; i < sales.length; i++){
   if (!flags[sales[i].date]){
      dates.push(sales[i].date);
      flags[sales[i].date] = true;
    }
  }
  res.render("sales",{sales, dates});
});
app.get('/:un/delivered', async (req,res)=>{
    await connection.execute(`DELETE FROM restaurantorders where orderedby=:1`,[req.params.un],{autoCommit:true});
    
    for(let i=rest_orders.length-1;i>=0;i--){
      if(rest_orders[i].orderedby==req.params.un){
        rest_orders.splice(i,1);
      }
    }
    res.redirect('/orders');
})
app.post('/update',isLoggedIn,async (req,res)=>{
  console.log(req.body);
  //username,password,address,email,contact, role,fname,lname
  await connection.execute(`UPDATE users SET address=:1 WHERE username=:2`,[req.body.address,req.body.username],{autoCommit:true});
   await connection.execute(`UPDATE users SET email=:1 WHERE username=:2`,[req.body.email,req.body.username],{autoCommit:true});
   await connection.execute(`UPDATE users SET first_name=:1 WHERE username=:2`,[req.body.fname,req.body.username],{autoCommit:true});
   await connection.execute(`UPDATE users SET last_name=:1 WHERE username=:2`,[req.body.lname,req.body.username],{autoCommit:true});
   await connection.execute(`UPDATE users SET contact=:1 WHERE username=:2`,[req.body.contact,req.body.username],{autoCommit:true});
    profile={name:req.body.username, address:req.body.address, email:req.body.email, contact:req.body.contact, first_name: req.body.fname, last_name:req.body.lname};
  res.redirect('/my-profile')
})
app.get('/users',isLoggedIn,isAdmin, (req,res)=>{
  res.render("users",{all_users});
})
app.listen(3000,(req,res)=>{
  console.log("SERVER UP");
});
