define(['module', 'intern!tdd', 'intern/chai!assert', 'intern/dojo/node!async', 'intern/dojo/node!../../lib/partner'], function(module, tdd, assert, async, partner){
  tdd.suite(module.id, function(){
    tdd.test("stop without register event", function(){
      partner.stop(this.async(1000).callback(function(error){
        assert.equal(error.message, "Master doesn't listen stop event.", "Expect error here.");
      }));
    });
    tdd.test("stop without callback", function(){
      var stop_arg, defer, callback;
      stop_arg = 'stop-value';
      defer = this.async(1000);
      partner.on('stop', callback = defer.callback(function(data, master, done){
        var count;
        assert.isTrue(master, "Invoke from it.");
        assert.equal(data, stop_arg, "Argument is pass from stop");
        partner.removeListener('stop', callback);
        count = partner.listeners('stop');
        assert.equal(count, 0, "Start event must empty.");
      }));
      partner.stop(stop_arg);
    });
    tdd.test("stop with callback", function(){
      var done_value, defer, callback;
      done_value = null;
      defer = this.async(1000);
      partner.on('stop', callback = function(data, master, done){
        partner.removeListener('stop', callback);
        done_value = 'done-value';
        done();
      });
      partner.stop(defer.callback(function(){
        assert.equal(done_value, 'done-value', "Argument is pass from done.");
      }));
    });
    tdd.test("stop with multiple callback", function(){
      var done_value, callback1, callback2, callback3;
      done_value = 0;
      partner.on('stop', callback1 = function(data, master, done){
        partner.removeListener('stop', callback1);
        done_value += 1;
        done();
      });
      partner.on('stop', callback2 = function(data, master, done){
        partner.removeListener('stop', callback2);
        done_value += 2;
        done();
      });
      partner.on('stop', callback3 = function(data, master, done){
        partner.removeListener('stop', callback3);
        done_value += 3;
        done();
      });
      partner.stop(function(){
        assert.equal(done_value, 6, "Argument is pass from done.");
      });
    });
  });
});
