define do
  * \module
    \intern!tdd
    \intern/chai!assert
    \intern/dojo/node!async
    \intern/dojo/node!../../lib/partner
  , (module, tdd, assert, async,  partner) !->

    tdd.suite module.id, !->

      tdd.test "start child and handle exit" !->
        defer = null
        defer = @async 2000
        partner.create "file://test/master-to-child/child.js"
          ..start \Hello !~>
            ..on \exit (errors, data) !->
              defer.resolve!
            ..request \die
