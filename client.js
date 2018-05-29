var https = require('https');
const cheerio = require('cheerio');

var _ = require('lodash');
var Tesseract = require('tesseract.js');
var path = require('path'); 
var fs = require('fs');
var Jimp = require("jimp"); 
var tableify = require('tableify');

const request = require('superagent');
const agent = request.agent();

// var emailTitle = 'BOC Exchange Rates Daily Report';
var receiveList = ['winghey@hotmail.co.uk','colin@techbee.co.nz'];
var sellTarget = 545.00;
var sendEmailFrency = 60;// 30 min
var lastMailSend = null; 


var sendEmailExchange = (html,isReport,nzSell,callback) =>{
	let emailTitle = '!!!Exchange Rates Match!!! NZD@'+ nzSell;
	if(isReport){
		emailTitle = '(Report)Exchange Rates Daily NZD@'+ nzSell;
	}
	console.log('Exchange Email sent: ' + info.response);
	callback(null,true);

}


var getCurrencyReate = (isReport,callback) =>{

	let options = {
		host: 'www.bochk.com',
		port: 443,
		path: '/whk/rates/exchangeRatesHKD/exchangeRatesHKD-input.action?lang=en',
		method: 'GET'
	};
	var req = https.request(options, function(res) {
		console.log('GET: ' + res.statusCode);
		let responseData = '';
		let currencyData = [];
		res.on('data', function(d) {
			responseData+=d;
		});
		res.on('end',function(d){
			const $ = cheerio.load(responseData);
			$('tr').each(function(i, tr){
				let data = {};
				data.currency = $($('td', this)[0]).text().trim();
				data.buy = $($('td', this)[1]).text().trim();
				data.sell = $($('td', this)[2]).text().trim();
				if(data.currency && data.currency.length === 3){
					currencyData.push(data);
				}else{
					let frechTime = _.includes(data.currency, 'Information last updated at HK Time:');
					if(frechTime){
						data.currency = data.currency.toString().replace('Information last updated at HK Time:', '');
						data.currency = data.currency.trim();
						currencyData.push(data);
					}
					
				}
			});

			let nzd = _.find(currencyData, function(o) { return o.currency ==='NZD'; });
			nzd.buy = parseFloat(nzd.buy).toFixed(2);
			nzd.sell = parseFloat(nzd.sell).toFixed(2);

			console.log('set watch=',sellTarget,nzd,currencyData[currencyData.length-1].currency);
			let shouldSend = false;

			if(sellTarget>=nzd.sell){
				var dateNow = Date.now();
				if(lastMailSend){
					var passminute = Math.abs(dateNow - lastMailSend) / 60000;
					if(passminute>sendEmailFrency){
						shouldSend = true;
					}
				}else{
					shouldSend = true;
				}
			}

			if(isReport){shouldSend = true;}

			if(shouldSend){
				lastMailSend = Date.now();
				let html = '<table><tr><th>Currency</th><th>Buy</th><th>Sell</th></tr>';
				currencyData.forEach(function (item) {
					if(item.currency==='NZD'){ 
						html+='<tr><td>'+item.currency+'</td><td>'+item.buy+'</td><td bgcolor="#FF0000">'+item.sell+'</td></tr>';
					}else if(item.currency==='CNY'||item.currency==='JPY'||item.currency==='EUR'){
						html+='<tr><td>'+item.currency+'</td><td>'+item.buy+'</td><td>'+item.sell+'</td></tr>';
					}
				});
				html+='</table>';
				sendEmailExchange(html,isReport,nzd.sell,function(err,didEmailSend){
					callback(err,didEmailSend);
				});
			}
		});
	});
	req.end();
	req.on('error', function(e) {
		console.error(e);
		return callback(e);
	});
}
exports.getCurrencyReate = getCurrencyReate;

exports.setSellTarget = function setSellTarget(value){
	sellTarget = value;
	return sellTarget;
}

 
