var partner;
partner = require('../../lib/partner');
partner.on('start', function(data, master, done){
  var strategies, strategy, request, i$, ref$, len$, i;
  console.log("Right::Start");
  strategies = [
    {
      name: 'first',
      describe: "Request with first strategy"
    }, {
      name: 'last',
      describe: "Request with last strategy"
    }, {
      name: 'random',
      describe: "Request with random strategy"
    }, {
      name: 'next',
      describe: "Request with next strategy"
    }, {
      name: 2,
      describe: "Request with specify index"
    }
  ];
  strategy = strategies[3];
  console.log(strategy.describe);
  request = partner['with']('left', strategy.name);
  for (i$ = 0, len$ = (ref$ = [1, 2, 3, 4, 5]).length; i$ < len$; ++i$) {
    i = ref$[i$];
    request.request('Divide', {
      first: 100,
      second: 2
    }, fn$);
  }
  request.register(function(message, data){
    console.log("Got", message, data);
  });
  done();
  function fn$(error, data, message){
    console.log("------------------------------");
    if (error != null) {
      return console.error("Got error: ", error);
    }
    console.log(JSON.stringify({
      message: message,
      data: data
    }) + "");
  }
});
partner.on('stop', function(data, master, done){
  done();
});
partner.on('message', function(message, data, master){});
partner.start();
