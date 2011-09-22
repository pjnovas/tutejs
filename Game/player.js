/**
 * @author pjnovas
 */

var common = require('./common');

function Player(options){
	//publics
	this.clientId = options.clientId;
	this.name = options.name;
	this.image = options.image;
	this.position = options.pos;
	
	//events
	this.onBeforeDropCard = options.onBeforeDropCard;
	this.onDropCard = options.onDropCard;
	this.onLeftRoom = options.onLeftRoom;
	this.onReJoinRoom = options.onReJoinRoom;
	this.onUserSings = options.onUserSings;
	
	//privates
	this.handCards = [];
	this.droppedCard = null;
	this.stolenCards = [];
	this.stolenPoints = 0;
	this.lastSteal = false;
	
	this.canCall = {
		't20': [],
		't40': false,
		'Tute': false
		};
	
	this.called = {
		't20': [],
		't40': false,
		'Tute': false
	};
	
	this.winner = false;
	this.disconnected = false;
	this.beans = 0;
	this.isOut = false;
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

Player.prototype.leftRoom = function (){
	this.disconnected = true;
	this.onLeftRoom(this.name);
}

Player.prototype.reConnected = function (clientId){
	this.disconnected = false;
	this.clientId = clientId;
	this.onReJoinRoom(this.name);
}

Player.prototype.dropCard = function (cardNbr, cardSuit){
	
	var aCard = this.getHandCard(cardNbr, cardSuit);
	if (aCard === null) return;
	
	var canDropCard = this.onBeforeDropCard(this, aCard);
	
	if (canDropCard){
	
		for (var i=0; i< this.handCards.length; i++){
			var c = this.handCards[i];
			if (aCard.number === c.number && aCard.suit === c.suit){
				this.droppedCard = c;
				this.handCards.splice(i, 1);
				this.onDropCard(this.droppedCard);
				return true;
			}
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
	
	this.stolenPoints += (this.called.t20.length * 20);
	
	if(this.called.t40)
		this.stolenPoints += 40;
		
	if (this.lastSteal)
		this.stolenPoints += 10;
}

Player.prototype.sing = function (song){
	var songSang = '';
	
	switch(song){
		case '20s-oro':
			this.called.t20.push(common.Suit[0]);
			songSang = 'playerSang20o';
			break;
		case '20s-copa':
			this.called.t20.push(common.Suit[1]);
			songSang = 'playerSang20c';
			break;
		case '20s-espada':
			this.called.t20.push(common.Suit[2]);
			songSang = 'playerSang20e';
			break;
		case '20s-basto':
			this.called.t20.push(common.Suit[3]);
			songSang = 'playerSang20b';
			break;
		case '40s':
			this.called.t40 = true;
			songSang = 'playerSang40';
			break;
		case 'tute':
			this.called.tute = true;
			songSang = 'playerSangTUTE';
			break;
		default: console.log('Song not found: %s - by user %s', song, this.name);
	}
	
	this.calculatePoints();
	this.cannotDoCalls();
	this.onUserSings(this.name, songSang);
}

Player.prototype.canDoCalls = function (trumpIdx){
	
	this.canCall = {
		't20': [],
		't40': false,
		'Tute': false
		};
		
	var tute12Count = 0;
	var tute11Count = 0;
	for (var i=0; i< this.handCards.length; i++){
		var c = this.handCards[i];
		if (c.number === 12){
			tute12Count++;
			
			for(var j=0; j< this.handCards.length; j++){
				var c2 = this.handCards[j];
				if (c2.number === 11 && c.suit === c2.suit){
					if (c2.suit === common.Suit[trumpIdx] && this.called.t20.length === 0){
						this.canCall.t40 = !this.called.t40;
					}
					else if (!this.called.t40){
						var wasCalled = false;
						for(var k=0; k< this.called.t20.length; k++)
							if (this.called.t20[k] === c.suit){ wasCalled = true; break;}
						if (!wasCalled) this.canCall.t20.push(c.suit);
					}
				}
			}
			
		}
		else if (c.number === 11)
			tute11Count++;
	}
	
	if (tute12Count === 4 || tute11Count === 4)
		this.canCall.tute = true;
}

Player.prototype.cannotDoCalls = function (){
	this.canCall = {
		't20': [],
		't40': false,
		'Tute': false
		};
}

Player.prototype.calculateBeans = function (){
	if (!this.winner)
		this.beans++;
	
	if (this.beans === 4)
		this.isOut = true; //lost game
}

Player.prototype.clear = function (){
	this.handCards = [];
	this.droppedCard = null;
	this.stolenCards = [];
	this.stolenPoints = 0;
	this.lastSteal = false;
	
	this.canCall = {
		't20': [],
		't40': false,
		'Tute': false
		};
	
	this.called = {
		't20': [],
		't40': false,
		'Tute': false
	};
	
	this.winner = false;
}

exports.Player = Player; 

