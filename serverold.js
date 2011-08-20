
var html = require('fs').readFileSync(__dirname+'/index.html');
var url = require('url');


var server = require('http').createServer(function(request, response){
	/*var pathname = url.parse(request.url).pathname;
	console.log("Peticion Recibida para: " + pathname);

	response.end(html);
	*/
});
server.listen(8888);

var nowjs = require("now");
var everyone = nowjs.initialize(server);

/*everyone.now.distributeMessage = function(message){
  everyone.now.receiveMessage(this.now.name, message);
};*/
