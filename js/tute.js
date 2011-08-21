

$(document).ready(function(){
	now.playerHasJoined = function(name, players){
		alert('El jugador ' + name + ' se ha unido a la partida');
		
		$('#players li').empty().remove();
		for(var i=0; i <= players.length; i++) {
			$('#players').append($('<li>').text(players[i].name));
		}
	}
	
	now.startGame = function(){
		$('#gameStarted').text('GAME STARTED');
	}
	
	now.name = prompt("Tu nombre?", "");
	now.joinPlayer();
});

function InitPresentation(){
	
}







