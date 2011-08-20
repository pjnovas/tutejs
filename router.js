/**
 * @author pjnovas
 */

function route(handle, pathname, response, postData) {
  console.log("About to route a request for " + pathname);
  
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response, postData);
  } else {
  	
  	var flPath = __dirname + pathname;  	
  	console.log('Reading a request for ' + flPath);
  	
  	var fileRequested = require('fs').readFileSync(flPath);
  	response.end(fileRequested);
  	
  	/*
    console.log("No request handler found for " + pathname);
    response.writeHead(404, {"Content-Type": "text/html"});
    response.write("404 Not found");
    response.end();
    */
  }
}

exports.route = route;