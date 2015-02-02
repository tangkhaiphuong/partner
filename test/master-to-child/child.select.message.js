define(['module', 'intern!tdd', 'intern/chai!assert', 'intern/dojo/node!async', 'intern/dojo/node!../../lib/partner'], function(module, tdd, assert, async, partner){
  tdd.suite(module.id, function(){
    tdd.test("select any child by alias/random then send message", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/master-to-child/child.js", 'child');
        x$.on('message', function(message, data){
          assert.equal(message, 'greating', "Should get greating.");
          assert.equal(data, 'hello', "Get echo from child.");
          async.each(children, function(item, callback){
            item.exit();
            callback();
          }, function(){
            defer.resolve();
          });
        });
        x$.start(callback());
        children.push(x$);
      }, function(error){
        partner.select('child', 'random').send('greating', 'hello');
      });
    });
    tdd.test("select any child by alias/first then send message", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/master-to-child/child.js", 'child');
        x$.on('exit', function(){
          console.log("Why invoke me???");
        });
        x$.on('message', function(message, data){
          assert.equal(this.index, 1, "Should first child.");
          assert.equal(message, 'greating', "Should get greating.");
          assert.equal(data, 'hello', "Get echo from child.");
          async.each(children, function(item, callback){
            item.exit();
            callback();
          }, function(){
            defer.resolve();
          });
        });
        x$.start(callback);
        x$.index = item;
        children.push(x$);
      }, function(error){
        partner.select("file://test/master-to-child/child.js", 'first').send('greating', 'hello');
      });
    });
    tdd.test("select any child by alias/last then send message", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/master-to-child/child.js", 'child');
        x$.on('message', function(message, data){
          assert.equal(this.index, 10, "Should last child.");
          assert.equal(message, 'greating', "Should get greating.");
          assert.equal(data, 'hello', "Get echo from child.");
          async.each(children, function(item, callback){
            item.exit();
            callback();
          }, function(){
            defer.resolve();
          });
        });
        x$.start(callback);
        x$.index = item;
        children.push(x$);
      }, function(error){
        partner.select('child', 'last').send('greating', 'hello');
      });
    });
    tdd.test("select any child by alias/index then send message", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/master-to-child/child.js");
        x$.on('message', function(message, data){
          assert.equal(this.index, 4, "Should fourth child.");
          assert.equal(message, 'greating', "Should get greating.");
          assert.equal(data, 'hello', "Get echo from child.");
          async.each(children, function(item, callback){
            item.exit();
            callback();
          }, function(){
            defer.resolve();
          });
        });
        x$.start(callback);
        x$.index = item;
        children.push(x$);
      }, function(error){
        partner.select("file://test/master-to-child/child.js", 3).send('greating', 'hello');
      });
    });
    tdd.test("select any child by alias/next then request handle", function(){
      var children, defer, firstTime, secondTime, next;
      children = [];
      defer = this.async(2000);
      firstTime = true;
      secondTime = true;
      next = null;
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/master-to-child/child.js", 'child');
        x$.on('message', function(message, data){
          assert.equal(message, 'greating', "Should get greating.");
          assert.equal(data, 'hello', "Get echo from child.");
          if (firstTime) {
            next = this.index;
            firstTime = false;
            return partner.select('child', 'next').send('greating', 'hello');
          }
          if (secondTime) {
            assert.equal((next + 1) % 10, this.index, "Should next item.");
            next = this.index;
            secondTime = false;
            return partner.select('child', 'next').send('greating', 'hello');
          }
          assert.equal((next + 1) % 10, this.index, "Should next item.");
          async.each(children, function(item, callback){
            item.exit();
            callback();
          }, function(){
            defer.resolve();
          });
        });
        x$.start(callback);
        x$.index = item;
        children.push(x$);
      }, function(error){
        partner.select('child', 'next').send('greating', 'hello');
      });
    });
  });
});
