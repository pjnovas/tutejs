
now.startScreeen = function(){
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
	
	now.startGame = function(){
		alert('GAME STARTED');
	};
	
	$('#txtChat').attr('disabled', false);
});

function refreshPlayersStatus(players){
	for(var i=0; i < players.length; i++) {
		var $plCtn = $('div.gameStatus div.pos-'+ players[i].position);
		$('div.plName', $plCtn).text(players[i].name);
		//$('div.stolenCards', $plCtn).text(players[i].name);
		//$('div.status', $plCtn).text(players[i].name);
		//$('div.droppedCard', $plCtn).text(players[i].name);
		
		if ($plCtn.hasClass('available'))
			$plCtn.removeClass('available').unbind('click');
	}
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

function InitPresentation(){
	
}







