define(['module', 'intern!tdd', 'intern/chai!assert', 'intern/dojo/node!async', 'intern/dojo/node!../../lib/partner'], function(module, tdd, assert, async, partner){
  tdd.suite(module.id, function(){
    tdd.test("stop not-exists child", function(){
      var x$;
      x$ = partner.create("file://test/master-to-child/sfgsdbscsghcsdfsfsdcxsdfsd.js");
      x$.stop(function(){
        assert.isOk(false, "Should error");
        this.exit();
      });
    });
    tdd.test("stop exists child", function(){
      var defer, x$, this$ = this;
      defer = this.async(2000);
      x$ = partner.create("file://test/master-to-child/child.js");
      x$.start(function(){
        x$.stop(function(error){
          assert.isUndefined(error, "Should not error");
          this.exit();
          defer.resolve();
        });
      });
    });
  });
});
