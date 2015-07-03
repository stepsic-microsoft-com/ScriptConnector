var port = process.env.PORT || 1337;
var baseHost = process.env.WEBSITE_HOSTNAME || 'localhost';

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var vm = require('vm');
	

var app = express();

var server = http.createServer(app);

var jsonParser = bodyParser.json();

app.post('/script', jsonParser, function(req,res){
	if(!req.body || !req.body.code || !req.body.sandbox){
		console.log('The request failed because it was missing parameters:\n' + JSON.stringify(req.body));
		return res.status(400).send('You need to provide code to execute and a sandbox that contains any objects you want to run the code over.');
	}
	
	var sandbox = req.body.sandbox;
	
	try{
		vm.runInNewContext(req.body.code, sandbox);
	}catch(error){
		console.log('The execution of the JavaScript code:\n' + req.body.code + '\nAnd Context:\n' +  JSON.stringify(req.body.sandbox) + '\nFailed with error:\n' + error);
		return res.status(400).send('The code you provided has an error in it. You must provide vaid JavaScript code that only references data in the sandbox.\n\n' + error);
	}
	
	res.json(sandbox);
});

app.post('/trigger', jsonParser, function(req,res){
	if(!req.body || !req.body.code || !req.body.sandbox){
		console.log('The request failed because it was missing parameters:\n' + JSON.stringify(req.body));
		return res.status(400).send('You need to provide code to execute and a sandbox that contains any objects you want to run the code over.');
	}
	
	var sandbox = req.body.sandbox;
	
	try{
		vm.runInNewContext(req.body.code, sandbox);
		if(sandbox.trigger == null){
			console.log('The caller did not provide a trigger for:\n' + req.body.code + '\nAnd Context:\n' +  JSON.stringify(req.body.sandbox));
			return res.status(400).send('To write a script trigger you must return a boolean property called \'trigger\' that is either true or false.');			
		} else if (sandbox.trigger == false){
			return res.status(202).send(sandbox);
		}
	}catch(error){
		console.log('The execution of the JavaScript code:\n' + req.body.code + '\nAnd Context:\n' +  JSON.stringify(req.body.sandbox) + '\nFailed with error:\n' + error);
		return res.status(400).send('The code you provided has an error in it. You must provide vaid JavaScript code that only references data in the sandbox.\n\n' + error);
	}
	
	res.json(sandbox);
});

app.get('/swagger/docs/v1', function(req,res){
	var fs = require('fs');
	var object = JSON.parse(fs.readFileSync('api.json','utf8'));
	res.json(object);
});

server.listen(port, baseHost, function () {
    console.log("Server started ... http://%s:%s",server.address().address,server.address().port);
});
