/**
 * @author pjnovas
 */

var nowjs = require('now');
var game = require('./game');
var common = require('./common');

function Room(options){
	
	this.id = options.id;
	this.name = options.name;
	this.sits = options.sits;
	this.state = common.RoomStates[0];
	this.roomType = common.RoomTypes[0];
	this.clientsCt = 0;
	
	this.game = null;
	this.initGame();
	
	this.notifyRoomsState = options.notifyRoomsState;
}

Room.prototype.initGame = function(){
	var me = this;
	this.game = new game.Game({
					name: "Tute",
					playersAmm: this.sits,
					onGameStarted: function (){
						me.state = common.RoomStates[1];
						me.sendSystemMessage('Juego Iniciado');
						//me.notifyRoomsState();
					},
					onGameStarts: function (trumpIdx){
						me.sendSystemMessage('Nueva partida!');
						me.updateTable(me.getPlayers(), null, true);
						me.updateTrump(trumpIdx);
					},
					onGameEnd: function(players){
						me.updateTable(me.getPlayers(), null, false);
						me.showWinners(players);
						me.sendSystemMessage('Nueva Partida en 15 segundos ...');
					},
					onGameFinished: function(players){
						me.sendSystemMessage('Reiniciando sala en 15 segundos ...');
						me.updateTable(me.getPlayers(), null, false);
						me.showWinners(players);
					},
					onGameFinishedEnd: function(){
						me.updateTable([], null, false);
						me.state = common.RoomStates[0];
						//me.notifyRoomsState();
						nowjs.getGroup(me.id).now.clearRoom();
					},
					onNewRound: function(players, plTurn){
						me.updateTable(me.getPlayers(), me.getPlayerTurn(), false);
						me.sendSystemMessage('Nueva mano');
					},
					onRoundMoved: function(players, plTurn){
						me.updateTable(me.getPlayers(), me.getPlayerTurn(), false);
					},
					onRoundEnd: function(players){
						me.updateTable(me.getPlayers(), null, false);
						me.sendSystemMessage('Fin de mano');
					},
					onPlayerTookSit: function(players, name){
						me.updateTrump(me.game.currentTrumpIdx);
						me.updateTable(me.getPlayers(), null, false);
						me.sendSystemMessage('Jugador ' + name + ' se ha sentado');
					},
					onPlayerLeftRoom: function(players, name){
						me.updateTable(me.getPlayers(), me.getPlayerTurn(), false);
						me.sendSystemMessage(name + ' se ha desconectado, esperando 30 segs');
					},
					onPlayerKickedOut: function(name){
						me.updateTable(me.getPlayers(), me.getPlayerTurn(), false);
						me.sendSystemMessage('Jugador ' + name + ' eliminado');
						//me.notifyRoomsState();
					},
					onPlayerReTookSit: function(players, name){
						me.updateTable(me.getPlayers(), me.getPlayerTurn(), true);
						me.sendSystemMessage('Jugador ' + name + ' re-conectado');
						
						if (!me.game.isOnPause)
							setTimeout(function(){
								me.sendSystemMessage('Se reanuda juego');	
							}, 1000);
							
					},
					onPlayerSang : function(name, song){
						me.updateTable(me.getPlayers(), me.getPlayerTurn(), false);
						me.sendSystemMessage('Jugador ' + name + ' canto ' + song);
					}
				}); 
}

Room.prototype.getPlayers = function(){
	var players = [];

	for(var j=0; j< this.game.players.length; j++){
		var gPl = this.game.players[j];
		
		var calledIndex = 0;
		if (gPl.stolenCards.length >0){
			calledIndex = 1;
			if (gPl.called.t40)
				calledIndex = 2;
			else if (gPl.called.t20.length > 0)
				calledIndex += gPl.called.t20.length;
		}
		
		var pl = {
			name: gPl.name,
			position: gPl.position,
			droppedCard: gPl.droppedCard,
			stolenCards: gPl.stolenCards,
			stolenPoints: gPl.stolenPoints,
			calledIndex: calledIndex,
			beans: gPl.beans,
			disconnected: gPl.disconnected,
			isOut: gPl.isOut,
			winner: gPl.winner
		};

		players.push(pl);
	}
	
	return players;
}

Room.prototype.updateTrump = function(trumpIdx){
	nowjs.getGroup(this.id).now.changeTrump(common.Suit[trumpIdx]);
}

Room.prototype.showWinners = function(players){
	nowjs.getGroup(this.id).now.showWinners(players);
}

Room.prototype.updateTable = function(players, turn, updateCards){
	var nowGroup = nowjs.getGroup(this.id);
	nowGroup.now.updatePlayers(players, turn);
	
	var players = this.game.players;
	if (updateCards){
		for (var i=0; i< players.length; i++)
		{		
			var pl = players[i];
			
			if (!pl.disconnected && !pl.isOut)
				nowjs.getClient(pl.clientId, function(){
					if (updateCards)
						this.now.updateMyCards(pl.handCards, turn);
						
					if (pl.position === turn)
						this.now.updateCanCall(pl.canCall);
					else this.now.updateCanCall(null);
				});
		}
	}
	else {
		if (turn !== null){
			var pl = players[this.game.playerTurn];
			
			if (!pl.disconnected && !pl.isOut)
				nowjs.getClient(pl.clientId, function(){					
					this.now.updateCanCall(pl.canCall);
				});
		}
	} 
}

Room.prototype.sendSystemMessage = function(msg){
	nowjs.getGroup(this.id).now.sendlogSystem(msg);
}

Room.prototype.joinRoom = function(clientId, name){
	var nowGroup = nowjs.getGroup(this.id);
	nowGroup.addUser(clientId);
	
	var player = this.game.getPlayerByName(name);
	if (player !== null && player.disconnected){
		
		nowjs.getClient(clientId, function () {
		  	this.now.sit = player.position;
		});
		
		player.reConnected(clientId);
	} //else nowGroup.now.sendlog('Sistema', 'Ha ingresado espectador: ' + name);
	
	this.updateTable(this.getPlayers(), this.getPlayerTurn(), false);
}

Room.prototype.leaveRoom = function (name, clientId) {
	var player = this.game.getPlayerByName(name);
	if (player !== null){
		player.leftRoom();
	}
	
	nowjs.getGroup(this.id).removeUser(clientId);
}

Room.prototype.takeSit = function(playerName, sitPosition, clientId){
	this.game.joinPlayer(playerName, sitPosition, clientId);
}

Room.prototype.getState = function(){
	
	var me = this;
	nowjs.getGroup(this.id).count(function(ct){
		me.clientsCt = ct;
	});
	
	return {
			id : this.id,
			sits: this.sits,
			state : this.state,
			players: this.game.players.length,
			clients: this.clientsCt 
		};
}

Room.prototype.getPlayerTurn = function () {
	if (this.game.players[this.game.playerTurn] !== undefined)
		return this.game.players[this.game.playerTurn].position;
	
	return null;  
}

Room.prototype.dropCard = function (playerSit, cardNbr, cardSuit, callback) {
	var nowGroup = nowjs.getGroup(this.id); 
	
   	var player = this.game.players[this.game.playerTurn];
	
	var wasDropped = false;
	if (player.position === playerSit){
		wasDropped = player.dropCard(cardNbr, cardSuit);
	}
	
	callback(wasDropped);
}

Room.prototype.userSing = function (playerName, song) {
	var player = this.game.players[this.game.playerTurn];
	player.sing(song);
}

exports.Room = Room;


