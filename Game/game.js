
var Suit = {
	'oro':'Oro',
	'copa':'Copa',
	'espada': 'Espada',
	'basto': 'Basto'
}

var CardNumbers = [1,3,12,11,10,7,6,5,4,2]; 

var Game = function(params){
	this.playersAmm = params.playersAmm;
	this.name = params.name;
	this.players = null;
}

Game.prototype.startGame = function(){
		
} 

Game.prototype.joinPlayer = function(name){
	
	var pl = new Player(name);
	this.players.push(pl);
	
	if (this.players.length == this.playersAmm){
		this.startGame();
		return true;
	}
	
	return false;	
}

Game.prototype.destroy = function(){
	
	//Destroy players
	for(var i=0; i< this.players.length;i++){
		this.players[i].destroy();
		this.players[i] = null;
	}
	this.players = null;
	
}

exports.Game = Game;

/****************************************************/

function Room(){
	this.players = null;
	this.round = null;
}

Room.prototype.JoinPlayer = function(){
		
}

/****************************************************/

function Round(dealer, turnIndex, playersNbr){
	this.dealer = dealer;
	this.playerTurn = turnIndex;
	this.playersNumber = playersNbr;
	
	this.Start();
}

Round.prototype.Start = function (){
	
}

Round.prototype.Move = function (){
	if (this.playerTurn < this.playersNumber){
		this.playerTurn++;
	}
	else {}
}

/****************************************************/

function Player(name){
	this.name = null;
	this.handCards = [];
}

Player.prototype.AssignCard = function (aCard){
	this.handCards.push(aCard);
	aCard.Player = this;
}

Player.prototype.DropCard = function (aCard){
	
}

Player.prototype.SortHand = function(){
	this.handCards.sort(function (a, b) { 
		var diff = $.inArray(a.suit, Suit) - $.inArray(b.suit, Suit);
		if (diff === 0)
			diff = $.inArray(a.number, CardNumbers) - $.inArray(b.number, CardNumbers);
		
		return diff;
	});
}

/****************************************************/

function Dealer(){
	this.deck = new Deck();	
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
	
	var cards = this.Cards;
	var cL = cards.length;
	
	for (var i=0; i< cL; i++){
		var cardFlying = cards[i];
		
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
}

/****************************************************/






















