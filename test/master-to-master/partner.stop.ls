define do
  * \module
    \intern!tdd
    \intern/chai!assert
    \intern/dojo/node!async
    \intern/dojo/node!../../lib/partner
  , (module, tdd, assert, async,  partner) !->

    tdd.suite module.id, !->

      tdd.test "stop without register event" !->
        partner.stop @async(1000).callback (error) !->
          assert.equal error.message, "Master doesn\'t listen stop event.", "Expect error here."

      tdd.test "stop without callback" !->
        stop_arg = \stop-value
        defer = @async 1000

        partner.on \stop callback = defer.callback (data, master, done) !->
          assert.isTrue master, "Invoke from it."
          assert.equal data, stop_arg, "Argument is pass from stop"

          partner.removeListener \stop callback
          count = partner.listeners \stop
          assert.equal count, 0, "Start event must empty."
        partner.stop stop_arg


      tdd.test "stop with callback" !->
        done_value = null
        defer = @async 1000

        partner.on \stop callback = (data, master, done) !->
          partner.removeListener \stop callback
          done_value := \done-value
          done!

        partner.stop defer.callback !->
          assert.equal done_value, \done-value "Argument is pass from done."

      tdd.test "stop with multiple callback" !->
        done_value = 0

        partner.on \stop callback1 = (data, master, done) !->
          partner.removeListener \stop callback1
          done_value += 1
          done!

        partner.on \stop callback2 = (data, master, done) !->
          partner.removeListener \stop callback2
          done_value += 2
          done!

        partner.on \stop callback3 = (data, master, done) !->
          partner.removeListener \stop callback3
          done_value += 3
          done!

        partner.stop !-> assert.equal done_value, 6 "Argument is pass from done."