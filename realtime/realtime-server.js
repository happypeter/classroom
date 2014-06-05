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
     });
  });
}

function getLoginTime(arrayOfUsername, cb){
  var lastLoginTimes = {};
  async.each(arrayOfUsername,
    function(username, callback){
      redis.get("connect_id:" + username, function(err, key){
          redis.hget("connect:" + key, 'online', function(err, value){
            lastLoginTimes[username] = value;
            callback(lastLoginTimes);
        });
      });
    },
    function(err){
      cb(lastLoginTimes); // this callback must stay here
    }
  );
}

function saveOfflineTime(username) {
  var t = new Date();
  redis.lpop("connect_id:" + username, function(err, id){
    redis.hset("connect:" + id, "offline", t.getTime());
    redis.lpush("connects:" + username, "connect:" + id);
  });
}

io.on('connection', function(socket){
  var addedUser = false;
  var arrayOfUsername = [];

  socket.on('add user', function (username) {
    addedUser = true;
    socket.username = username;
    // add the client's username to the global list
    usernames[username] = username;
    arrayOfUsername = Object.keys(usernames);
    ++numUsers;

    async.parallel([
      function(callback){
        redis.incr("connect_id", function(err, id){
           var t = new Date();
           redis.hset("connect:" + id, "online", t.getTime());
           redis.set("connect_id:" + username, id);
           callback();
           // if I put callback() out of incr() this won't work
           // so callback() is really the end point of the execution
        });
      }
    ], function(err){
      getLoginTime(arrayOfUsername, function(value){
        console.log("************getLoginTimevalue******", value);
        io.sockets.emit('user joined', {
          username: socket.username,
          numUsers: numUsers,
          usernames: usernames,
          loginTime: value
        });
      });
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
