/**
 * @author pjnovas
 */

var express = require('express');
var tute = require('./Game/tute');

// -----------------------------------------------
// Configuration ---------------------------------
 
var app = express.createServer();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

 
// -----------------------------------------------
// Routes ----------------------------------------
var pageTitle = 'Tute';

app.get('/', function(req, res){
  res.render('index', {locals: {
    title: pageTitle
  }});
});

app.get('/rooms', function(req, res){
  res.render('index', {locals: {
    title: pageTitle
  }});
});

app.get('/rooms/:id', function(req, res){
	var roomId = req.params.id;
	if (tute.getRoom(roomId) === null)
		res.redirect('/');
	else 	
		res.render('play', {locals: {
			title: pageTitle + ' Mesa ' + roomId,
	    	roomId: roomId
		}});
});

app.use(express.static(__dirname + '/public'));

app.listen(11669); //process.env['app_port'];
console.log("Express server listening on port %d", app.address().port);


// -----------------------------------------------
// Initialize Game -------------------------------

var roomsNotifier = function () {
	var rooms = tute.getRoomsState();	
	everyone.now.updateRooms(rooms);
}

tute.initializeRooms({
	roomsNotify: roomsNotifier
});


//colors = require('colors');
//console.log('%d Tute Rooms initialized'.blue.bold, tute.rooms.length);
console.log('%d Tute Rooms initialized', tute.rooms.length);

// -----------------------------------------------
// NowJS component -------------------------------
var everyone = require('./nowEvents').initializeNowJS(app);
