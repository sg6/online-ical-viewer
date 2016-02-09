var express = require('express'),
		app = express(),
		auth = require('basic-auth'),
		ical = require('ical'),
		fs = require('fs'),
		Q = require('q'),
		http = require('http'),
		https = require('https');

var lastUpdate = 0,
		secondsToCache = 1800,
		cachedDates;

var arrayOfUrls = JSON.parse(fs.readFileSync('icals.json', 'utf8'));

var allDates = [], f = [];
function getData(url, color) {
	var client = url.indexOf('https') === 0 ? https : http;
	return Q.promise(function(resolve,reject){
		client.get(url, function(res) {
			var data = "";
			res.on('data',function(chunk){
				data+=chunk;
			});
			res.on('end',function(){
				dates = ical.parseICS(data);
				for(k in dates) {
					dates[k]["color"] = color;
				}
				allDates.push(dates);
				resolve();
			});

		}).on('error',function(e){
			console.log("Error Request: "+e.message);
			reject();
		})
	});
}

function getDates() {

	var promises = [];
	for(a in arrayOfUrls) {
		var url = arrayOfUrls[a]["url"], color = arrayOfUrls[a]["color"];
		var promise = getData(url, color);
		promises.push(promise);
	}
	return Q.all(promises);


}

function getFormattedDates(cb) {
	allDates = [], f = [];
	getDates().then(function() {
		for (var k in allDates) {
			for(d in allDates[k]) {
				var date = allDates[k][d];
				if(date.type == "VEVENT") {
					f.push({
						title: date.summary,
						start: date.start,
						end: 	date.end,
						backgroundColor: date.color
					})
				}
			}
		}
		cb(f);
	})

}



app.use(express.static('public'));

app.get('/dates', function(req, res) {
	var credentials = auth(req)
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
	console.log(new Date() + ' ----------- New connection: ' + ip);

  if (!credentials || credentials.name !== 'john' || credentials.pass !== 'secret') {
    res.statusCode = 401
    res.setHeader('WWW-Authenticate', 'Basic realm="example"')
    res.end('Access denied')
  } else {
  	if(parseInt(new Date().getTime()/1000) - lastUpdate > secondsToCache) {
		console.log(new Date() + ' New fetch: ' + ip);
  		lastUpdate = parseInt(new Date().getTime()/1000);
	  	getFormattedDates(function(dates) {
				cachedDates = dates;
	  		res.json(dates);
	  	});
  	}
  	else {
  		res.json(cachedDates);
  	}
  }

});

var _port = 4499;
app.listen(_port);
