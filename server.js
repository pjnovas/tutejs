/**
 * @author pjnovas
 * Node Packages: socket.io, now, express, ejs, everyauth
 */

var express = require('express');
var tute = require('./Game/tute');

var everyauth = require('everyauth');
var auth = require('./authEvents');

var i18n = require('./i18n').I18n; 

// -----------------------------------------------
// Configuration ---------------------------------
 
//var MemoryStore = require('connect').session.MemoryStore; 
//var session_store = new MemoryStore();
var app = express.createServer();

app.configure(function(){

	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	//app.use(express.session({store: session_store, secret: 'htuayreve' })); 
	app.use(express.session({secret: 'htuayreve' })); 
	app.use(everyauth.middleware());
	
	app.use(function(req, res, next){
		if (!req.session.lang)
			req.session.lang = "es"; 
		
		req.lang = i18n[req.session.lang];
		return next();
	});
 
	app.use(app.router);
	app.use(express.favicon());
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

 
// -----------------------------------------------
// Routes ----------------------------------------
function RenderHome(req, res){
	var usr = "";
	if (req.loggedIn)
		usr = req.user;
		
  	res.render('index', {
  		locals: {
	    	title: req.lang.title,
	    	lang: req.lang,
	    	loggedIn: req.loggedIn,
	    	userAuth: usr
	    	}
	    });
}

app.get('/culture/:lang', function(req, res){
	var l = req.params.lang;
	if (i18n[l])
		req.session.lang = l;
		
	res.redirect('/');
});

app.get('/rooms/:id', function(req, res){
	if (!req.loggedIn)
		res.redirect('/');
	else {
		var roomId = req.params.id;
		if (tute.getRoom(roomId) === null)
			next();
		else 	
			res.render('play', {locals: {
				title: req.lang.roomTitle + roomId,
				lang: req.lang,
		    	roomId: roomId,
		    	userAuth: req.user
			}});
	}
});


app.get('/rooms', function(req, res){
	RenderHome(req, res);
});

var everyauth = require('everyauth');
//route for facebook embeded app
app.post('/canvas', function(req, res){
	
	RenderHome(req, res);
});

app.get('/', function(req, res){
	RenderHome(req, res);
});

app.use(express.static(__dirname + '/public'));

// -----------------------------------------------
// Initialize Authorization for EveryAuth module -
auth.initializeAuth(app);

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
var everyone = require('./nowEvents').initializeNowJS(app); //, session_store);
