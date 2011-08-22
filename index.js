/**
 * @author pjnovas
 */

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");
var nowjs = require("now");

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

/*
everyone.now.initPlay = function(){	
	console.log('----------------------------------------------------------------------------');
	console.log('----------------------------------------------------------------------------');
	var players = requestHandlers.getPlayers();
	everyone.now.updatePlayers(players);
	console.log('----------------------------------------------------------------------------');
	console.log('----------------------------------------------------------------------------');
};
*/

nowjs.on('connect', function(){
      var players = requestHandlers.getPlayers();
      everyone.now.updatePlayers(players);
});

	
everyone.now.joinPlayer = function(){
	var plName = this.now.name;
	console.log('Player ' + plName + ' has joined');
	
	everyone.now.sendlog('Sistema','Ha ingresado ' + plName);
	
	var state = requestHandlers.joinPlayer(plName, this.now.sit);
	everyone.now.updatePlayers(state.players);
	
	/*
	if (state.state){
		everyone.now.startGame();
	}
	*/
};

everyone.now.sendChatMsg = function(who, msg){
	everyone.now.sendlog(who, msg);
};




