var assert = require('assert') 
var client = require('../client.js')

describe('Array',function(){
  describe('Basic function testing',function(){
    it('setSellTarget(), Set sell Target should return the value that been set',function(){
    	assert.equal(client.setSellTarget(9999),9999)
    })
    it('getCurrencyReate(), Get Data from boc and send email',function(){
    	client.getCurrencyReate(function(err,didEmailSend){
    		assert.equal(didEmailSend,true)
    	})
    })
  })
})