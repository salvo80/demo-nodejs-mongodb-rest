var express = require('express');
var mongodb = require('../db');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  mongodb.getVal(res);
});

/* GET home page. */
router.get('/wallet:key', function(req, res) {
  var request = require('request');
  var key = req.params.key;

  const body = {};
  const apiPath = 'v2/auth/r/wallets';
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


function createRequest(body, apiPath, key){
    const atob = require('atob');
    const crypto = require('crypto');
    var key = process.env.API || key;
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
    console.log('url='+options.url);
    return options;
}