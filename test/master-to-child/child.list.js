define(['module', 'intern!tdd', 'intern/chai!assert', 'intern/dojo/node!async', 'intern/dojo/node!../../lib/partner'], function(module, tdd, assert, async, partner){
  tdd.suite(module.id, function(){
    tdd.test("list all chilren", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/master-to-child/child.js", 'child');
        x$.start(function(){
          children.push(x$);
          callback();
        });
      }, function(error){
        assert.equal(partner.list().length, children.length, "Number of process should equal");
        children.splice(6, 1)[0].exit();
        assert.equal(partner.list().length, children.length, "Number of process should equal");
        children.splice(5, 1)[0].exit();
        assert.equal(partner.list().length, children.length, "Number of process should equal");
        console.log(children.length);
        async.each(children, function(item, callback){
          item.exit();
          callback();
        }, function(){
          defer.resolve();
        });
      });
    });
  });
});
