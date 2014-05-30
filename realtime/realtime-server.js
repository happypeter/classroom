var io = require('socket.io').listen(5001)

io.on('connection', function(socket){
  console.log('a user connected');
});

