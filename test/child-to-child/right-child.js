var partner, register;
partner = require('../../lib/partner');
partner.on('start', function(data, master, done){
  done();
});
partner.on('stop', function(data, master, done){
  done();
});
register = function(message, data){
  partner.send(message, data);
};
partner.handle(function(message, data, response){
  var x$, callback;
  switch (message) {
  case 'send':
    x$ = partner['with'](data.alias, data.strategy);
    callback = function(message, data){
      response(null, {
        message: message,
        data: data
      });
      x$.unRegister(callback);
    };
    x$.register(callback);
    x$.send(data.message, data.data);
    break;
  case 'request':
    partner['with'](data.alias, data.strategy).request(data.message, data.data, function(error, data_, message){
      response(error, {
        message: data.message,
        data: data_
      });
    });
    break;
  case 'register':
    partner['with']('left', strategy).register(register);
    break;
  case 'unregister':
    partner['with']('left', strategy).register(register);
  }
});
partner.start();
