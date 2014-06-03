
var io = require('socket.io').listen(5001),
    redis = require('redis').createClient();


// usernames which are currently connected to the chat
 var usernames = {};
 var numUsers = 0;

io.on('connection', function(socket){
  var addedUser = false;


  socket.on('joiner-name', function(message) {
    console.log(message)
    redis.set("username", message);
  redis.get("username", function(err, reply){
    console.log(reply +"++++++++++++++");
  })
  });


  socket.on('add user', function (username) {
    addedUser = true;
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;

    io.sockets.emit('user joined', {
      username: socket.username,
      numUsers: numUsers,
      usernames: usernames
    });
  });

   socket.on('disconnect', function () {
     // remove the username from global usernames list
     if (addedUser) {
       delete usernames[socket.username];
       --numUsers;
     }
     
     // echo globally that this client has left
     socket.broadcast.emit('user left', {
       username: socket.username,
       numUsers: numUsers
     });
   });

});


