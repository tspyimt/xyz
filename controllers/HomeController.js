/**
 * Home Controller
 *
 * Handles the routes responsible for public facing pages (non-logged in pages)
 *
 * */


/**
 * Handles the route which renders the home page
 * @url "/"
 * */

exports.index = function (req, res) {
  res.render('index', {title: _config.appName, user: req.checkLoggedIn()});
};

/**
 * Handles the route which renders the artists page
 * @url "/artists"
 * */

exports.artists = function (req, res) {
  res.render('artists', {title: _config.appName, user: req.checkLoggedIn()});
};

/**
 * Handles the route which renders the collectors page
 * @url "/collectors"
 * */

exports.collectors = function (req, res) {
  res.render('collectors', {title: _config.appName, user: req.checkLoggedIn()});
};

/**
 * Handles the route which renders the developers page
 * @url "/developers"
 * */

exports.developers = function (req, res) {
  res.render('developers', {title: _config.appName, user: req.checkLoggedIn()});
};

/**
 * Handles the route which renders the trade page
 * @url "/trade"
 * */

exports.trade = function (req, res) {
  res.render('trade', {title: _config.appName, user: req.checkLoggedIn()});
};