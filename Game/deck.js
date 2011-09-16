/**
 * @author pjnovas
 */

var common = require('./common.js');
var deckCardClass = require('./deckCard');

function Deck(){
	this.cards = [];
	this.buildDeck();
}

Deck.prototype.buildDeck = function(){
	
	for(var i=0; i<4; i++){
		for(var j=0; j<10; j++){
			var c = new deckCardClass.DeckCard(common.Suit[i],common.CardNumbers[j]);
			this.cards.push(c);
		}
	}
	
}

Deck.isTrump = function(card, trumpIdx){ 
	return (card.suit === common.Suit[trumpIdx]);
}
	
Deck.areSameSuit = function(cardA, cardB){
	return (cardA.suit === cardB.suit);
}

Deck.isAHigher = function(cardA, cardB){
	return (common.CardNumbers.indexOf(cardA.number) < common.CardNumbers.indexOf(cardB.number));
}

exports.Deck = Deck;

