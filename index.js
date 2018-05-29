var cron = require('node-schedule');
var client = require('./client.js');
 

console.log('Starting Server......');
	var job = cron.scheduleJob('*/10 * * * *', function(){ //every 10 min
	client.getCurrencyReate();
});

var jobReport = cron.scheduleJob('0 1 12 * * *', function(){// every day 12pm
	client.getCurrencyReate(true);
});