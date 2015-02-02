define(['module', 'intern!tdd', 'intern/chai!assert', 'intern/dojo/node!async', 'intern/dojo/node!../../lib/partner'], function(module, tdd, assert, async, partner){
  tdd.suite(module.id, function(){
    tdd.test("start exists child and wait message", function(){
      var defer, x$, callback;
      defer = this.async(2000);
      x$ = partner.create("file://test/master-to-child/child.js");
      callback = function(message, data){
        defer.resolve();
        assert.equal(message, 'start', "Should get greating.");
        assert.equal(data, 'Hello', "Get echo from child.");
        this.removeListener('message', callback);
        return this.exit();
      };
      x$.on('message', callback);
      x$.start('Hello');
    });
    tdd.test("start exists child and wait message when stop", function(){
      var defer, x$, callback;
      defer = this.async(2000);
      x$ = partner.create("file://test/master-to-child/child.js");
      callback = function(message, data){
        if (message === 'start') {
          return x$.stop('Bye');
        }
        assert.equal(message, 'stop', "Should get stop.");
        assert.equal(data, 'Bye', "Get echo from child.");
        this.removeListener('message', callback);
        this.exit();
        defer.resolve();
      };
      x$.on('message', callback);
      x$.start('Hello');
    });
    tdd.test("start exists child and send message", function(){
      var defer, x$, callback;
      defer = this.async(2000);
      x$ = partner.create("file://test/master-to-child/child.js");
      callback = function(message, data){
        assert.equal(message, 'greating', "Should get message.");
        assert.equal(data, 'hello', "Should get hello.");
        this.removeListener('message', callback);
        this.exit();
        defer.resolve();
      };
      x$.on('message', callback);
      x$.start(function(){
        this.send('greating', 'hello');
      });
    });
  });
});
