define(['module', 'intern!tdd', 'intern/chai!assert', 'intern/dojo/node!async', 'intern/dojo/node!../../lib/partner'], function(module, tdd, assert, async, partner){
  tdd.suite(module.id, function(){
    tdd.test("select any child by alias/random then request handle", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/master-to-child/child.js", 'child');
        x$.start(callback());
        children.push(x$);
      }, function(error){
        partner.select('child', 'random').request('+', {
          left: 2,
          right: 2
        }, function(error, data, message){
          assert.equal(message, '+', "Should get greating.");
          assert.equal(data, 4, "Get echo from child.");
          async.each(children, function(item, callback){
            item.exit();
            callback();
          }, function(){
            defer.resolve();
          });
        });
      });
    });
    tdd.test("select any child by alias/first then request handle", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/master-to-child/child.js", 'child');
        x$.start(callback);
        x$.index = item;
        children.push(x$);
      }, function(error){
        partner.select("file://test/master-to-child/child.js", 'first').request('*', {
          left: 2,
          right: 3
        }, function(error, data, message){
          assert.equal(this.index, 1, "Should first child.");
          assert.equal(message, '*', "Should get greating.");
          assert.equal(data, 6, "Get echo from child.");
          async.each(children, function(item, callback){
            item.exit();
            callback();
          }, function(){
            defer.resolve();
          });
        });
      });
    });
    tdd.test("select any child by alias/last then request handle", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/master-to-child/child.js", 'child');
        x$.start(callback);
        x$.index = item;
        children.push(x$);
      }, function(error){
        partner.select('child', 'last').request('/', {
          left: 20,
          right: 4
        }, function(error, data, message){
          assert.equal(this.index, 10, "Should last child.");
          assert.equal(message, '/', "Should get greating.");
          assert.equal(data, 5, "Get echo from child.");
          async.each(children, function(item, callback){
            item.exit();
            callback();
          }, function(){
            defer.resolve();
          });
        });
      });
    });
    tdd.test("select any child by alias/index then request handle", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/master-to-child/child.js", 'child');
        x$.start(callback);
        x$.index = item;
        children.push(x$);
      }, function(error){
        partner.select('child', 3).request('-', {
          left: 100,
          right: 40
        }, function(error, data, message){
          assert.equal(this.index, 4, "Should index child.");
          assert.equal(message, '-', "Should get greating.");
          assert.equal(data, 60, "Get echo from child.");
          async.each(children, function(item, callback){
            item.exit();
            callback();
          }, function(){
            defer.resolve();
          });
        });
      });
    });
    tdd.test("select any child by alias/next then request handle", function(){
      var children, defer, next;
      children = [];
      defer = this.async(2000);
      next = null;
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/master-to-child/child.js", 'child');
        x$.start(callback);
        x$.index = item;
        children.push(x$);
      }, function(error){
        partner.select('child', 'next').request('+', {
          left: 100,
          right: 40
        }, function(error, data, message){
          assert.equal(message, '+', "Should get greating.");
          assert.equal(data, 140, "Get echo from child.");
          next = this.index;
          partner.select('child', 'next').request('+', {
            left: data,
            right: 60
          }, function(error, data, message){
            assert.equal((next + 1) % 10, this.index, "Should next item.");
            assert.equal(message, '+', "Should get greating.");
            assert.equal(data, 200, "Get echo from child.");
            next = this.index;
            partner.select('child', 'next').request('/', {
              left: data,
              right: 4
            }, function(error, data, message){
              assert.equal((next + 1) % 10, this.index, "Should next item.");
              assert.equal(message, '/', "Should get greating.");
              assert.equal(data, 50, "Get echo from child.");
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
    });
  });
});
