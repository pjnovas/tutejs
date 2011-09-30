var gameSounds = {};
var buzzGroup;
var plsActives = 0;
var Suit = ['oro','copa','espada','basto'];
var CardNumbers = [1,3,12,11,10,7,6,5,4,2]; 


now.start = function(){
	/*
	do {
		var myName = prompt("Tu nombre?", "");
	}
	while($.trim(myName) === '');
	
	now.name = myName;
	now.image = '';
	document.title = 'Tute.js - ' + now.name;
	*/
	
	now.name = userAuthName;
	now.image = userAuthImage;
	
	now.joinRoom(roomId);
}

now.startScreeen = function(sits){
	$('div.gameStatus div').show();
	
	switch(sits){
		case 3:
			$('div.gameStatus div.pos-0').hide();
			$('div.gameStatus div.pos-2').hide();
			break;
		case 4:
			$('div.gameStatus div.pos-1').hide();
			break;
	}
	
	$('#conecting').hide();	
	//clearRoom();
}

$(document).ready(function(){
	$('div.gameStatus div').hide();
	
	InitChat();	
	
	var $places = $('div.gameStatus div.available');
	$places.live('click', function(){
		now.sit = parseFloat($(this).attr('idx'));
		$places.removeClass('available').unbind('click');
		$places.not('[idx=' + now.sit + '] ').children('div.plName').text(lang.gameplay.waiting);
		now.takeSit();
	});
	
	$('#txtChat').attr('disabled', false);
	$('ul.playerCalls li a.call').attr('disabled', true);
	$('#callBtn').bind('click', function(){
		$('ul.playerCalls').toggle();
	});
	
	initSounds();
});

now.changeTrump = function(suit){
	var $trump = $('div.trump');
	$trump.removeClass();	
	$trump.addClass('trump').addClass('trump-' + suit);
};

now.showWinners = function(players){
	gameSounds.finish.play();	
	for(var i=0; i < players.length; i++) {
		if (!players[i].isOut) {
			var $plCtn = $('div.gameStatus div.pos-'+ players[i].position);
			
			if (players[i].winner)
				$('div.plName', $plCtn).addClass('winner');
			else $('div.plName', $plCtn).addClass('loser');
		}
	}
}

now.clearRoom = function(){	
	clearRoom();
}
	
function clearRoom(){
	var $plCtn = $('div.gameStatus div.sit');
	$('div', $plCtn).empty().remove();
	
	$plCtn.addClass('available')
		.append('<div class="beans"></div>')
        .append('<div class="status"></div>')
        .append('<div class="stolenCards"></div>')
        .append('<div class="plName">'+ lang.gameplay.available +'</div>')
        .append('<div class="droppedCard"></div>');
}	

now.updatePlayers = function(players, plTurn){	
	plsActives = players.length;
	for(var i=0; i < players.length; i++) {
		var pl = players[i];
		
		var $plCtn = $('div.gameStatus div.pos-'+ pl.position);
		
		$('div', $plCtn).empty().remove();	
		$("#playerTmpl").tmpl(pl).appendTo($plCtn);
		
		if (plTurn !== null && pl.position === plTurn)
			$('div.plName', $plCtn).addClass('turn');
			
		if ($plCtn.hasClass('available'))
			$plCtn.removeClass('available').unbind('click');
			
		if (pl.isOut){
			$plCtn.addClass('out').attr('title','Fuera de mesa');
		}
		else if (pl.disconnected){
			$plCtn.removeClass('out').addClass('disconnected').attr('title','Desconectado, esperando...');
			var $plName = $('div.plName', $plCtn);
			$plName.text('[' + $plName.text() + ']');
		}
		else $plCtn.removeClass('out').removeClass('disconnected').attr('title','');
	}
	
	// Bind-Unbind drop card events
	if (now.sit === plTurn){
		$('div.playerCard').bind('click', function(e){
			var card = $(this).data('card');
			var me = this;
			now.dropCard(card.number, card.suit, function(wasDropped){
				if (wasDropped) {
					$(me).empty().remove();
					//UpdateCardMargin();
				}
			});
		});
	}
	else $('div.playerCard').unbind('click');
}

