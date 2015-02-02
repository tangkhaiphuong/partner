define do
  * \module
    \intern!tdd
    \intern/chai!assert
    \intern/dojo/node!async
    \intern/dojo/node!../../lib/partner
  , (module, tdd, assert, async,  partner) !->

    tdd.suite module.id, !->

      tdd.test "stop not-exists child" !->
        partner.create "file://test/master-to-child/sfgsdbscsghcsdfsfsdcxsdfsd.js"
          ..stop !->
            assert.isOk false, "Should error"
            @exit!

      tdd.test "stop exists child" !->
        defer = @async 2000
        partner.create "file://test/master-to-child/child.js"
          ..start !~>
            ..stop (error) !->
              assert.isUndefined error, "Should not error"
              @exit!
              defer.resolve!
