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
          x$.request('request', {
            strategy: 'random',
            alias: 'left',
            message: '+',
            data: {
              left: 1,
              right: 2
            }
          }, function(error, data, message){
            assert.equal(data.data.data, 3, "Should same content");
            assert.equal(data.message, '+', "Should same message");
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
          x$.request('request', {
            strategy: 'first',
            alias: "file://test/child-to-child/left-child.js",
            message: '-',
            data: {
              left: 10,
              right: 2
            }
          }, function(error, data, message){
            assert.equal(data.data.data, 8, "Should same content");
            assert.equal(data.message, '-', "Should same message");
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
          x$.request('request', {
            strategy: 'last',
            alias: "file://test/child-to-child/left-child.js",
            message: '*',
            data: {
              left: 10,
              right: 2
            }
          }, function(error, data, message){
            assert.equal(data.data.data, 20, "Should same content");
            assert.equal(data.message, '*', "Should same message");
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
          x$.request('request', {
            strategy: 5,
            alias: 'left',
            message: '/',
            data: {
              left: 100,
              right: 20
            }
          }, function(error, data, message){
            assert.equal(data.data.data, 5, "Should same content");
            assert.equal(data.message, '/', "Should same message");
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
          x$.request('request', {
            strategy: 'next',
            alias: 'left',
            message: '/',
            data: {
              left: 100,
              right: 20
            }
          }, function(error, data, message){
            var current_index;
            current_index = data.data.index;
            assert.equal(data.data.data, 5, "Should same content");
            assert.equal(data.message, '/', "Should same message");
            x$.request('request', {
              strategy: 'next',
              alias: 'left',
              message: '+',
              data: {
                left: data.data.data,
                right: 5
              }
            }, function(error, data, message){
              assert.equal(data.data.index, (current_index + 1) % 10, "Should equal next index");
              assert.equal(data.data.data, 10, "Should same content");
              assert.equal(data.message, '+', "Should same message");
              current_index = data.data.index;
              x$.request('request', {
                strategy: 'next',
                alias: 'left',
                message: '*',
                data: {
                  left: data.data.data,
                  right: 10
                }
              }, function(error, data, message){
                assert.equal(data.data.index, (current_index + 1) % 10, "Should equal next index");
                assert.equal(data.data.data, 100, "Should same content");
                assert.equal(data.message, '*', "Should same message");
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
