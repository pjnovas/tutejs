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
		var cardToDrop = player.getHandCard(cardNbr, cardSuit);
		if (cardToDrop === null) return false;
		
		var canDropCard = gameInstance.currentRound.canDropCard(player, cardToDrop);
		if (canDropCard){
			player.dropCard(cardToDrop);
			var endRound = !gameInstance.moveTurn();
			
			return {
				endRound: endRound,
				dropped: true
			};
		}
	}

	return {
		endRound: false,
		dropped: false
	};
};

var nextRound = function(){
	gameInstance.endRoundTurn();
}

var getPlayerSit = function (){
	return gameInstance.players[gameInstance.playerTurn].position;	
};

exports.getSitsAmmount = getSitsAmmount;
exports.createGame = createGame;
exports.isGameActive = isGameActive;
exports.joinPlayer = joinPlayer; 
exports.getPlayers = getPlayers;

exports.dropCard = dropCard;
exports.nextRound = nextRound;
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
	this.lastThiefIdx = null;
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
	
	return roundMoved;
}

Game.prototype.endRoundTurn = function(){
	var plThiefIdx = this.lastThiefIdx;
	
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

Round.prototype.canDropCard = function (player, cardToDrop){
	//first player
	if (this.droppedCards.length === 0)
		return true;
	
	//player has same suit than first?
	//Yes
		//Is prior trump?
		//Yes
			//Is first trump?
			//Yes
				//Check if card is bigger than Prior -> B	
			//No
				//Check if card is the same suit as first -> A
		//No
			//Check if card is bigger than Prior -> B
	//No
		//Is first trump?
		//Yes
			//return true 
		//No
			//player has trump? -> A with trump suit
			//Yes
				//Is prior trump?
				//Yes
					//Check if card is bigger than prior -> B
				//No
					//Check if card is any of players trumps -> A with trump suit 
			//No
				//return true
		
	/***************************************************************************************/
	
	var priorCard = this.droppedCards[this.priorCardIdx];
	var firstCard = this.droppedCards[0];
	var isPriorTrump = Deck.isTrump(priorCard, this.trumpIdx);
	var isFirstTrump = Deck.isTrump(firstCard, this.trumpIdx);
	
	var cards = null;
	
	var cards = this.getSuitCards(player, firstCard.suit);
	if (cards.length > 0){
		if (isPriorTrump){
			if (isFirstTrump){
				var cardsPrior = this.getBiggerCards(player, priorCard);
				if (cardsPrior.length > 0){
					return this.isCardInGroup(cardToDrop, cardsPrior);	
				}
				else return this.isCardInGroup(cardToDrop, cards);	
			}
			else{
				cards = this.getSuitCards(player, firstCard.suit);
				return this.isCardInGroup(cardToDrop, cards);
			}
		}
		else{
			var cardsPrior = this.getBiggerCards(player, priorCard);
			if (cardsPrior.length > 0){
				return this.isCardInGroup(cardToDrop, cardsPrior);	
			}
			else return this.isCardInGroup(cardToDrop, cards);	
		}
	}
	else {
		if (isFirstTrump){
			return true;
		}
		else{
			cards = this.getSuitCards(player, Suit[this.trumpIdx]);
			if (cards.length > 0){
				if (isPriorTrump){
					var cardsPrior = this.getBiggerCards(player, priorCard);
					if (cardsPrior.length > 0){
						return this.isCardInGroup(cardToDrop, cardsPrior);	
					}
					else return this.isCardInGroup(cardToDrop, cards);	
				}
				else{
					return this.isCardInGroup(cardToDrop, cards);
				}
			}
			else{
				return true;
			}
		}
	}
}

Round.prototype.move = function (plDroppedIdx, cardDropped){
	this.droppedCards.push(cardDropped);
	var currPrior = this.droppedCards[this.priorCardIdx];

	if (this.isCardPrior(cardDropped, currPrior)) {
		this.priorCardIdx = this.droppedCards.length - 1;
		this.plPriorCard = plDroppedIdx;
	}
	
	if (this.roundIdx < this.roundtimes)
		this.roundIdx++;
	else {
		this.game.lastThiefIdx = this.plPriorCard;
		return false;
	}
	
	return true;
}

Round.prototype.isCardPrior = function (card, prior){
	if (Deck.areSameSuit(prior, card))
		return Deck.isAHigher(card, prior);
	else return Deck.isTrump(card, this.trumpIdx);
}

Round.prototype.getBiggerCards = function (player, prior){
	var posibleCards = [];
	
	for (var i=0; i< player.handCards.length; i++){
		var aCard = player.handCards[i];
		
		if (Deck.areSameSuit(aCard, prior) && Deck.isAHigher(aCard, prior))
			posibleCards.push(aCard);
	}
	
	return posibleCards;
}

Round.prototype.getSuitCards = function (player, suit){
	var posibleCards = [];
	
	for (var i=0; i< player.handCards.length; i++){
		var aCard = player.handCards[i];
		
		if (aCard.suit === suit)
			posibleCards.push(aCard);
	}
	
	return posibleCards;
}

Round.prototype.isCardInGroup = function (card, group){
	if (group.length === 0)
		return false;
	
	for (var i=0; i< group.length; i++){
		if(card.number === group[i].number && card.suit === group[i].suit)
			return true;
	}
	return false;
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

Player.prototype.getHandCard = function (cardNbr, cardSuit){
	for (var i=0; i< this.handCards.length; i++){
		var aCard = this.handCards[i];
		if (cardNbr === aCard.number && cardSuit === aCard.suit){
			return aCard;
		}
	}
	
	return null;
}

Player.prototype.dropCard = function (aCard){
	for (var i=0; i< this.handCards.length; i++){
		var c = this.handCards[i];
		if (aCard.number === c.number && aCard.suit === c.suit){
			this.droppedCard = c;
			this.handCards.splice(i, 1);
			return;
		}
	}
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

Deck.isTrump = function(card, trumpIdx){ 
	return (card.suit === Suit[trumpIdx]);
}
	
Deck.areSameSuit = function(cardA, cardB){
	return (cardA.suit === cardB.suit);
}

Deck.isAHigher = function(cardA, cardB){
	return (CardNumbers.indexOf(cardA.number) < CardNumbers.indexOf(cardB.number));
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






















