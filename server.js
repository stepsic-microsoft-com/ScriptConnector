var port = process.env.PORT || 1337;
var baseHost = process.env.WEBSITE_HOSTNAME || 'localhost';

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var vm = require('vm');
	

var app = express();

var server = http.createServer(app);

var jsonParser = bodyParser.json();

app.post('/api/data/script', jsonParser, function(req,res){
	if(!req.body || !req.body.code || !req.body.sandbox){
		return res.status(400).send('You need to provide code to execute and a sandbox that contains any objects you want to run the code over.');
	}
	
	var sandbox = req.body.sandbox;
	
	try{
		vm.runInNewContext(req.body.code, sandbox);
	}catch(error){
		return res.status(400).send('The code you provided has an error in it. You must provide vaid JavaScript code that only references data in the sandbox.\n\n' + error);
	}
	
	res.json(sandbox);
});

app.post('/api/data/trigger', jsonParser, function(req,res){
	if(!req.body || !req.body.code || !req.body.sandbox){
		return res.status(400).send('You need to provide code to execute and a sandbox that contains any objects you want to run the code over.');
	}
	
	var sandbox = req.body.sandbox;
	
	try{
		vm.runInNewContext(req.body.code, sandbox);
		if(sandbox.trigger == null){
			return res.status(400).send('To write a script trigger you must return a boolean property called \'trigger\' that is either true or false.');			
		} else if (sandbox.trigger == false){
			return res.status(202).send(sandbox);
		}
	}catch(error){
		return res.status(400).send('The code you provided has an error in it. You must provide vaid JavaScript code that only references data in the sandbox.\n\n' + error);
	}
	
	res.json(sandbox);
});

app.get('/swagger/docs/v1', function(req,res){
	var fs = require('fs');
	var object = fs.readFileSync('api.json','utf8');
	res.setHeader('Content-Type', 'application/json');
	res.send(object);
});

server.listen(port, baseHost, function () {
    console.log("Server started ... http://%s:%s",server.address().address,server.address().port);
});
