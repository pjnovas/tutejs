/**
 * @author pjnovas
 */

var playerClass = require('./player');
var dealerClass = require('./dealer');
var roundClass = require('./round');

var Game = function(options){
	
	//publics
	this.playersAmm = options.playersAmm;
	this.name = options.name;
	
	this.players = [];
	
	this.currentTrumpIdx = null;
	this.playerTurn = null;
	
	//events
	this.onGameStarted = options.onGameStarted;
	this.onGameFinished = options.onGameFinished;
	this.onGameFinishedEnd = options.onGameFinishedEnd;
	
	this.onGameStarts = options.onGameStarts;
	this.onGameEnd = options.onGameEnd;
	
	this.onNewRound = options.onNewRound;
	this.onRoundMoved = options.onRoundMoved;
	this.onRoundEnd = options.onRoundEnd;
	
	this.onPlayerTookSit = options.onPlayerTookSit;
	this.onPlayerLeftRoom = options.onPlayerLeftRoom;
	this.onPlayerKickedOut = options.onPlayerKickedOut;
	this.onPlayerReTookSit = options.onPlayerReTookSit;
	this.onPlayerSang = options.onPlayerSang;
	
	//privates
	this.rounds = [];
	this.currentRound = null;
	this.lastThiefIdx = null;
	this.isOnPause = false;
	this.isOnGame = false;
	this.lastPlayerStarted = 0;
}

Game.prototype.startNewGame = function(){
	if (this.players.length === this.playersAmm){
		this.currentTrumpIdx = null;
		this.isOnGame = true;
		this.lastPlayerStarted = 0;
		this.startGame();
		this.onGameStarted();
	}
}

Game.prototype.endGame = function(){
	this.isOnPause = false;
	this.isOnGame = false;
	this.currentTrumpIdx = null;
	this.lastPlayerStarted = 0;
	
	if (this.players.length > 0)
	{
		do{
			var plName = this.players[this.players.length-1].name;
			this.removePlayer(plName);
		} while(this.players.length > 0)
	}
	
	this.players = [];
}

Game.prototype.startGame = function(){
	for(var i=0; i< this.players.length; i++){
		this.players[i].clear();
	}
	
	var actives = this.getActivePlayers();
	if (actives.length > 2 && this.isOnGame){		
		this.isOnPause = false;
		
		var isFirst = (this.currentTrumpIdx === null);
		if (this.currentTrumpIdx === null || this.currentTrumpIdx === 3)
			this.currentTrumpIdx = 0;
		else this.currentTrumpIdx++;
		
		if (!isFirst){
			this.playerTurn = this.lastPlayerStarted;
			this.setNextActivePlayerIndex();
		}
		
		var dealer = new dealerClass.Dealer(this.currentTrumpIdx, isFirst);
		this.lastPlayerStarted = dealer.Deal(actives, this.playerTurn);
		
		this.playerTurn = this.lastPlayerStarted;
		
		this.onGameStarts(this.currentTrumpIdx);
		
		this.newRound(this.playerTurn);
	}
	else {
		this.setWinnersOfGame();
		this.onGameFinished(this.players);
		
		var me = this;
		setTimeout(function(){
			me.endGame();
			me.onGameFinishedEnd();
		}, 15000);
	}
} 

Game.prototype.joinPlayer = function(name, pos, id, image){
	var me = this;
	
	var pl = new playerClass.Player({
		clientId: id,
		name: name,
		image: image,
		pos: pos,
		onBeforeDropCard: function(pl, aCard){
			return me.currentRound.canDropCard(pl, aCard);
		},
		onDropCard: function(droppedCard){
			me.currentRound.move(me.playerTurn, droppedCard);
		},
		onLeftRoom: function(name){
			me.isOnPause = true;
			me.onPlayerLeftRoom(me.players, name);
		
			setTimeout(function(){
				me.sitOutPlayer(name);
			}, 30000);
		},
		onReJoinRoom: function(name){
			var pause = false;
			var pls = me.players;
			for (var i=0; i< pls.length; i++){
		  		if (pls[i].disconnected)
		  			pause = true;
			}
			me.isOnPause = pause;
			
			me.onPlayerReTookSit(me.players, name);
		},
		onUserSings : function(name, song){
			me.onPlayerSang(name, song);
			if (this.called.tute)
				me.resolveTute();
		}
	});
	
	this.players.push(pl);
	this.players.sort(function (a, b) { return a.position - b.position }); 

	this.onPlayerTookSit(this.players, name);

	if (this.players.length === this.playersAmm){
		this.startNewGame();
	}
}

