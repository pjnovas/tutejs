/**
 * @author pjnovas
 */

var conf = require('./authConf');
var everyauth = require('everyauth');

var usersById = {};
var nextUserId = 0;
var usersByGoogleId = {};
var usersByFbId = {};
var usersByTwitId = {};

var initializeAuth = function(app){
	everyauth.helpExpress(app);
}

function addUser (source, sourceUser) {
	var user;	
	var name = "";
	var imageURL = "";
	 	
	switch(source){
		case "twitter":
			name = sourceUser.screen_name;
			imageURL = sourceUser.profile_image_url;
			break;
		case "facebook":
			name = sourceUser.username;
			imageURL = 'http://graph.facebook.com/' + sourceUser.id + '/picture';
 			break;
 		case "google":
 			name = sourceUser.id.split('@')[0];
			//imageURL = 'http://www.google.com/m8/feeds/photos/media/default/' + sourceUser.id; 
 			break;
 			
 	}
 	
    user = usersById[++nextUserId] = {
	    	id: nextUserId,
	    	name: name,
	    	image: imageURL
    	};
    	
    user[source] = sourceUser;
	return user;
}
 
everyauth.everymodule
	//.logoutPath('/')
	.findUserById( function (id, callback) {
	    callback(null, usersById[id]);
	});

everyauth.google
	.entryPath('/auth/google')
  	.callbackPath('/oauth2callback')
  	.appId(conf.google.clientId)
  	.appSecret(conf.google.clientSecret)
  	.scope('https://www.google.com/m8/feeds/')
  	//.apiKey(conf.google.apiKey)
  	//.scope('https://www.googleapis.com/auth/plus.me')
  	.findOrCreateUser( function (sess, accessToken, extra, googleUser) {
    	googleUser.refreshToken = extra.refresh_token;
    	googleUser.expiresIn = extra.expires_in;
    	//console.log('Google name ' + extra.contactId);
    	//console.log('Google name ' + extra.contactId);
    	//googleUser.picture = extra.contactId;
    	return usersByGoogleId[googleUser.id] || (usersByGoogleId[googleUser.id] = addUser('google', googleUser));
  	})
  	.redirectPath('/');

everyauth.facebook
    .appId(conf.fb.appId)
    .appSecret(conf.fb.appSecret)
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
    	return usersByFbId[fbUserMetadata.id] || (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
    })
    .redirectPath('/');
    
everyauth.twitter
    .consumerKey(conf.twit.consumerKey)
    .consumerSecret(conf.twit.consumerSecret)
    .findOrCreateUser( function (sess, accessToken, accessSecret, twitUser) {
    	return usersByTwitId[twitUser.id] || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
    })
    .redirectPath('/');

exports.initializeAuth = initializeAuth; 


