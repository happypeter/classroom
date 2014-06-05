var io = require('socket.io').listen(5001),
    async = require('async'),
    redis = require('redis').createClient();

if (redis.exists("connect_id")) {
  redis.del("connect_id");
}

// usernames which are currently connected to the chat
 var usernames = {};
 var numUsers = 0;


function getLoginTime(arrayOfUsername, cb){

  var asyncTasks = [];

  arrayOfUsername.forEach(function(username){
    asyncTasks.push(function(callback){

      redis.get("connect_id:" + username, function(err, key){
        redis.hget("connect:" + key, 'online', function(err, value){
          callback(null, value);
        });
      });

    });
  });

  async.parallel( asyncTasks,
    function(err, results){
      cb(results);
    }
  );
}


function getOffTime(username, cb){

  var asyncTasks = [];
    asyncTasks.push(function(callback){

      redis.get("connect_id:" + username, function(err, key){
        redis.hget("connect:" + key, 'online', function(err, value){
          callback(null, value);
        });
      });
    });

  async.parallel( asyncTasks,
    function(err, results){
      cb(results);
    }
  );
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

    async.series([
      function(callback){
        redis.incr("connect_id", function(err, id){
          // save login Time to redis
           var t = new Date();
           redis.hset("connect:" + id, "online", t.getTime());
           redis.set("connect_id:" + username, id);
           callback(null);
           // if I put callback() out of incr() this won't work
           // so callback() is really the end point of the execution
        });
      },

      function(callback) {
        getLoginTime(arrayOfUsername, function(value){
          io.sockets.emit('user joined', {
            username: socket.username,
            numUsers: numUsers,
            usernames: usernames,
            loginTime: value
          });
          callback(null);
        });
      }
    ]);

  });

   socket.on('disconnect', function () {
     // remove the username from global usernames list
     if (addedUser) {
       delete usernames[socket.username];
       --numUsers;
     }

     async.series([
        function(callback){
          // save off time
          var t = new Date();
          redis.lpop("connect_id:" + socket.username, function(err, id){
            redis.hset("connect:" + id, "offline", t.getTime());
            redis.lpush("connects:" + socket.username, "connect:" + id);
          });
          callback(null);
        },

        function(callback) {
          getOffTime(socket.username, function(value){
            // read off time
            io.sockets.emit('user left', {
              username: socket.username,
              numUsers: numUsers,
              usernames: usernames,
              offTime: value
            });
            callback(null);
          });
        }
      ]);

   });

});
