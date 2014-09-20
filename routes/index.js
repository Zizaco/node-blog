exports.article = require('./article');
exports.user = require('./user');

exports.index = function(req, res, next) {
  req.models.Article.find({published: true}, null, {sort: {_id:-1}}, function(error, articles) {
    if (error) {
      next(errpr);
    }

    res.render('index', {articles: articles});
  });
};
