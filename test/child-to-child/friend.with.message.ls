define do
  * \module
    \intern!tdd
    \intern/chai!assert
    \intern/dojo/node!async
    \intern/dojo/node!../../lib/partner
  , (module, tdd, assert, async,  partner) !->

    tdd.suite module.id, !->

      tdd.test "select any child by alias/random then send message" !->
        children = []
        defer = @async 2000
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/child-to-child/left-child.js" \left
            ..start !->
              @request \index item
              callback!
            children.push ..
        , (error) !->
           partner.create "file://test/child-to-child/right-child.js"
            ..start (error) !->
              ..request \send do
                strategy: \random
                alias: \left
                message: \greating
                data: \hello
              , (error, data, message) !->
                assert.equal data.data.data, \hello "Should same content"
                assert.equal data.message, \greating "Should same message"
                @exit!
                async.each children, (item, callback) !->
                  item.exit!
                  callback!
                , !-> defer.resolve!

      tdd.test "select any child by alias/first then send message" !->
        children = []
        defer = @async 2000
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/child-to-child/left-child.js" \left
            ..start !->
              @request \index item
              callback!
            children.push ..
        , (error) !->
           partner.create "file://test/child-to-child/right-child.js"
            ..start (error) !->
              ..request \send do
                strategy: \first
                alias: "file://test/child-to-child/left-child.js"
                message: \greating
                data: \hello
              , (error, data, message) !->
                assert.equal data.data.index, 1 "Should from first child"
                assert.equal data.data.data, \hello "Should same content"
                assert.equal data.message, \greating "Should same message"
                @exit!
                async.each children, (item, callback) !->
                  item.exit!
                  callback!
                , !-> defer.resolve!

      tdd.test "select any child by alias/last then send message" !->
        children = []
        defer = @async 2000
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/child-to-child/left-child.js"
            ..start !->
              @request \index item
              callback!
            children.push ..
        , (error) !->
           partner.create "file://test/child-to-child/right-child.js"
            ..start (error) !->
              ..request \send do
                strategy: \last
                alias: "file://test/child-to-child/left-child.js"
                message: \greating
                data: \hello
              , (error, data, message) !->
                assert.equal data.data.index, 10 "Should from last child"
                assert.equal data.data.data, \hello "Should same content"
                assert.equal data.message, \greating "Should same message"
                @exit!
                async.each children, (item, callback) !->
                  item.exit!
                  callback!
                , !-> defer.resolve!

      tdd.test "select any child by alias/index then send message" !->
        children = []
        defer = @async 2000
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/child-to-child/left-child.js" \left
            ..start !->
              @request \index item
              callback!
            children.push ..
        , (error) !->
           partner.create "file://test/child-to-child/right-child.js"
            ..start (error) !->
              ..request \send do
                strategy: 5
                alias: \left
                message: \greating
                data: \hello
              , (error, data, message) !->
                assert.equal data.data.index, 6 "Should from index child"
                assert.equal data.data.data, \hello "Should same content"
                assert.equal data.message, \greating "Should same message"
                @exit!
                async.each children, (item, callback) !->
                  item.exit!
                  callback!
                , !-> defer.resolve!

      tdd.test "select any child by alias/next then request handle" !->
        children = []
        defer = @async 2000
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/child-to-child/left-child.js" \left
            ..start !->
              @request \index item
              callback!
            children.push ..
        , (error) !->
           partner.create "file://test/child-to-child/right-child.js"
            ..start (error) !->
              ..request \send do
                strategy: \next
                alias: \left
                message: \greating
                data: \hello
              , (error, data, message) !->
                current_index = data.data.index
                assert.equal data.data.data, \hello "Should same content"
                assert.equal data.message, \greating "Should same message"
                ..request \send do
                  strategy: \next
                  alias: \left
                  message: \greating
                  data: \hello
                , (error, data, message) !->
                  assert.equal data.data.index, (current_index + 1) % 10, "Should equal next index"
                  assert.equal data.data.data, \hello "Should same content"
                  assert.equal data.message, \greating "Should same message"
                  current_index := data.data.index
                  ..request \send do
                    strategy: \next
                    alias: \left
                    message: \greating
                    data: \hello
                  , (error, data, message) !->
                    assert.equal data.data.index, (current_index + 1) % 10, "Should equal next index"
                    assert.equal data.data.data, \hello "Should same content"
                    assert.equal data.message, \greating "Should same message"
                    @exit!
                    async.each children, (item, callback) !->
                      item.exit!
                      callback!
                    , !-> defer.resolve!
