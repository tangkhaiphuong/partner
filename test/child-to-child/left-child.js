var partner, index;
partner = require('../../lib/partner');
index = null;
partner.on('start', function(data, master, done){
  done();
});
partner.on('stop', function(data, master, done){
  done();
});
partner.on('message', function(message, data){
  partner.send(message, {
    data: data,
    index: index
  });
});
partner.handle(function(message, data, response){
  switch (message) {
  case '-':
    response(null, {
      data: data.left - data.right,
      index: index
    });
    break;
  case '+':
    response(null, {
      data: data.left + data.right,
      index: index
    });
    break;
  case '*':
    response(null, {
      data: data.left * data.right,
      index: index
    });
    break;
  case '/':
    response(null, {
      data: data.left / data.right,
      index: index
    });
    break;
  case 'die':
    process.exit();
    break;
  case 'index':
    index = data;
    break;
  case 'start-tick':
    this.timer = setInterval(function(){
      partner.send('tick', new Date());
    }, data);
    break;
  case 'stop-stick':
    clearInterval(this.timer);
    break;
  default:
    response("Not support.");
  }
});
partner.start();
