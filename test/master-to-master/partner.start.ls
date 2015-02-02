define do
  * \module
    \intern!tdd
    \intern/chai!assert
    \intern/dojo/node!async
    \intern/dojo/node!../../lib/partner
  , (module, tdd, assert, async,  partner) !->

    tdd.suite module.id, !->

      tdd.test "start without register event" !->
        partner.start @async(1000).callback (error) !->
          assert.equal error.message, "Master doesn\'t listen start event.", "Expect error here."

      tdd.test "start without callback" !->
        start_arg = \start-value
        defer = @async 1000

        partner.on \start callback = defer.callback (data, master, done) !->
          assert.isTrue master, "Invoke from it."
          assert.equal data, start_arg, "Argument is pass from start"

          partner.removeListener \start callback
          count = partner.listeners \start
          assert.equal count, 0, "Start event must empty."
        partner.start start_arg

      tdd.test "start with callback" !->
        done_value = null
        defer = @async 1000

        partner.on \start callback = (data, master, done) !->
          partner.removeListener \start callback
          done_value := \done-value
          done!

        partner.start defer.callback !->
          assert.equal done_value, \done-value "Argument is pass from done."

      tdd.test "start with multiple callback" !->
        done_value = 0

        partner.on \start callback1 = (data, master, done) !->
          partner.removeListener \start callback1
          done_value += 1
          done!

        partner.on \start callback2 = (data, master, done) !->
          partner.removeListener \start callback2
          done_value += 2
          done!

        partner.on \start callback3 = (data, master, done) !->
          partner.removeListener \start callback3
          done_value += 3
          done!

        partner.start !-> assert.equal done_value, 6 "Argument is pass from done."