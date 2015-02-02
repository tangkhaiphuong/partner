var partner, lefts, i$, ref$, len$, i, right;
partner = require('../../lib/partner');
lefts = [];
for (i$ = 0, len$ = (ref$ = [1, 2, 3, 4, 5]).length; i$ < len$; ++i$) {
  i = ref$[i$];
  lefts.push(partner.create("file://" + __dirname + "/left.js", 'left'));
}
right = partner.create("file://" + __dirname + "/right.js", 'right');
partner.on('start', function(data, master){
  var i$, ref$, len$, index, item, strategies, strategy, request, i;
  for (i$ = 0, len$ = (ref$ = lefts).length; i$ < len$; ++i$) {
    index = i$;
    item = ref$[i$];
    item.start(index);
  }
  right.start();
  return;
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
  request = partner.select('left', strategy.name);
  for (i$ = 0, len$ = (ref$ = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).length; i$ < len$; ++i$) {
    i = ref$[i$];
    request.request('Multiple', {
      first: 100,
      second: 2
    }, fn$);
  }
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
partner.start();
