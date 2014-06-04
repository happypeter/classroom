
var io = require('socket.io').listen(5001),
    async = require('async'),
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
     redis.set("connect_id:" + username, id);
     redis.get("connect_id:" + username, function(err, key){
       console.log("saveOnlineTime******"+ key + username);
     });
  });
}

function getLoginTime(username, fn){
  redis.get("connect_id:" + username, function(err, key){
    console.log(">>>>>>>>>getLoginTime>>>>>>>"+ key + username);
      redis.hget("connect:" + key, 'online', function(err, value){
        fn(value);
    });
  });
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

    async.parallel([
      function(callback){
        setTimeout(function(){
          callback(null, 'one');
        }, 200);
      }
    ], function(){
      console.log("2111111111111111" + username);
      getLoginTime(username, function(value){
        io.sockets.emit('user joined', {
          username: socket.username,
          numUsers: numUsers,
          usernames: usernames,
          loginTime: value
        });
      })
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


