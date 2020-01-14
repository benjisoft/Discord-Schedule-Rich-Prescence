var http = require('http');
var scheduler = require('node-schedule');
const discord = require('discord-rich-presence')('653932521184296960');


http.createServer(function(request, response) {
if (request.method == 'POST') {
      console.log('POST')
      var body = ''
      request.on('data', function(data) {
        body += data
      })
      request.on('end', function() {
        console.log('Body: ' + JSON.stringify(body))
        response.writeHead(200, {'Content-Type': 'text/html'})
        response.end('post received')
        schedule(body);
      })
    } else if (request.method == 'OPTIONS') {
      response.writeHead(200, {'Access-Control-Allow-Origin':  'http://127.0.0.1:3000'},{'Access-Control-Allow-Methods': 'POST'},{'Access-Control-Allow-Headers': 'Content-Type, Authorization'})
      response.end();
    }
}).listen(9999);

function schedule(event) {
    event = JSON.parse(event);
    var j = scheduler.scheduleJob(event.startcron, function(){
        discord.updatePresence({
        state: event["subject"],
        details: event.location,
        // startTimestamp: event.startEPOCH, // Change to EPOCH
        // endTimestamp: event.endEPOCH,
        largeImageKey: 'coding',
        smallImageKey: 'logo',
        instance: true,
        });
      });
}