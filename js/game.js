
$(document).ready(function(){
	$( "#plAmm" ).buttonset();
	$( "#deal" ).button();
	
	$( "#deal" ).bind('click', function(){
		InitGame();		
	});
});

var gm = null;

function InitGame(){
	
	if (gm !== null){
		gm.Destroy();
	}

	gm = new Game({
		container: '#tableGame'		
	});
	
	var plAmmSel = parseFloat($(':radio:checked', '#plAmm').attr('value'))
	
	gm.Init({
		plAmm: plAmmSel
	});
}

/**********************************************************
// Class Game
**********************************************************/

function Game(params){
	this.$Container = $(params.container);

	this.PlayersAmmount = null;
	this.Players = null;
	
	this.Deck = null;
	this.Rounds = null;
	this.CurrentRound = null;
}

Game.prototype.Init = function(params){
	
	this.PlayersAmmount = params.plAmm;
	this.Players = [];
	for(var i=0; i<this.PlayersAmmount; i++){
		var pl = new Player({
			id: i,
			name: 'Player ' + i.toString(),
			order: i
		});
	
		this.Players.push(pl);
	}
	
	this.Deck = new Deck();
	this.Deck.Deal(this.Players);
	
	for(var i=0; i<this.Players.length; i++){
		this.Players[i].SortCards();
	}
	
	this.Draw();
	
	//this.Start();
}

Game.prototype.Draw = function(){
	var $table = $("<div>");
	
	for(var i=0; i< this.Players.length; i++){
		var pl = this.Players[i];
		var $tr = $('<div>').addClass('playerHand');
		
		$tr.append($('<div>').addClass('playerName').text(pl.Name));
		$tr.append($('<div>').addClass('playerDropSpot').text('CARTA'));
		
		for(j=0; j< pl.Cards.length; j++ ){
			var card = pl.Cards[j];
			$tr.append(
				$('<div>')
				.addClass('playerCard')
				.addClass('card')
				.addClass(card.Palo.toLowerCase() + '-' + card.Number)
				//.text(card.Number + ' - ' + card.Palo)
				);
			card = null;
		}
		
		$table.append($tr);
		$tr = null;
	}
	
	this.$Container.append($table);
	$table = null;
	
	$('div.card').bind('click', function(){
		$(this).addClass('droppedCard');
	});
}

Game.prototype.Start = function(){
	this.Rounds = [];
	this.NewRound();
}

Game.prototype.NewRound = function(){
	this.CurrentRound = new Round({
		game: this		
	});
	
}

Game.prototype.Destroy = function(){
	for(var i=0; i< this.Players.length; i++){
		this.Players[i].Destroy();
		this.Players[i] = null;
	}

	//this.CurrentRound = null;	
//	for(var i=0; i< this.Rounds.length; i++){
//		this.Rounds[i].Destroy();
//		this.Rounds[i] = null;
//	}

	this.Deck.Destroy();
	this.Deck = null;
	
	this.PlayersAmmount = null;
	
	this.$Container.children('div').empty().remove();
	this.$Container = null;
}

/**********************************************************
// Class Deck
**********************************************************/

function Deck(){
	this.CardNumbers = [1,3,12,11,10,7,6,5,4,2];
	
	this.Cards = [];
	for(var i=0; i<4; i++){
		var palos = ['Oro','Copa','Espada','Basto'];
		
		for(var j=0; j<10; j++){
			var c = new Card({
				palo: palos[i],
				number: this.CardNumbers[j]
			});
			this.Cards.push(c);
		}
	}
}

Deck.prototype.Deal = function(players){
	this.Shuffle();
	
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

Deck.prototype.Shuffle = function () {
	var array = this.Cards;

    var tmp, current, top = array.length;

    if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }

    this.Cards = array;
}

Deck.prototype.Destroy = function () {
	for (var i=0; i< this.Cards.length; i++){
		this.Cards[i].Destroy();
		this.Cards[i] = null;
	}
			
	this.Cards = null;
}

/**********************************************************
// Class Card
**********************************************************/
function Card(params){
	this.Number = params.number;
	this.Palo = params.palo;
	
	this.Player = null;
}

Card.prototype.Destroy = function () {
	this.Number = null;
	this.Palo = null;
	this.Player = null;
}

/**********************************************************
// Class Player
**********************************************************/

function Player(params){
	this.Id = params.id;
	this.Name = params.name;
	this.Turn = params.order;
	
	this.Cards = [];
	
	this.RoundPoints = 0;
	this.CardsTaken = [];
}

Player.prototype.SortCards = function(){
	var cardNumbers = [1,3,12,11,10,7,6,5,4,2];
	var palos = ['Oro','Copa','Espada','Basto'];
	
	this.Cards.sort(function (a, b) { 
		var diff = $.inArray(a.Palo, palos) - $.inArray(b.Palo, palos);
		if (diff === 0)
			diff = $.inArray(a.Number, cardNumbers) - $.inArray(b.Number, cardNumbers);
		
		return diff;
	});
}

Player.prototype.AssignCard = function(aCard){
	this.Cards.push(aCard);
	aCard.Player = this;
}

Player.prototype.DropCard = function(aCard){
	this.Cards.slice(aCard);
	aCard.Player = null;
}

Player.prototype.Destroy = function () {
	this.Id = null;
	this.Name = null;
	this.Turn = null;
	this.RoundPoints = null;
	
	for (var i=0; i< this.CardsTaken.length; i++){
		this.CardsTaken[i] = null;
	}
	this.CardsTaken = null;
	
	for (var i=0; i< this.Cards.length; i++){
		this.Cards[i].Destroy();
		this.Cards[i] = null;
	}
			
	this.Cards = null;
}


/**********************************************************
// Class Round
**********************************************************/

function Round(params){
	this.Game = params.game;
	this.PlayerTurn = params.player;
	
}

Round.prototype.MoveTurn = function () {
	
}

Round.prototype.Destroy = function () {
	this.Game = null;
	this.PlayerTurn = null;
	
}


























































