//jai shri ram
//import all modules
var express = require('express');
var app = express();
var session = require('express-session');//module to maintain sessions
var http = require('http').Server(app);
var io = require('socket.io')(http);//socket-io module
var path = require('path');//module to get all the files available
var mongoose = require('mongoose');//mongoDB object modelling tool 
var Chat = require('./app/model/Chat.js');
var ChatModel = mongoose.model('Chat')
var username = [];
var responseGenerator = require('./libs/responseGenerator');

app.set('view engine', 'jade');// set the templating engine 
app.use(express.static(__dirname + '/public'));//set the public folder
app.set('views', path.join(__dirname + '/app/views'));//set the views folder


var dbPath  = "mongodb://madhav:fury@ds151169.mlab.com:51169/chat";//command to connect database
db = mongoose.connect(dbPath);
mongoose.connection.once('open', function() {
  console.log("******Successfully Connected******");
});
//App level middleware
app.use(session({  //session middleware init
    name: 'CustomCookie',
    secret: 'furydragon', // encryption key 
    resave: true,
    httpOnly: true, 
    saveUninitialized: true,
    cookie: {
        secure: true
    }
}));


 app.get('/', function (req, res) { //route to get to chat page

 	 ChatModel.find().sort({created_on: -1}).limit(5).exec(function(err, result){ //sort the chats if they are available based on date limited to 5 chats,limit can be changed
            if(err){
                res.render('error', {
                 message: "database is acting crazy....",
                 error: "Error"
              });
            }
            else{
            	if(result.length == 0)
            	{
            		res.render('index',{
            	    chats:result,
            	    //message:"no chats or empty."
            		})
            	}
                console.log(result);
                  res.render('index',{
                  chats: result
              });
            }
        });
      });
 
io.on('connection', function(socket){

function onlineusers() //function to show the users who are online...
{
  io.emit('username', username);

}

  socket.on('user',function(data){//to show that the user is available to chat in the chat-box
    socket.user = data;
    console.log(data+ " is available to chat");
    socket.broadcast.emit('chat', data+" is available to chat");
    username.push(socket.user);
      onlineusers();
  });

  

  socket.on('chat', function(message){
            var newChat = new ChatModel({
            created_on : new Date(),
            message : socket.user+":-"+message
            });// end new chat...
             newChat.save(function(err){
                if(err){
                console.log("error!!!!");
                }
                else{
                console.log(newChat);
                }
              //console.log(message);
            });//end new user save
  
  io.emit('chat', socket.user+' : '+message +' Message sent on: '+new Date().toDateString()+' at '+ new Date().getHours()+':' + new Date().getMinutes() );
   });//date and time

  socket.on('message', function(message){
    io.emit('message', message);
   });
  
  socket.on('typing', function(data) { //to show user is typing(typing event)
  //console.log(data);
    if (data == false) {
       socket.broadcast.emit('message', 'no-one is intersted to type'); 
    } else {
        socket.broadcast.emit('message', socket.user+" is typing..."); 
    }
   });
  
  socket.on('disconnect',function(){ //when user refreshes or wishes to go offline
  	 console.log(socket.user+" went offline");
  	 socket.status = 0;
     socket.broadcast.emit('chat', socket.user+" went offline");
     if(!socket.user){
     return;
     }
     username.splice(username.indexOf(socket.user), 1); //remove user's name from current users
     onlineusers();
    }); //end socket disconnected
   });

app.use(function (err, req, res,next) {
  console.log(err.status);
    res.status(err.status || 500);
    if (err.status == 404) {
        res.render('404', {
            message: err.message,
            error: err
        });
    } else {
        res.render('error', {
            message: err.message,
            error: err
        });
    }
});

http.listen(3000, function(){
  console.log('Magic is happening on port 3000! please visit localhost:3000 to enjoy the magic');
});
