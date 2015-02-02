define do
  * \module
    \intern!tdd
    \intern/chai!assert
    \intern/dojo/node!async
    \intern/dojo/node!../../lib/partner
  , (module, tdd, assert, async,  partner) !->

    tdd.suite module.id, !->

      tdd.test "start not-exists child" !->
        defer = @async 2000
        partner.create "file://test/master-to-child/sfgsdbscsghcsdfsfsdcxsdfsd.js"
          ..start (error) !->
            assert.isNotNull error, "Should error"
            @exit!
            defer.resolve!

      tdd.test "start exists child" !->
        defer = @async 2000
        partner.create "file://test/master-to-child/child.js"
          ..start (error) !->
            assert.isUndefined error, "Should not error"
            @exit!
            defer.resolve!
