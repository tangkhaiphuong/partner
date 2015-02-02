var partner;
partner = require('../../lib/partner');
partner.on('start', function(data, master, done){
  done();
  if (data != null) {
    partner.send('start', data);
  }
});
partner.on('stop', function(data, master, done){
  done();
  if (data != null) {
    partner.send('stop', data);
  }
});
partner.on('message', function(message, data){
  partner.send(message, data);
});
partner.handle(function(message, data, response){
  switch (message) {
  case '-':
    response(null, data.left - data.right);
    break;
  case '+':
    response(null, data.left + data.right);
    break;
  case '*':
    response(null, data.left * data.right);
    break;
  case '/':
    response(null, data.left / data.right);
    break;
  case 'die':
    response();
    process.exit();
    break;
  default:
    response("Not support.");
  }
});
partner.start();
