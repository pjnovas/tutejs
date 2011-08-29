

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
	var round = tute.dropCard(this.now.sit, cardNbr, cardSuit);
	if(round.dropped) {
		everyone.now.sendlog(this.now.name, 'Tiro carta ' + cardNbr + ' de ' + cardSuit);
		
		if (round.endRound){
			//everyone.now.endRound(tute.getPlayers());
			everyone.now.updatePlayers(tute.getPlayers(), null);
			
			function newRound(){
				var finished = tute.nextRound();
				everyone.now.updatePlayers(tute.getPlayers(), tute.getPlayerSit());
				
				if (finished){
					//var winner = tute.getPlayerWinnerName(); 
					everyone.now.sendlog('Sistema', 'Juego Finalizado '); // - Ganador: ' + winner);
					
					function startNewGame(){
						var newTrump = tute.newGame();
						everyone.now.sendlog('Sistema', 'Juego Iniciado!');
						everyone.now.updatePlayers(tute.getPlayers(), tute.getPlayerSit());
						everyone.now.changeTrump(newTrump);
					}
					
					everyone.now.sendlog('Sistema', 'Nueva Partida en 15 segundos ...');
					setTimeout(startNewGame, 15000);
				}
				else everyone.now.sendlog('Sistema', 'Nueva mano');
			}
			
			everyone.now.sendlog('Sistema', 'Fin de mano, inicio en 5 segundos');
			setTimeout(newRound, 5000);
		}
		else everyone.now.updatePlayers(tute.getPlayers(), tute.getPlayerSit());
	}
};
	
everyone.now.call20s = function() {
	var isValid = tute.call20s();
	if (isValid){
		everyone.now.sendlog(this.now.name, 'Canto las 20 en XXX'); //+ suit);
		everyone.now.updatePlayers(tute.getPlayers(), tute.getPlayerSit());
	}
};
everyone.now.call40s = function() {
	var isValid = tute.call40s();
	if (isValid){
		everyone.now.sendlog(this.now.name, 'Canto las 40');
		everyone.now.updatePlayers(tute.getPlayers(), tute.getPlayerSit());
	}
};
everyone.now.callTute = function() {
	var isValid = tute.callTute();
	if (isValid){
		everyone.now.sendlog(this.now.name, 'Canto TUTE');
		everyone.now.updatePlayers(tute.getPlayers(), tute.getPlayerSit());
		//TODO: finish game
	}
};

everyone.now.sendChatMsg = function(who, msg) {
	everyone.now.sendlog(who, msg);
};
