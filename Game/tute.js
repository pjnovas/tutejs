/**
 * @author pjnovas
 */

var roomJS = require('./room');

var rooms = [];

var initializeRooms = function(params){	
	
	for(var i=3; i<=5; i++){
		var aRoom = new roomJS.Room({
			id: i,
			name: "Room " + (i-2),
			sits: i,
			notifyRoomsState: params.roomsNotify
		});
		
		rooms.push(aRoom);
	} 
	
}

// TODO:build pagging
var getRoomsState = function (){
	var roomsSt = [];
	for(var i=0; i< rooms.length; i++){
		roomsSt.push(rooms[i].getState());
	}
	
	return roomsSt;
}

var getRoom = function (roomId){
	for(var i=0; i<rooms.length; i++){
		if (rooms[i].id == roomId)
			return rooms[i];
	}

	return null;
}

exports.rooms = rooms;
exports.initializeRooms = initializeRooms;
exports.getRoomsState = getRoomsState;
exports.getRoom = getRoom;


