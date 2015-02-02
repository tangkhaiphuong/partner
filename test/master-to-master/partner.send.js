define(['module', 'intern!tdd', 'intern/chai!assert', 'intern/dojo/node!async', 'intern/dojo/node!../../lib/partner'], function(module, tdd, assert, async, partner){
  tdd.suite(module.id, function(){
    tdd.test("send string message", function(){
      var message_arg, defer, callback;
      message_arg = 'message-value';
      defer = this.async(1000);
      partner.on('message', callback = defer.callback(function(data){
        var count;
        assert.equal(data, message_arg, "Argument is pass from message");
        partner.removeListener('message', callback);
        count = partner.listeners('message');
        assert.equal(count, 0, "Message event must empty.");
      }));
      partner.send(message_arg);
    });
    tdd.test("send object message", function(){
      var message_arg, defer, callback;
      message_arg = {
        name: 'partner',
        age: 0
      };
      defer = this.async(1000);
      partner.on('message', callback = defer.callback(function(data){
        var count;
        assert.equal(data.name, message_arg.name, "Argument is pass from message");
        assert.equal(data.age, message_arg.age, "Argument is pass from message");
        partner.removeListener('message', callback);
        count = partner.listeners('message');
        assert.equal(count, 0, "Message event must empty.");
      }));
      partner.send(message_arg);
    });
    tdd.test("send null message", function(){
      var defer, callback;
      defer = this.async(1000);
      partner.on('message', callback = defer.callback(function(data){
        var count;
        assert.isNull(data, "Message is null.");
        partner.removeListener('message', callback);
        count = partner.listeners('message');
        assert.equal(count, 0, "Message event must empty.");
      }));
      partner.send(null);
    });
    tdd.test("send undefined message", function(){
      var defer, callback;
      defer = this.async(1000);
      partner.on('message', callback = defer.callback(function(data){
        var count;
        assert.isUndefined(data, "Message is null.");
        partner.removeListener('message', callback);
        count = partner.listeners('message');
        assert.equal(count, 0, "Message event must empty.");
      }));
      partner.send();
    });
  });
});
