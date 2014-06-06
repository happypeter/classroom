这是一个用 Rails+Nodejs+Redis 做出来的一个小的实时应用程序。网站总体框架用 rails，页面的一些实时效果使用 nodejs+socket.io 来实现，并且把数据存到 Redis 数据库之中，实时部分代码在 `realtime/` 目录之中。

把数据存入 Redis 都是由 nodejs 来完成，但是后续对于存入的数据进行统计和展示，还是用 Rails 来实现，毕竟 Ruby 来写一些脚本还是比 js 舒服。所以总提架构上 Rails 和 nodejs 基本上是完全分开的，Rails 只是给 nodejs 传递很简单地数据，而 nodejs 并不直接给 rails 传递数据，而是把数据存到 Redis 中，供 Rails 使用。所以这个架构是分工清晰的，代码维护起来也简单。

实际效果可以到 <http://classroom.happycasts.net> 来看看，点击页面上的 `Data` 链接，就可以看到有 ruby 统计出来的数据报告了。
