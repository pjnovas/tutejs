
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
	document.title = 'Tute.js - User: ' + now.name; 
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
	
	now.updatePlayers = function(players, sitTurn){		
		refreshPlayersStatus(players, sitTurn);
	};
	
	/*
	now.endRound = function(players){		
		refreshPlayersStatus(players, null);
		//runEndRound(thief);
	};
	*/
	
	$('#txtChat').attr('disabled', false);
});

function refreshPlayersStatus(players, plTurn){
	
	for(var i=0; i < players.length; i++) {
		var $plCtn = $('div.gameStatus div.pos-'+ players[i].position);
		$('div.plName', $plCtn).text(players[i].name);
		
		if (players[i].stolenCards.length > 0){
			$('div.stolenCards', $plCtn).text('XX');
			$('div.status', $plCtn).text(players[i].stolenPoints);
		}

		if (players[i].position === plTurn)
			$('div.status', $plCtn).css('background-color', 'yellow');
		else $('div.status', $plCtn).css('background-color', '');
		
		if (players[i].droppedCard === null) 
			$('div.droppedCard', $plCtn).text('').removeClass('tableCard')
				.removeClass('oro').removeClass('copa')
				.removeClass('espada').removeClass('basto');
		else {
			$('div.droppedCard', $plCtn)
				.text(players[i].droppedCard.number)
				.addClass('tableCard').addClass(players[i].droppedCard.suit);
		}
		
		if ($plCtn.hasClass('available'))
			$plCtn.removeClass('available').unbind('click');
			
		if (now.sit === players[i].position)
			showMyCards(players[i].handCards, plTurn);
	}
}

function showMyCards(cards, plTurn){
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
	
	// Bind/ Unbind drop card events
	if (now.sit === plTurn){
		$('div.playerCard').bind('click', function(e){
			var card = $(this).data('card');
			now.dropCard(card.number, card.suit);
		});
	}
	else $('div.playerCard').unbind('click');
}

function InitChat(){
	now.sendlog = function(who, msg){
		var h = parseFloat($('#console').height());
		$('#console').append('<dt>&gt; ' + who + '</dt>:')
					.append('<dd>' + msg + '</dd>')
					.scrollTop(h);
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







