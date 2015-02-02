define(['module', 'intern!tdd', 'intern/chai!assert', 'intern/dojo/node!async', 'intern/dojo/node!../../lib/partner'], function(module, tdd, assert, async, partner){
  tdd.suite(module.id, function(){
    tdd.test("select any child by alias/random then send message", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/child-to-child/left-child.js", 'left');
        x$.start(function(){
          this.request('index', item);
          callback();
        });
        children.push(x$);
      }, function(error){
        var x$;
        x$ = partner.create("file://test/child-to-child/right-child.js");
        x$.start(function(error){
          x$.request('send', {
            strategy: 'random',
            alias: 'left',
            message: 'greating',
            data: 'hello'
          }, function(error, data, message){
            assert.equal(data.data.data, 'hello', "Should same content");
            assert.equal(data.message, 'greating', "Should same message");
            this.exit();
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
    tdd.test("select any child by alias/first then send message", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/child-to-child/left-child.js", 'left');
        x$.start(function(){
          this.request('index', item);
          callback();
        });
        children.push(x$);
      }, function(error){
        var x$;
        x$ = partner.create("file://test/child-to-child/right-child.js");
        x$.start(function(error){
          x$.request('send', {
            strategy: 'first',
            alias: "file://test/child-to-child/left-child.js",
            message: 'greating',
            data: 'hello'
          }, function(error, data, message){
            assert.equal(data.data.index, 1, "Should from first child");
            assert.equal(data.data.data, 'hello', "Should same content");
            assert.equal(data.message, 'greating', "Should same message");
            this.exit();
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
    tdd.test("select any child by alias/last then send message", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/child-to-child/left-child.js");
        x$.start(function(){
          this.request('index', item);
          callback();
        });
        children.push(x$);
      }, function(error){
        var x$;
        x$ = partner.create("file://test/child-to-child/right-child.js");
        x$.start(function(error){
          x$.request('send', {
            strategy: 'last',
            alias: "file://test/child-to-child/left-child.js",
            message: 'greating',
            data: 'hello'
          }, function(error, data, message){
            assert.equal(data.data.index, 10, "Should from last child");
            assert.equal(data.data.data, 'hello', "Should same content");
            assert.equal(data.message, 'greating', "Should same message");
            this.exit();
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
    tdd.test("select any child by alias/index then send message", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/child-to-child/left-child.js", 'left');
        x$.start(function(){
          this.request('index', item);
          callback();
        });
        children.push(x$);
      }, function(error){
        var x$;
        x$ = partner.create("file://test/child-to-child/right-child.js");
        x$.start(function(error){
          x$.request('send', {
            strategy: 5,
            alias: 'left',
            message: 'greating',
            data: 'hello'
          }, function(error, data, message){
            assert.equal(data.data.index, 6, "Should from index child");
            assert.equal(data.data.data, 'hello', "Should same content");
            assert.equal(data.message, 'greating', "Should same message");
            this.exit();
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
    tdd.test("select any child by alias/next then request handle", function(){
      var children, defer;
      children = [];
      defer = this.async(2000);
      async.each([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(item, callback){
        var x$;
        x$ = partner.create("file://test/child-to-child/left-child.js", 'left');
        x$.start(function(){
          this.request('index', item);
          callback();
        });
        children.push(x$);
      }, function(error){
        var x$;
        x$ = partner.create("file://test/child-to-child/right-child.js");
        x$.start(function(error){
          x$.request('send', {
            strategy: 'next',
            alias: 'left',
            message: 'greating',
            data: 'hello'
          }, function(error, data, message){
            var current_index;
            current_index = data.data.index;
            assert.equal(data.data.data, 'hello', "Should same content");
            assert.equal(data.message, 'greating', "Should same message");
            x$.request('send', {
              strategy: 'next',
              alias: 'left',
              message: 'greating',
              data: 'hello'
            }, function(error, data, message){
              assert.equal(data.data.index, (current_index + 1) % 10, "Should equal next index");
              assert.equal(data.data.data, 'hello', "Should same content");
              assert.equal(data.message, 'greating', "Should same message");
              current_index = data.data.index;
              x$.request('send', {
                strategy: 'next',
                alias: 'left',
                message: 'greating',
                data: 'hello'
              }, function(error, data, message){
                assert.equal(data.data.index, (current_index + 1) % 10, "Should equal next index");
                assert.equal(data.data.data, 'hello', "Should same content");
                assert.equal(data.message, 'greating', "Should same message");
                this.exit();
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
});
