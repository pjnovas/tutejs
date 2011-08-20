/**
 * @author pjnovas
 */

var http = require("http");
var url = require("url");

function startServer(route, handle) {
	
  function onRequest(request, response) {
  	var postData = "";
    var pathname = url.parse(request.url).pathname;
    console.log("Request for " + pathname + " received.");

	request.setEncoding("utf8");
	
	request.addListener("data", function(postDataChunk){
		postData = postDataChunk;
		console.log("Recieved POST data chunk '" + postDataChunk + "'.");
	});
	
	request.addListener("end", function(){
		route(handle, pathname, response, postData);	
	});
    
  }

  var port = 8888;
  var server = http.createServer(onRequest);
  server.listen(port);
  
  console.log("Server Started at port " + port);
  
  return server;
}

exports.startServer = startServer;

