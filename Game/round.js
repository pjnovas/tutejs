/**
 * @author pjnovas
 */

var deckClass = require('./deck');
var common = require('./common');

function Round(options){
	
	//publics
	this.trumpIdx = options.trumpIdx;
	this.roundtimes = options.times;
	this.plPriorCard = options.startIndex;
	
	//events
	this.onRoundMoved = options.onRoundMoved;
	this.onRoundEnd = options.onRoundEnd;
	
	//privates
	this.droppedCards = [];
	this.roundIdx = 0;
	this.priorCardIdx = 0;
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
	var isPriorTrump = deckClass.Deck.isTrump(priorCard, this.trumpIdx);
	var isFirstTrump = deckClass.Deck.isTrump(firstCard, this.trumpIdx);
	
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
			cards = this.getSuitCards(player, common.Suit[this.trumpIdx]);
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
	console.log('executing round move');
	this.droppedCards.push(cardDropped);
	var currPrior = this.droppedCards[this.priorCardIdx];

	if (this.isCardPrior(cardDropped, currPrior)) {
		this.priorCardIdx = this.droppedCards.length - 1;
		this.plPriorCard = plDroppedIdx;
	}
	console.log('droppeds length ' + this.droppedCards.length);
	
	if (this.roundIdx < this.roundtimes){
		this.roundIdx++;
		console.log('about to execute event onRoundMoved');
		this.onRoundMoved();
	}
	else {
		console.log('about to execute event onRoundEnd'); 
		this.onRoundEnd(this.plPriorCard);
	}
}

Round.prototype.isCardPrior = function (card, prior){
	if (deckClass.Deck.areSameSuit(prior, card))
		return deckClass.Deck.isAHigher(card, prior);
	else return deckClass.Deck.isTrump(card, this.trumpIdx);
}

Round.prototype.getBiggerCards = function (player, prior){
	var posibleCards = [];
	
	for (var i=0; i< player.handCards.length; i++){
		var aCard = player.handCards[i];
		
		if (deckClass.Deck.areSameSuit(aCard, prior) && deckClass.Deck.isAHigher(aCard, prior))
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

exports.Round = Round;