now.updateMyCards = function(cards, plTurn){	
	cards.sort(function (a, b) { 
		var diff = $.inArray(a.suit, Suit) - $.inArray(b.suit, Suit);
		if (diff === 0)
			diff = $.inArray(a.number, CardNumbers) - $.inArray(b.number, CardNumbers);
		
		return diff;
	});
	
	var $tr = $('div.playerHand');
	$tr.children('div').empty().remove();
	$tr.empty();
	
	for(j=0; j< cards.length; j++ ){
		var card = cards[j];
		var cls = "all";
		if (card.number === 1) 
			cls = "1"
		
		var $cardDiv = $('<div>').addClass('playerCard').addClass('card')
			.addClass(card.suit.toLowerCase() + '-' + cls).data('card', card);
		
		if (card.number !== 1)
			$cardDiv.append($('<div>').addClass('cardNbr').text(card.number));
		
		$cardDiv.append($('<div>').addClass('cardValue').addClass('cv-' + card.number));
		
		$tr.append($cardDiv);
	}
	
	//UpdateCardMargin();
	gameSounds.deal.play();
}

function UpdateCardMargin(){
	
	var l = $('div.playerCard:visible').length;
	var margin = -35;
	switch(l){
		case 13: margin = -60; break;
		case 12: margin = -57; break;
		case 11: margin = -53; break;
		case 10: margin = -48; break;
		case 9: margin = -42; break;
		default: margin = -35; break;
	}
	
	$('div.playerCard').css('margin-right', margin);	
}

now.updateCanCall = function(canCall){
	var $aCalls = $('ul.playerCalls li a.call'); 
	$aCalls.unbind('click').attr('disabled', true);
	
	if (canCall != null){
		var $ctn = $('ul.playerCalls'); 
		
		var t20s = canCall.t20;
		for(var i=0; i< t20s.length; i++){
			$('a#20s-' + t20s[i], $ctn).attr('disabled', false)
				.bind('click', function(){
					now.sing(this.id);
					$aCalls.unbind('click').attr('disabled', true);
					$ctn.hide();
				});
		}
		
		if (canCall.t40) $('a#40s', $ctn).attr('disabled', false)
							.bind('click', function(){
								now.sing(this.id);
								$aCalls.unbind('click').attr('disabled', true);
								$ctn.hide();
							});
		
		if (canCall.tute) $('a#tute', $ctn).attr('disabled', false)
							.bind('click', function(){
								now.sing(this.id);
								$aCalls.unbind('click').attr('disabled', true);
								$ctn.hide();
							});
	}
}

function InitChat(){
	now.sendlog = function(who, msg){
		var h = parseFloat($('#console').height()) + 90000;
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

now.sendlogSystem = function(alert, params){
	if (alert != 'playerDropCard' && alert != 'playerSang'
		&& alert != 'dealer'){
		var output = lang.gameplay.alerts[alert];
		
		if (params !== null) {
			for(var i=0; i<params.length; i++){
				output = output.replace('{' + i + '}', params[i]); 
			}
		}
		
		$('#sysMsg').text(output);
	}
	
	switch(alert){
		case 'playerTookSit': 
			gameSounds.tooksit.play();
			break;
		case 'playerLeftRoom': 
			gameSounds.disconnect.play();
			break;
		case 'playerKicked': 
			gameSounds.out.play();
			break;
		case 'playerDropCard':
			gameSounds.dropcard.play();
			break;
		case 'playerSang':
			gameSounds.sing.play();
			break;
		case 'dealer':
			gameSounds.deal.play();
			break;
		case 'roomReseting':
			var $tr = $('div.playerHand');
			$tr.children('div').empty().remove();
			$tr.empty();
			break;
	}
}

function initSounds(){	
	var formats = ['ogg', 'mp3', 'wav'];
	
	gameSounds = {
		tooksit: new buzz.sound("../sounds/tooksit", {formats: formats}),
		disconnect: new buzz.sound("../sounds/disconnect", {formats: formats}),
		out: new buzz.sound("../sounds/out", {formats: formats}),
		deal: new buzz.sound("../sounds/deal", {formats: formats}),
		dropcard: new buzz.sound("../sounds/dropcard", {formats: formats}),
		sing: new buzz.sound("../sounds/sing", {formats: formats}),
		finish: new buzz.sound("../sounds/finish", {formats: formats})
	};
	
	buzzGroup = new buzz.group([
		gameSounds.tooksit,
		gameSounds.disconnect,
		gameSounds.out,
		gameSounds.deal,
		gameSounds.dropcard,
		gameSounds.sing,
		gameSounds.finish
	]);
	
	$('#soundMan').bind('click', function(){
		if ($(this).hasClass('unmute')){
			buzzGroup.mute();
			$(this).removeClass().addClass('mute');
		}
		else {
			buzzGroup.unmute();
			$(this).removeClass().addClass('unmute');
		}
	});
	
	buzzGroup.Load();
}
