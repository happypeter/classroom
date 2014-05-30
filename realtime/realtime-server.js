
var io = require('socket.io').listen(5001),
    redis = require('redis').createClient();

io.on('connection', function(socket){
  console.log('......a user connected.................');
  socket.on('joiner-name', function(message) {
  	console.log(message)
	redis.set("username", message);
	redis.get("username", function(err, reply){
		console.log(reply +"++++++++++++++");
	})
  });


   socket.on('add user', function (username) {
		console.log("+++on add user+++++++++++");
    socket.broadcast.emit('user joined', {
      username: "fakename",
      numUsers: "3"
    });
   });



});