Game.prototype.newRound = function(playerStartIdx){
	this.currentRound = null;
	this.playerTurn = playerStartIdx; 
	
	this.onNewRound(this.players, playerStartIdx);
	
	var me = this;
	
	this.currentRound = new roundClass.Round({
		trumpIdx : this.currentTrumpIdx,
		times : this.getActivePlayers().length-1,
		startIndex :  this.playerTurn,
		onRoundMoved : function(){
			me.setNextActivePlayerIndex();
			me.onRoundMoved(me.players, me.playerTurn);
		},
		onRoundEnd : function(plThiefIdx){			
			me.onRoundEnd(me.players);
			
			setTimeout(function(){
				me.lastThiefIdx = plThiefIdx;
				me.endRoundTurn();
			}, 2000);
		}
	});
}

Game.prototype.endRoundTurn = function(){
	var plThiefIdx = this.lastThiefIdx;
	
	var cardsToSteal = [];
	for(var i=0; i< this.players.length; i++){
		var pl = this.players[i]; 
		if (!pl.isOut){
			var aStolenCard = pl.droppedCard;
			cardsToSteal.push(aStolenCard);
			pl.droppedCard = null;
			pl.cannotDoCalls();
		}
	}

	var plThief = this.players[plThiefIdx]; 
	plThief.stealCards(cardsToSteal);
	plThief.canDoCalls(this.currentTrumpIdx);

	if (plThief.handCards.length === 0){
		plThief.lastSteal = true;
		plThief.calculatePoints();
		
		this.resolveGameScores();
		this.onGameEnd(this.players);
		
		var me = this;
		setTimeout(function(){
			me.reCalculateBeans();
			me.startGame();
		}, 15000);
		
		return;
	}
	
	this.newRound(plThiefIdx);
}

Game.prototype.getPlayerByName = function(name){
	for (var i=0; i< this.players.length; i++){
  		if (this.players[i].name === name){
  			return this.players[i]; 
  		}
  	}
  	
  	return null;
}

Game.prototype.setNextActivePlayerIndex = function(){
	var i = this.playerTurn;
	var times = 0; 
	do{
		if (i === this.players.length - 1)
			i = 0;
		else i++;
		
		pl = this.players[i];
		times++;
		
	} while(pl.isOut || times === this.players.length);

	this.playerTurn = i;
}

Game.prototype.getActivePlayers = function(){
	var actives = [];
	for (var i=0; i< this.players.length; i++){
  		if (!this.players[i].isOut){
  			actives.push(this.players[i]); 
  		}
  	}
  	
  	return actives;
}

Game.prototype.sitOutPlayer = function(name){
	
	var pl = this.getPlayerByName(name);
	
	if (pl !== null && pl.disconnected){
		if (!this.isOnGame) {
			this.removePlayer(name);
		} else {
			pl.isOut = true;
			pl.beans = 4;
  			this.onPlayerKickedOut(name);
			this.onGameEnd(this.players);
			
			var me = this;
			setTimeout(function(){
				me.startGame();
			}, 15000);
		}
	}
}

Game.prototype.removePlayer = function(name){
	
	for (var i=0; i< this.players.length; i++){
  		if (this.players[i].name === name){
  			this.players.splice(i,1);
  			this.onPlayerKickedOut(name);
  			return;
  		}
  	}
}

Game.prototype.resolveGameScores = function(){
	//Sort players by points & stolenCards Desc
	var playersByPoints = this.getActivePlayers();
	playersByPoints.sort(function (a, b) { 
			var dif = b.stolenPoints - a.stolenPoints;
			if (dif === 0) dif = b.stolenCards.length - a.stolenCards.length;
			return dif;
		});
	
	playersByPoints[0].winner = true;
	
	//Capote 
	if (playersByPoints[1].stolenCards.length === 0){ 
		var fpl = playersByPoints[0];
		if (fpl.called.t20.length > 0 || fpl.called.t40){
			fpl.winner = false;
			for(var i=1; i < playersByPoints.length; i++)
				playersByPoints[i].winner = true;
		}
		
		return;
	}
	
	//By points
	for(var i=playersByPoints.length-1; i > 0; i--){
		if (playersByPoints[i].stolenCards.length === 0)
			playersByPoints[i].winner = true;
		else {
			if (i > 1) playersByPoints[i].winner = true; 
			break;
		}
	}
}

Game.prototype.resolveTute = function(){
	var actives = this.getActivePlayers();
	for(var i=0; i< actives.length; i++){
		var pl = actives[i];
		if (pl.called.tute)
			pl.winner = true;
		else pl.beans = 4;
	}
	this.onGameFinished(this.players);
	
	var me = this;
	setTimeout(function(){
		me.endGame();
		me.onGameFinishedEnd();
	}, 15000);
}

Game.prototype.reCalculateBeans = function(){
	var actives = this.getActivePlayers();
	for(var i=0; i< actives.length; i++){
		this.getPlayerByName(actives[i].name).calculateBeans();
	}
}

Game.prototype.setWinnersOfGame = function(){
	var actives = this.getActivePlayers();
	for(var i=0; i< actives.length; i++){
		this.getPlayerByName(actives[i].name).winner = true;
	}
}

exports.Game = Game;


