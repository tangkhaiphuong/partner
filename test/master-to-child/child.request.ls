define do
  * \module
    \intern!tdd
    \intern/chai!assert
    \intern/dojo/node!async
    \intern/dojo/node!../../lib/partner
  , (module, tdd, assert, async,  partner) !->

    tdd.suite module.id, !->

      tdd.test "start child and request handle" !->
        defer = @async 2000
        partner.create "file://test/master-to-child/child.js"
          ..start !~>
            ..request \- do
              left: 2
              right: 2
            , (error, result, message) !->
              assert.equal \- message, "Message must be same."
              assert.isNull error, "Error must be null."
              assert.equal result, 0, "Result must be 0."
              ..exit!
              defer.resolve!

      tdd.test "start child and request handle not support" !->
        defer = @async 2000
        partner.create "file://test/master-to-child/child.js"
          ..start !~>
            ..request \% do
              left: 4
              right: 2
            , (error, result, message) !->
              assert.equal \% message, "Message must be same."
              assert.isNotNull error, "Error must be null."
              assert.isUndefined result, "Result must be undefined."
              ..exit!
              defer.resolve!
