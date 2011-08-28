

/**
 * @author pjnovas
 */

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var nowjs = require("now");
var tute = require('./Game/game');

var handle = {}
handle["/"] = requestHandlers.create;
handle["/play"] = requestHandlers.play;
handle["/playTest"] = requestHandlers.playTest;
handle["/home"] = requestHandlers.home;
handle["/create"] = requestHandlers.create;
handle["/createGame"] = requestHandlers.createGame;

var currentServer = server.startServer(router.route, handle);

var everyone = nowjs.initialize(currentServer);
console.log("NowJs Initialized");

nowjs.on('connect', function() {
	//TODO: checkout if the player is already connected.
	everyone.now.qpl = tute.getSitsAmmount();

	this.now.updatePlayers(tute.getPlayers(), null);
	this.now.startScreeen();
});

everyone.now.joinPlayer = function() {
	var plName = this.now.name;
	console.log('Player ' + plName + ' has joined');

	var gameStarted = tute.joinPlayer(plName, this.now.sit);
	everyone.now.sendlog('Sistema', 'Ha ingresado ' + plName);
	var plTurn = null;

	if(gameStarted) {
		plTurn = tute.getPlayerSit();
		everyone.now.sendlog('Sistema', 'Juego Iniciado!');
	}

	everyone.now.updatePlayers(tute.getPlayers(), plTurn);
};

everyone.now.dropCard = function(cardNbr, cardSuit) {
	var wasDropped = tute.dropCard(this.now.sit, cardNbr, cardSuit);
	if(wasDropped) {
		everyone.now.updatePlayers(tute.getPlayers(), tute.getPlayerSit());
		everyone.now.sendlog(this.now.name, 'Tiro carta ' + cardNbr + ' de ' + cardSuit);
	}
};

everyone.now.sendChatMsg = function(who, msg) {
	everyone.now.sendlog(who, msg);
};
