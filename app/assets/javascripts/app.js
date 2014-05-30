$(function() {
  var start;
  start = function() {
      var booksRouter;
      app.realtime.connect();
      booksRouter = new app.routers.Books();
      return Backbone.history.start({
            pushState: true
          });
    };
  return start();
});
