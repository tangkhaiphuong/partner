define(['module', 'intern!tdd', 'intern/chai!assert', 'intern/dojo/node!async', 'intern/dojo/node!../../lib/partner'], function(module, tdd, assert, async, partner){
  tdd.suite(module.id, function(){
    tdd.test("start child and request handle", function(){
      var defer, x$, this$ = this;
      defer = this.async(2000);
      x$ = partner.create("file://test/master-to-child/child.js");
      x$.start(function(){
        x$.request('-', {
          left: 2,
          right: 2
        }, function(error, result, message){
          assert.equal('-', message, "Message must be same.");
          assert.isNull(error, "Error must be null.");
          assert.equal(result, 0, "Result must be 0.");
          x$.exit();
          defer.resolve();
        });
      });
    });
    tdd.test("start child and request handle not support", function(){
      var defer, x$, this$ = this;
      defer = this.async(2000);
      x$ = partner.create("file://test/master-to-child/child.js");
      x$.start(function(){
        x$.request('%', {
          left: 4,
          right: 2
        }, function(error, result, message){
          assert.equal('%', message, "Message must be same.");
          assert.isNotNull(error, "Error must be null.");
          assert.isUndefined(result, "Result must be undefined.");
          x$.exit();
          defer.resolve();
        });
      });
    });
  });
});
