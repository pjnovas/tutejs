/**
 * @author pjnovas
 */

var gameInstance = null;

var createGame = function(gmName, plAmm){
	gameInstance = new Game({
		name: gmName,
		playersAmm: plAmm
	});	
};

var getSitsAmmount = function () {
	return gameInstance.playersAmm;
};

var isGameActive = function(){
	return (gameInstance !== null); 
};

var joinPlayer = function(plName, position){
	return gameInstance.joinPlayer(plName, position);
};

var getPlayers = function(){
	if (gameInstance !== null)
		return gameInstance.players;
	else return [];
};

var dropCard = function(playerIdx, cardNbr, cardSuit){
	if (gameInstance.playerTurn === playerIdx){
		for (var i=0; i<gameInstance.players.length; i++){
			
			var player = gameInstance.players[i];
			if (playerIdx === player.position)
				return player.dropCard(cardNbr, cardSuit);
		}
	}
	
	return false;
};

var getPlayerTurn = function (){
	return 0;//gameInstance.playerTurn;	
};

exports.getSitsAmmount = getSitsAmmount;
exports.createGame = createGame;
exports.isGameActive = isGameActive;
exports.joinPlayer = joinPlayer; 
exports.getPlayers = getPlayers;

exports.dropCard = dropCard;
exports.getPlayerTurn = getPlayerTurn; 

/**************************************************************************/
/**************************************************************************/

var Suit = ['oro','copa','espada','basto'];
var CardNumbers = [1,3,12,11,10,7,6,5,4,2]; 

var Game = function(params){
	this.playersAmm = params.playersAmm;
	this.name = params.name;
	
	this.players = [];
	
	this.currentTrumpIdx = null;
	this.playerTurn = 0;
}

Game.prototype.startGame = function(){
	this.rounds = [];
	
	if (this.currentTrumpIdx === null)
		this.currentTrumpIdx = 0;
	else if (this.currentTrumpIdx == 4)
		this.currentTrumpIdx = 0;
	else this.currentTrumpIdx++;
	
	if (this.playerTurn === null)
		this.playerTurn = 0;
	else if (this.playerTurn === this.players.length)
		this.playerTurn = 0;
	else this.playerTurn++;
	
	this.nextRound();
} 

Game.prototype.joinPlayer = function(name, pos){
	
	var pl = new Player(name, pos);
	this.players.push(pl);
	
	console.log('Player pushed - name: ' + name);	
	console.log('Player length: ' + this.players.length);

	if (this.players.length == this.playersAmm){
		this.startGame();
		return true;
	}
	
	return false;	
}

Game.prototype.nextRound = function(playerIndex){
	var round = new Round(playerIndex, this);
	round.start();
}

/****************************************************/

function Round(turnIndex, game){
	this.game = game;
	this.playerTurn = turnIndex;
	this.playersNumber = game.players.length;
}

Round.prototype.start = function (){
	this.game.playerTurn = this.playerTurn;
	var dealer = new Dealer();
	dealer.Deal(this.game.players);	
}

Round.prototype.move = function (){
	if (this.playerTurn < this.playersNumber){
		this.playerTurn++;
	}
	else this.playerTurn = 0;
	
	this.game.playerTurn = this.playerTurn;
}

/****************************************************/

function Player(name, pos){
	this.name = name;
	this.position = pos;
	this.handCards = [];
	this.droppedCard = null;
}

Player.prototype.AssignCard = function (aCard){
	this.handCards.push(aCard);
	//aCard.player = this;
}

Player.prototype.dropCard = function (cardNbr, cardSuit){
	for (var i=0; i< this.handCards.length; i++){
		var aCard = this.handCards[i];
		if (cardNbr === aCard.number && cardSuit === aCard.suit){
			this.droppedCard = aCard;
			this.handCards.splice(i, 1);
			return true;	
		}
	}
	
	return false;
}

Player.prototype.GetHandCards = function(){
	//this.SortHand();
	return this.handCards;
}

/****************************************************/

function Dealer(){
	this.deck = new Deck();	
	this.currentTrumpIdx = 0; 
}

Dealer.prototype.ShuffleDeck = function () {
	var array = this.deck.cards;

    var tmp, current, top = array.length;

    if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }

    this.deck.cards = array;
}

Dealer.prototype.Deal = function(players){
	this.ShuffleDeck();
	
	var cPlayer = 0;
	var maxPlayers = players.length;
	
	var cards = this.deck.cards;
	var cL = cards.length;
	
	for (var i=0; i< cL; i++){
		var cardFlying = cards[i];
		
		if (maxPlayers === 3 && 
			cardFlying.number === 2 && 
			Suit[this.currentTrumpIdx] === cardFlying.suit)
			continue;
		
		players[cPlayer++].AssignCard(cardFlying);
		if (cPlayer === maxPlayers) cPlayer=0;
	}	
}

/****************************************************/

function Deck(){
	this.cards = [];
	this.BuildDeck();
}

Deck.prototype.BuildDeck = function(){
	
	for(var i=0; i<4; i++){
		for(var j=0; j<10; j++){
			var c = new DeckCard(Suit[i],CardNumbers[j]);
			this.cards.push(c);
		}
	}
	
}

/****************************************************/

function DeckCard(suit, number){
	this.number = number;
	this.suit = suit;
	
	function getValue () {
		switch(this.number){
			case 1: return 11;
			case 3: return 10;
			case 12: return 4;
			case 11: return 3;
			case 10: return 2;
			default: return 0;
		}
	}
	
	this.value = getValue();
	//this.player = null;
}

/****************************************************/






















