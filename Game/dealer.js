/**
 * @author pjnovas
 */

var deckClass = require('./deck');
var common = require('./common');

function Dealer(trumpIdx, isFirst){
	this.deck = new deckClass.Deck();	
	this.currentTrumpIdx = trumpIdx;
	this.isFirst = isFirst; 
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

Dealer.prototype.Deal = function(players, beginPlayer){
	this.ShuffleDeck();
	
	var startPlayer = beginPlayer;
	var cPlayer = 0;
	var maxPlayers = players.length;
	
	var cards = this.deck.cards;
	var cL = cards.length;
	
	for (var i=0; i< cL; i++){
		var cardFlying = cards[i];
		
		if (cardFlying.number === 2 && common.Suit[this.currentTrumpIdx] === cardFlying.suit){
			if (this.isFirst) startPlayer = cPlayer;
			if (maxPlayers === 3) continue;
		}
		
		players[cPlayer++].assignCard(cardFlying);
		if (cPlayer === maxPlayers) cPlayer=0;
	}	
	
	return startPlayer;
}

exports.Dealer = Dealer;

