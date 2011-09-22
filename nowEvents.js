/**
 * @author pjnovas
 */

var nowjs = require('now');
var tute = require('./Game/tute');
var connect = require('connect');

var initializeNowJS = function (app){ //, session_store) {
  
	//var everyone = nowjs.initialize(app); //, {socketio:{"log level": 0}});
	//var everyone = nowjs.initialize(app, {clientWrite: true, socketio: { 'transports': ['xhr-polling'] } } );
	var everyone = nowjs.initialize(app, {socketio: { 'transports': ['xhr-polling'] } } );
	
	/*	
	var everyone = nowjs.initialize(app, {
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
	
	/*
	var reloadSession = function(cookie){
		var sid = cookie['connect.sid'];
		if (sid){
			session_store.get(sid, function(error, session){
				if (error || !session){
					console.log('Err: %s -- session not found: %s', error, sid);
				}
				else session_store.set(sid, session);
			});
		}
	}
	*/
	
	var roomsNotifier = function () {
		var rooms = tute.getRoomsState();	
		
		if (everyone.now.updateRooms){
			everyone.now.updateRooms(rooms);
		}
	};

	//When a client connects
	nowjs.on('connect', function(){
		console.log("Joined: " + this.user.clientId);
		
		this.now.start();
		roomsNotifier();	
	});
	
	//When a client disconnects
	nowjs.on('disconnect', function(){
		console.log("Left: " + this.user.clientId);
		
		if (this.now.room !== undefined){
			//reloadSession(this.user.cookie);
			var userRoom = tute.getRoom(this.now.room);
			userRoom.leaveRoom(this.now.name, this.user.clientId);
		}
		
		roomsNotifier();
	});
	
	//When a client joins a room - fired from now.start() - play.ejs 
	everyone.now.joinRoom = function(roomId) {
		console.log("User Joined Room: %s ", roomId);
		this.now.room = roomId;
		
		var userRoom = tute.getRoom(roomId);
		userRoom.joinRoom(this.user.clientId, this.now.name);
		
		this.now.startScreeen(userRoom.sits);
		
		roomsNotifier();
	};
	
	//When a client selects a Sit in a room - play.ejs
	everyone.now.takeSit = function() {
		console.log("User took a sit at index: " + this.now.sit);
			
		var userRoom = tute.getRoom(this.now.room);	
		userRoom.takeSit(this.now.name, this.now.sit, this.user.clientId, this.now.image);
		
		roomsNotifier();
	};
	
	// When a user drops a card
	everyone.now.dropCard = function(cardNbr, cardSuit, callback) {
		var userRoom = tute.getRoom(this.now.room);
		
		if (!userRoom.game.isOnPause){
			console.log("User %s drop card %d of %s", this.now.name, cardNbr, cardSuit);
			userRoom.dropCard(this.now.sit, cardNbr, cardSuit, callback);
		}
	};
	
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

