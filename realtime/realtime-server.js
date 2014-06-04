
var io = require('socket.io').listen(5001),
    redis = require('redis').createClient();


if (redis.exists("connect_id")) {
  redis.del("connect_id");
}

// usernames which are currently connected to the chat
 var usernames = {};
 var numUsers = 0;
 var loginGtime;

function saveOnlineTime(username) {
  redis.incr("connect_id", function(err, id){
     var t = new Date();
     console.log(":.....username......." + username);
     redis.hset("connect:" + id, "online", t.getTime());
     redis.lpush("connect_id:" + username, id);
  });
}

function getLoginTime(username) {
  redis.lrange("connect_id:" + username, 0, 1, function(err, key){
      redis.hget("connect:" + key[0], 'online', function(err, value){
      console.log("-e-----dddddddddddddd" + value);
      loginGtime=value;
    });
  });
  return loginGtime;
}

function saveOfflineTime(username) {
  var t = new Date();
  console.log(":.offfff....username......." + username);
  redis.lpop("connect_id:" + username, function(err, id){
    redis.hset("connect:" + id, "offline", t.getTime());
    redis.lpush("connects:" + username, "connect:" + id);
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
    login = getLoginTime(username);

    io.sockets.emit('user joined', {
      username: socket.username,
      numUsers: numUsers,
      usernames: usernames,
      loginTime: login
    });
  });

   socket.on('disconnect', function () {
     // remove the username from global usernames list
     saveOfflineTime(socket.username);
     if (addedUser) {
       delete usernames[socket.username];
       --numUsers;
     }
     // echo globally that this client has left
     socket.broadcast.emit('user left', {
       username: socket.username,
       numUsers: numUsers,
       usernames: usernames
     });
   });

});


