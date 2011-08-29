/**
 * @author pjnovas
 */

var tute = require('./Game/game');
var createPage = require('fs').readFileSync(__dirname + '/create.html');
var homePage = require('fs').readFileSync(__dirname + '/index.html');
var playPage = require('fs').readFileSync(__dirname + '/play.html');
var playTPage = require('fs').readFileSync(__dirname + '/playTest.html');
var querystring = require('querystring');

function create(response, postData) {
	response.end(createPage);
}

function reset(response, postData) {
	tute.resetGame();
	redirect(response, '/create');
}

function createGame(response, postData) {
	
	tute.createGame(
		querystring.parse(postData)['gameName'],
		parseFloat(querystring.parse(postData)['plAmm'])
	);
	
	redirect(response, '/play');
}

function play(response, postData) {
	
	if (tute.isGameActive())
		response.end(playPage);
	else redirect(response, '/create');
}

function playTest(response, postData) {
	response.end(playTPage);
}

function home(response, postData) {
	response.end(homePage);
}

function redirect(response, url){
	response.statusCode = 302;
	response.setHeader("Location", url);
	response.end();
}

exports.home = home;
exports.play = play;
exports.create = create;
exports.reset = reset;
exports.createGame = createGame;
exports.playTest = playTest;

