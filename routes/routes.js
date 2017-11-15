var express = require('express');
var mongodb = require('../db');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    mongodb.getVal(res);
});

/* GET wallet */
router.get('/wallet', function(req, res) {
    var request = require('request');
    var q = require('q');

  
    
    var bitfinexD = q.defer();
    getBitfinex().wallet_balances((err, res) => {
        if (err) console.log(err)
        console.log('res='+res);
        bitfinexD.resolve(res);
    });
    
  
   
    var bittrexD = q.defer();
    getBittrex().getbalances( function( data, err ) {
      if (err) {
        return console.error(err);
      }
      bittrexD.resolve(data);
     
    });
    
    q.spread([bitfinexD.promise, bittrexD.promise], function(bitfinex,bittrex){
        console.log('bittrex='+bittrex);
        
        var ret = [];
        for(var i in bitfinex){
            console.log('i='+i);
            var bb = bitfinex[i];
            var amount = parseFloat(bb["amount"]);
            if(amount>0)
                ret.push(['bitfinex',bb["currency"],amount]);
        }
        for(var i in bittrex['result']){
            console.log('bittrex i='+i);
            var bb = bittrex['result'][i];
            const balance = bb["Balance"];
            if(balance>0)
                ret.push(['bittrex',bb["Currency"],balance]);
        }
        res.send(ret);
        
    },function(error){console.error(error);});
});

/* GET active orders */
router.get('/orders', function(req, res) {
    var request = require('request');
    var key = req.params.key;

    const body = {};
    const apiPath = 'v2/auth/r/orders';
    const toSend = createRequest(body, apiPath, key);
    request.post(toSend,
        function(error, response, body){
            console.log('error='+error);
            console.log('body='+body);
            console.log('response='+response);
            res.send(body);
        }
    );
});

router.post('/values', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var val = req.body.value;

    if (val === undefined || val === "") {
        res.send(JSON.stringify({status: "error", value: "Value undefined"}));
        return
    }
    mongodb.sendVal(val, res);
});

router.delete('/values/:id', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    var uuid = req.params.id;

    if (uuid === undefined || uuid === "") {
        res.send(JSON.stringify({status: "error", value: "UUID undefined"}));
        return
    }
    mongodb.delVal(uuid);
    res.send(JSON.stringify({status: "ok", value: uuid}));
});

module.exports = router;

function getBittrex(){
    const atob = require('atob');
 
    var key = process.env.API2;
    key = atob('OWJhOTU3Nz'+key).split(',');

    const apiKey = key[0];
    const apiSecret = key[1];

    
    var bittrex = require('node-bittrex-api');
    bittrex.options({
      'apikey' : apiKey,
      'apisecret' : apiSecret,
    });
    return bittrex;
    
}

function getBitfinex(){
    const atob = require('atob');
    const key = atob('U2JKZWlXM2' + process.env.API).split(',');

    const apiKey = key[0];
    const apiSecret = key[1];
    
    const BFX = require('bitfinex-api-node')
    return new BFX(apiKey, apiSecret, {version: 1}).rest
    
}
function createRequest(body, apiPath){
    const atob = require('atob');
    const crypto = require('crypto');
    var key = process.env.API;
    key = atob('U2JKZWlXM2'+key).split(',');

    const apiKey = key[0];
    const apiSecret = key[1];

    const nonce = Date.now().toString();
    const rawBody = JSON.stringify(body)
    let signature = `/api/${apiPath}${nonce}${rawBody}`;

    signature = crypto
        .createHmac('sha384', apiSecret)
        .update(signature)
        .digest('hex')

    const options = {
        url: `https://api.bitfinex.com/${apiPath}`,
        headers: {
            'bfx-nonce': nonce,
            'bfx-apikey': apiKey,
            'bfx-signature': signature
        },
        body: body,
        json: true
    }
    return options;
}