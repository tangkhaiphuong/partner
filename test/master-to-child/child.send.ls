define do
  * \module
    \intern!tdd
    \intern/chai!assert
    \intern/dojo/node!async
    \intern/dojo/node!../../lib/partner
  , (module, tdd, assert, async,  partner) !->

    tdd.suite module.id, !->

      tdd.test "start exists child and wait message" !->
        defer = @async 2000
        partner.create "file://test/master-to-child/child.js"
          callback = (message, data) ->
            defer.resolve!
            assert.equal message, \start "Should get greating."
            assert.equal data, \Hello "Get echo from child."
            @removeListener \message callback
            @exit!
          ..on \message callback
          ..start \Hello

      tdd.test "start exists child and wait message when stop" !->
        defer = @async 2000
        partner.create "file://test/master-to-child/child.js"
          callback = (message, data) !->
            return ..stop \Bye if message is \start
            assert.equal message, \stop "Should get stop."
            assert.equal data, \Bye "Get echo from child."
            @removeListener \message callback
            @exit!
            defer.resolve!
          ..on \message callback
          ..start \Hello

      tdd.test "start exists child and send message" !->
        defer = @async 2000
        partner.create "file://test/master-to-child/child.js"
          callback = (message, data) !->
            assert.equal message, \greating "Should get message."
            assert.equal data, \hello "Should get hello."
            @removeListener \message callback
            @exit!
            defer.resolve!
          ..on \message callback
          ..start !-> @send \greating \hello