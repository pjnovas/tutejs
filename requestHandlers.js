/**
 * @author pjnovas
 */

var tute = require('./Game/game');
var createPage = require('fs').readFileSync(__dirname + '/create.html');
var homePage = require('fs').readFileSync(__dirname + '/index.html');
var playPage = require('fs').readFileSync(__dirname + '/play.html');
var querystring = require('querystring');

var gm = null;

function create(response, postData) {
	response.end(createPage);
}

function createGame(response, postData) {
	
	gm = new tute.Game({
		name: querystring.parse(postData)['gameName'],
		playersAmm: parseFloat(querystring.parse(postData)['plAmm'])
	});	
	
	redirect(response, '/play');
}

function play(response, postData) {
	
	console.log('Enter Game ' + gm.name + ' with ' + gm.playersAmm + ' players');	
	
	if (gm === null)
	{
		redirect(response, '/create');
	}
	else {
		response.end(playPage);
	}
}

function home(response, postData) {
	response.end(homePage);
}

function redirect(response, url){
	response.statusCode = 302;
	response.setHeader("Location", url);
	response.end();
}

var players = [];
var state = false;

function joinPlayer(playerName){
	players.push(playerName);
	if (players.length == 3)
		state = true;	
	
	return {
		state: state,
		players: players
	};
	
	//return false; // gm.joinPlayer(playerName);
};

exports.joinPlayer = joinPlayer;

exports.home = home;
exports.play = play;
exports.create = create;
exports.createGame = createGame;


