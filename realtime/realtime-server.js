
var io = require('socket.io').listen(5001),
    redis = require('redis').createClient();


if (redis.exists("connect_id")) {
  redis.del("connect_id");
}

// usernames which are currently connected to the chat
 var usernames = {};
 var numUsers = 0;

function saveOnlineTime(username) {
  redis.incr("connect_id", function(err, id){
     var t = new Date();
     redis.hset("connect:" + id, "online", t.getTime());
     redis.lpush("connect_id:billie", id);
  });
}

function saveOfflineTime(username) {
  var t = new Date();
  redis.lpop("connect_id:billie", function(err, id){
    redis.hset("connect:" + id, "offline", t.getTime());
    redis.lpush("connects:billie", "connect:" + id);
  })
}

io.on('connection', function(socket){
  var addedUser = false;

  socket.on('add user', function (username) {
    addedUser = true;
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    saveOnlineTime(username);

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
     saveOfflineTime(socket.username);
     // echo globally that this client has left
     socket.broadcast.emit('user left', {
       username: socket.username,
       numUsers: numUsers,
       usernames: usernames
     });
   });

});


