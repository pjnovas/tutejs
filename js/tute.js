
var Suit = ['oro','copa','espada','basto'];
var CardNumbers = [1,3,12,11,10,7,6,5,4,2]; 

now.startScreeen = function(){
	
	switch(now.qpl){
		case 3:
			$('div.gameStatus div.pos-0').hide();
			$('div.gameStatus div.pos-2').hide();
			break;
		case 4:
			$('div.gameStatus div.pos-1').hide();
			$('div.gameStatus div.pos-0').css('top',65).css('left', 425);
			$('div.gameStatus div.pos-2').css('top',65).css('left', 125);
			break;
	}
	
	now.name = prompt("Tu nombre?", "");
	$('#conecting').hide();	
}
	
$(document).ready(function(){
	
	InitChat();
	
	var $places = $('div.gameStatus div.available');
	$places.bind('click', function(){
		now.sit = parseFloat($(this).attr('idx'));
		$places.removeClass('available').unbind('click');
		$places.not('[idx=' + now.sit + '] ').children('div.plName').text('Esperando...');
		now.joinPlayer();
	});
	
	now.updatePlayers = function(players){		
		refreshPlayersStatus(players);
	};
	
	/*
	now.startGame = function(){
		alert('GAME STARTED');
	};
	*/
	
	$('#txtChat').attr('disabled', false);
});

function refreshPlayersStatus(players){
	for(var i=0; i < players.length; i++) {
		var $plCtn = $('div.gameStatus div.pos-'+ players[i].position);
		$('div.plName', $plCtn).text(players[i].name);
		
		//$('div.stolenCards', $plCtn).text(players[i].name);
		
		$('div#a').append('pl turn' + now.playerTurn);
		if (players[i].position === now.playerTurn){
			$('div.status', $plCtn).css('background-color', 'yellow');
			
			$('div.playerCard').bind('click', function(e){
				var card = $(this).data('card');
				now.dropCard(card.number, card.suit);
			});
			$('div#a').append('bindeo');
		}
		else {
			$('div.status', $plCtn).css('background-color', '');
			$('div.playerCard').unbind('click');
			$('div#a').append('Desbindeo');
		}
		
		if (players[i].droppedCard === null){}
		else {
			$('div.droppedCard', $plCtn).text(
				players[i].droppedCard.number + ' de ' + players[i].droppedCard.suit  
				);
		}
		
		if ($plCtn.hasClass('available'))
			$plCtn.removeClass('available').unbind('click');
			
		if (now.sit === players[i].position)
			showMyCards(players[i].handCards);
	}
}

function showMyCards(cards){
	cards.sort(function (a, b) { 
		var diff = $.inArray(a.suit, Suit) - $.inArray(b.suit, Suit);
		if (diff === 0)
			diff = $.inArray(a.number, CardNumbers) - $.inArray(b.number, CardNumbers);
		
		return diff;
	});
	
	var $tr = $('div.playerHand');
	$tr.children('div').empty().remove();
	
	for(j=0; j< cards.length; j++ ){
		var card = cards[j];
		$tr.append(
			$('<div>')
			.addClass('playerCard')
			.addClass('card')
			.addClass(card.suit.toLowerCase() + '-' + card.number)
			.data('card', card)
		);
	}
	
	$('div.bottom').append($tr);
}

function InitChat(){
	now.sendlog = function(who, msg){
		$('#console').append('<dt>&gt; ' + who + '</dt>:');
		$('#console').append('<dd>' + msg + '</dd>');
	};
	
	var $txtChat = $('#txtChat'); 
	$txtChat.bind('keypress', function (e){
		var code = (e.keyCode ? e.keyCode : e.which);
 		if(code === 13) {
			SendToLogChat(now.name, $txtChat.val() );
			$txtChat.val('');
		}
	});
}

function SendToLogChat(who, msg){
	now.sendChatMsg(who, msg);
}







