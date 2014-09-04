exports.article = require('./article');
exports.user = require('./user');

exports.index = function(req, res, next) {
  req.collections.articles.find({published: true}, {sort: {_id:-1}})
    .toArray(function(error, articles){
      if (error) {
        next(errpr);
      }

      res.render('index', {articles: articles});
    });
};
