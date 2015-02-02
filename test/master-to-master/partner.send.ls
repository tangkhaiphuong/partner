define do
  * \module
    \intern!tdd
    \intern/chai!assert
    \intern/dojo/node!async
    \intern/dojo/node!../../lib/partner
  , (module, tdd, assert, async,  partner) !->

    tdd.suite module.id, !->

      tdd.test "send string message" !->
        message_arg = \message-value
        defer = @async 1000
        partner.on \message callback = defer.callback (data) !->
          assert.equal data, message_arg, "Argument is pass from message"
          partner.removeListener \message callback
          count = partner.listeners \message
          assert.equal count, 0, "Message event must empty."

        partner.send message_arg

      tdd.test "send object message" !->
        message_arg =
          name: \partner
          age: 0
        defer = @async 1000

        partner.on \message callback = defer.callback (data) !->
          assert.equal data.name, message_arg.name, "Argument is pass from message"
          assert.equal data.age, message_arg.age, "Argument is pass from message"
          partner.removeListener \message callback
          count = partner.listeners \message
          assert.equal count, 0, "Message event must empty."

        partner.send message_arg

      tdd.test "send null message" !->
        defer = @async 1000

        partner.on \message callback = defer.callback (data) !->
          assert.isNull data, "Message is null."
          partner.removeListener \message callback
          count = partner.listeners \message
          assert.equal count, 0, "Message event must empty."

        partner.send null

      tdd.test "send undefined message" !->
        defer = @async 1000

        partner.on \message callback = defer.callback (data) !->
          assert.isUndefined data, "Message is null."
          partner.removeListener \message callback
          count = partner.listeners \message
          assert.equal count, 0, "Message event must empty."

        partner.send!