window.app.realtime = {
  connect : function(){
    window.app.socket = io.connect("http://0.0.0.0:3001");

    window.app.socket.on("rt-change", function(message){
      // publish the change on the client side, the channel == the resource
      window.app.trigger(message.resource, message);
    });
  }
}