
var io = require('socket.io').listen(5001),
    redis = require('redis').createClient();

redis.set("peter", "billie");
redis.get("peter", function(err, reply){
	console.log(reply +"++++++++++++++");
})
io.on('connection', function(socket){
  console.log('......a user connected.................');
  socket.on('joiner-name', function(message) {
  	console.log(message)
  });
});


