define(['module', 'intern!tdd', 'intern/chai!assert', 'intern/dojo/node!async', 'intern/dojo/node!../../lib/partner'], function(module, tdd, assert, async, partner){
  tdd.suite(module.id, function(){
    tdd.before(function(){
      partner.handle(function(message, data, response){
        switch (message) {
        case '-':
          return response(null, data.left - data.right);
        case '+':
          return response(null, data.left + data.right);
        case '*':
          return response(null, data.left * data.right);
        case '/':
          return response(null, data.left / data.right);
        default:
          return response("Not support.");
        }
      });
    });
    tdd.after(function(){
      partner.handle(null);
    });
    tdd.test("handle with pre-defined message", function(){
      partner.handle('-', {
        left: 2,
        right: 2
      }, this.async(1000).callback(function(error, result, message){
        assert.equal('-', message, "Message must be same.");
        assert.isNull(error, "Error must be null.");
        assert.equal(result, 0, "Result must be 0.");
      }));
    });
    tdd.test("handle with not support message", function(){
      partner.handle('^', {
        left: 4,
        right: 2
      }, this.async(1000).callback(function(error, result, message){
        assert.equal('^', message, "Message must be same.");
        assert.isNotNull(error, "Error must be null.");
        assert.isUndefined(result, "Result must be undefined.");
      }));
    });
  });
});
