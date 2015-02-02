define(['module', 'intern!tdd', 'intern/chai!assert', 'intern/dojo/node!async', 'intern/dojo/node!../../lib/partner'], function(module, tdd, assert, async, partner){
  tdd.suite(module.id, function(){
    tdd.test("start not-exists child", function(){
      var defer, x$;
      defer = this.async(2000);
      x$ = partner.create("file://test/master-to-child/sfgsdbscsghcsdfsfsdcxsdfsd.js");
      x$.start(function(error){
        assert.isNotNull(error, "Should error");
        this.exit();
        defer.resolve();
      });
    });
    tdd.test("start exists child", function(){
      var defer, x$;
      defer = this.async(2000);
      x$ = partner.create("file://test/master-to-child/child.js");
      x$.start(function(error){
        assert.isUndefined(error, "Should not error");
        this.exit();
        defer.resolve();
      });
    });
  });
});
