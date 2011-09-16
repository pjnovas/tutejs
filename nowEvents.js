/**
 * @author pjnovas
 */

var nowjs = require('now');
var tute = require('./Game/tute');

var initializeNowJS = function (app) {
  
	var everyone = nowjs.initialize(app); //, {socketio:{"log level": 0}});
	
	/*var everyone = nowjs.initialize(app, {
		socketio: {	
					'transports': ['websocket',
									'xhr-polling', 
									'flashsocket', 
									'server-events', 
									'htmlfile', 
									'xhr-multipart']
				}
		});
	*/
	
	var roomsNotifier = function () {
		var rooms = tute.getRoomsState();	
		everyone.now.updateRooms(rooms);
	}

	//When a client connects
	everyone.connected(function(){
		console.log("Connected: " + this.user.clientId);
		this.now.start();

		roomsNotifier();	
	});
	
	//When a client disconnects
	everyone.disconnected(function(){
		console.log("Disonnected: " + this.user.clientId);
		
		if (this.now.room !== undefined){
			var userRoom = tute.getRoom(this.now.room);
			userRoom.leaveRoom(this.now.name, this.user.clientId);
		}
		
		roomsNotifier();
	});
	
	//When a client joins a room - fired from now.start() - play.ejs 
	everyone.now.joinRoom = function(roomId) {
		console.log("User Joined Room: " + roomId);
		
		this.now.room = roomId;
		
		var userRoom = tute.getRoom(roomId);
		userRoom.joinRoom(this.user.clientId, this.now.name);
		
		this.now.startScreeen(userRoom.sits);
		
		roomsNotifier();
	}
	
	//When a client selects a Sit in a room - play.ejs
	everyone.now.takeSit = function() {
		console.log("User took a sit at index: " + this.now.sit);
		
		var userRoom = tute.getRoom(this.now.room);	
		userRoom.takeSit(this.now.name, this.now.sit, this.user.clientId);
		
		roomsNotifier();
	}
	
	// When a user drops a card
	everyone.now.dropCard = function(cardNbr, cardSuit, callback) {
		console.log('started call');
		var userRoom = tute.getRoom(this.now.room);
		
		if (!userRoom.game.isOnPause){
			console.log("User %s drop card %d of %s", this.now.name, cardNbr, cardSuit);
			userRoom.dropCard(this.now.sit, cardNbr, cardSuit, callback);
		}
		console.log('ended call');
	}
	
	everyone.now.sing = function(which) {
		console.log("User %s singed %s", this.now.name, which);
		tute.getRoom(this.now.room).userSing(this.now.name, which);
	};
	
	//Distribute a chat message sent by a user inside a Room - play.ejs
	everyone.now.sendChatMsg = function(who, msg) {
		console.log('started call msg ' + new Date());
		console.log("chat msg: who %s msg %s", who, msg);
		nowjs.getGroup(this.now.room).now.sendlog(who, msg);
	};
	
	return everyone;
}

exports.initializeNowJS = initializeNowJS;

