var express = require('express'),
  routes    = require('./routes'),
  http      = require('http'),
  path      = require('path'),
  mongoose  = require('mongoose'),
  models    = require('./models');

var dbUrl = process.env.MONGOHQ_URL || 'mongodb://127.0.0.1:27017/blog';
var db = mongoose.connect(dbUrl, {safe: true});

var session      = require('express-session'),
  logger         = require('morgan'),
  errorHandler   = require('errorhandler'),
  cookieParser   = require('cookie-parser'),
  bodyParser     = require('body-parser'),
  methodOverride = require('method-override');
  everyauth      = require('everyauth');

var app = express();
app.locals.appTitle = 'blog-express';

// Expose collections to request handlers
app.use(function(req, res, next) {
  if (!models.Article || !models.User) {
    return next(new Error('No models.'))
  }
  req.models = models;
  return next();
})

// Configurations
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Everyauth configuration
var TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY
  TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET

everyauth.debug = true;
everyauth.twitter
  .consumerKey(TWITTER_CONSUMER_KEY)
  .consumerSecret(TWITTER_CONSUMER_SECRET)
  .findOrCreateUser(
    function(
      session,
      accessToken,
      accessTokenSecret,
      twitterUserMetadata
    ) {
      var promise = this.Promise();
      process.nextTick(function() {
        if (twitterUserMetadata.screen_name === 'ZizacoZizaco') {
          session.user = twitterUserMetadata;
          session.admin = true;
        }
        promise.fulfill(twitterUserMetadata);
      })
      return promise;
    }
  )
  .redirectPath('/admin');

everyauth.everymodule.handleLogout(routes.user.logout);
everyauth.everymodule.findUserById(function(user, callback) {
  callback(user);
});

// Middleware configuration
app.use(cookieParser('3CAC4ACD-6ED1-4844-9217-82131BDCB239'));
app.use(session({secret: '2C22774A-D649-4D44-9535-46E296EF984F'}));
app.use(everyauth.middleware());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// Authentication middleware
app.use(function(req, res, next) {
  if (req.session && req.session.admin) {
    res.locals.admin = true;
  }
  return next();
});

// Autorization middleware
var authorize = function(req, res, next) {
  if (req.session && req.session.admin) {
    return next();
  } else {
    return res.send(401);
  }
}

// Development only
if ('development' == app.get('env')) {
  app.use(errorHandler());
}

// Page Routes
app.get('/', routes.index);
app.get('/login', routes.user.login);
app.post('/login', routes.user.authenticate);
app.get('/logout', routes.user.logout);
app.get('/admin', authorize, routes.article.admin);
app.get('/post', authorize, routes.article.post);
app.post('/post', authorize, routes.article.postArticle);
app.get('/articles/:slug', routes.article.show);

// Rest API Routes
app.all('/api', authorize);
app.get('/api/articles', routes.article.list);
app.post('/api/articles', routes.article.add);
app.put('/api/articles/:id', routes.article.edit);
app.del('/api/articles/:id', routes.article.del);

// 404
app.all('*', function(req, res) {
  res.send(404);
});

// Run server
var server = http.createServer(app);
var boot = function() {
  server.listen(
    app.get('port'),
    function() {
      console.log(
        'Express server listening on port ' +
        app.get('port')
      );
    }
  );
}

var shutdown = function() {
  server.close();
}

if (require.main === module) {
  boot();
} else {
  console.info('Running app as a module');
  exports.boot     = boot;
  exports.shutdown = shutdown;
  exports.port     = app.get('port');
}
