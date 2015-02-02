var index, partner;
index = null;
partner = require('../../lib/partner');
partner.on('start', function(data, master, done){
  console.log("Left::Start: " + (index = data));
  setInterval(function(){
    partner.send('new.data', new Date());
  }, 2000);
  done();
});
partner.on('stop', function(data, master, done){
  done();
});
partner.on('message', function(message, data, master){
  return console.log("Left::Message: " + index + " " + JSON.stringify({
    message: message,
    data: data
  }));
});
partner.handle(function(message, data, response){
  switch (message) {
  case 'Divide':
    response(null, {
      result: data.first / data.second,
      index: index
    });
    break;
  case 'Multiple':
    response(null, {
      result: data.first * data.second,
      index: index
    });
    break;
  default:
    response("I don't handle it!");
  }
});
partner.start();
