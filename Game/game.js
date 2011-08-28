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

var dropCard = function(playerSit, cardNbr, cardSuit){
	
	var player = gameInstance.players[gameInstance.playerTurn];
	
	if (player.position === playerSit){
		var dropped = player.dropCard(cardNbr, cardSuit);
		if (dropped)
			gameInstance.moveTurn();
		return dropped;
	}

	return false;
};

var getPlayerSit = function (){
	return gameInstance.players[gameInstance.playerTurn].position;	
};

exports.getSitsAmmount = getSitsAmmount;
exports.createGame = createGame;
exports.isGameActive = isGameActive;
exports.joinPlayer = joinPlayer; 
exports.getPlayers = getPlayers;

exports.dropCard = dropCard;
exports.getPlayerSit = getPlayerSit; 

/**************************************************************************/
/**************************************************************************/

var Suit = ['oro','copa','espada','basto'];
var CardNumbers = [1,3,12,11,10,7,6,5,4,2]; 

var Game = function(params){
	this.playersAmm = params.playersAmm;
	this.name = params.name;
	
	this.players = [];
	
	this.currentTrumpIdx = null;
	this.playerTurn = null;
	
	this.rounds = [];
	this.currentRound = null;
}

Game.prototype.startGame = function(){
	
	this.players.sort(function (a, b) { return a.position - b.position }); 
	
	if (this.currentTrumpIdx === null || this.currentTrumpIdx === 4)
		this.currentTrumpIdx = 0;
	else this.currentTrumpIdx++;
	
	var dealer = new Dealer(this.currentTrumpIdx);
	this.playerTurn = dealer.Deal(this.players);	
	
	this.newRound(this.playerTurn);
} 

Game.prototype.joinPlayer = function(name, pos){
	
	var pl = new Player(name, pos);
	this.players.push(pl);

	if (this.players.length == this.playersAmm){
		this.startGame();
		return true;
	}
	
	return false;	
}

Game.prototype.newRound = function(playerStartIdx){
	this.currentRound = null;
	this.playerTurn = playerStartIdx; 
	
	this.currentRound = new Round(this.playerTurn, this.players.length-1, this);												
	this.currentRound.start(this.currentTrumpIdx);
}

Game.prototype.moveTurn = function(){	
	var plIdx = this.playerTurn;
	var droppedCard = this.players[this.playerTurn].droppedCard; 
	
	var roundMoved = this.currentRound.move(plIdx, droppedCard);
	
	if (roundMoved){
		if (this.playerTurn === this.players.length - 1)
			this.playerTurn = 0;
		else this.playerTurn++;	
	}
}

Game.prototype.endRoundTurn = function(plThiefIdx){
	var cardsToSteal = [];
	for(var i=0; i< this.players.length; i++){
		var aStolenCard = this.players[i].droppedCard;
		cardsToSteal.push(aStolenCard);
		this.players[i].droppedCard = null;
	}

	this.players[plThiefIdx].stealCards(cardsToSteal);
	this.newRound(plThiefIdx);
}

/****************************************************/

function Round(plStartIdx, times, game){
	this.game = game;
	this.roundtimes = times;
	
	this.droppedCards = [];
	this.plPriorCard = plStartIdx;
	this.trumpIdx = null;
}

Round.prototype.start = function (currTrumpIdx){
	this.roundIdx = 0;
	this.priorCardIdx = 0;
	this.trumpIdx = currTrumpIdx;
}

Round.prototype.move = function (plDroppedIdx, cardDropped){
	this.droppedCards.push(cardDropped);

	if (this.isLastCardPrior())	{
		this.priorCardIdx = this.droppedCards.length - 1;
		this.plPriorCard = plDroppedIdx;
	}
	
	if (this.roundIdx < this.roundtimes)
		this.roundIdx++;
	else {
		this.game.endRoundTurn(this.plPriorCard);
		return false;
	}
	
	return true;
}

Round.prototype.isLastCardPrior = function (){
	var me = this;
	function isTrump(card){ 
		return (card.suit === Suit[me.trumpIdx]);
	}
	
	function areSameSuit(cardA, cardB){
		return (cardA.suit === cardB.suit);
	}
	
	function isAHigher(cardA, cardB){
		return (CardNumbers.indexOf(cardA.number) < CardNumbers.indexOf(cardB.number));
	}
	
	var currPrior = this.droppedCards[this.priorCardIdx];
	var card = this.droppedCards[this.droppedCards.length - 1];
	
	if (areSameSuit(currPrior, card))
		return isAHigher(card, currPrior);
	else return isTrump(card);
}

/****************************************************/

function Player(name, pos){
	this.name = name;
	this.position = pos;
	this.handCards = [];
	this.droppedCard = null;
	this.stolenCards = [];
	this.stolenPoints = 0;
}

Player.prototype.assignCard = function (aCard){
	this.handCards.push(aCard);
}

Player.prototype.dropCard = function (cardNbr, cardSuit){
	for (var i=0; i< this.handCards.length; i++){
		var aCard = this.handCards[i];
		if (cardNbr === aCard.number && cardSuit === aCard.suit){
			
			//TODO: Validate if card can be dropped
			
			this.droppedCard = aCard;
			this.handCards.splice(i, 1);
			return true;
		}
	}
	
	return false;
}

Player.prototype.stealCards = function (cards){
	for (var i=0; i< cards.length; i++){
		this.stolenCards.push(cards[i]);
	}
	
	this.calculatePoints();
}

Player.prototype.calculatePoints = function (){
	this.stolenPoints = 0;
	for (var i=0; i< this.stolenCards.length; i++){
		var card = this.stolenCards[i];
		this.stolenPoints += card.value;
	}
}

/****************************************************/

function Dealer(trumpIdx){
	this.deck = new Deck();	
	this.currentTrumpIdx = trumpIdx; 
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
	
	var startPlayer = 0;
	var cPlayer = 0;
	var maxPlayers = players.length;
	
	var cards = this.deck.cards;
	var cL = cards.length;
	
	for (var i=0; i< cL; i++){
		var cardFlying = cards[i];
		
		if (maxPlayers === 3 && 
			cardFlying.number === 2 && 
			Suit[this.currentTrumpIdx] === cardFlying.suit){
			startPlayer = cPlayer;
			continue;
		}
		
		players[cPlayer++].assignCard(cardFlying);
		if (cPlayer === maxPlayers) cPlayer=0;
	}	
	
	return startPlayer;
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
	
	var me = this;
	function getValue () {
		switch(me.number){
			case 1: return 11;
			case 3: return 10;
			case 12: return 4;
			case 11: return 3;
			case 10: return 2;
			default: return 0;
		}
	}
	
	this.value = getValue();
}

/****************************************************/






















