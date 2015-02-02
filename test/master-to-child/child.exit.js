define(['module', 'intern!tdd', 'intern/chai!assert', 'intern/dojo/node!async', 'intern/dojo/node!../../lib/partner'], function(module, tdd, assert, async, partner){
  tdd.suite(module.id, function(){
    tdd.test("start child and handle exit", function(){
      var defer, x$, this$ = this;
      defer = null;
      defer = this.async(2000);
      x$ = partner.create("file://test/master-to-child/child.js");
      x$.start('Hello', function(){
        x$.on('exit', function(errors, data){
          defer.resolve();
        });
        x$.request('die');
      });
    });
  });
});
