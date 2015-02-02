define do
  * \module
    \intern!tdd
    \intern/chai!assert
    \intern/dojo/node!async
    \intern/dojo/node!../../lib/partner
  , (module, tdd, assert, async,  partner) !->

    tdd.suite module.id, !->

      tdd.before !->
        partner.handle (message, data, response) ->
          switch message
          | \- => response null, data.left - data.right
          | \+ => response null, data.left + data.right
          | \* => response null, data.left * data.right
          | \/ => response null, data.left / data.right
          | _ => response "Not support."
      tdd.after !->
        partner.handle null

      tdd.test "handle with pre-defined message" !->
        partner.handle \- do
          left: 2
          right: 2
        , @async(1000).callback (error, result, message) !->
          assert.equal \- message, "Message must be same."
          assert.isNull error, "Error must be null."
          assert.equal result, 0, "Result must be 0."

      tdd.test "handle with not support message" !->
        partner.handle \^ do
          left: 4
          right: 2
        , @async(1000).callback (error, result, message) !->
          assert.equal \^ message, "Message must be same."
          assert.isNotNull error, "Error must be null."
          assert.isUndefined result, "Result must be undefined."
