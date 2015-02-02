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
              ..request \request do
                strategy: \random
                alias: \left
                message: \+
                data:
                  left: 1
                  right: 2
              , (error, data, message) !->
                assert.equal data.data.data, 3 "Should same content"
                assert.equal data.message, \+ "Should same message"
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
              ..request \request do
                strategy: \first
                alias: "file://test/child-to-child/left-child.js"
                message: \-
                data:
                  left: 10
                  right: 2
              , (error, data, message) !->
                assert.equal data.data.data, 8 "Should same content"
                assert.equal data.message, \- "Should same message"
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
              ..request \request do
                strategy: \last
                alias: "file://test/child-to-child/left-child.js"
                message: \*
                data:
                  left: 10
                  right: 2
              , (error, data, message) !->
                assert.equal data.data.data, 20 "Should same content"
                assert.equal data.message, \* "Should same message"
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
              ..request \request do
                strategy: 5
                alias: \left
                message: \/
                data:
                  left: 100
                  right: 20
              , (error, data, message) !->
                assert.equal data.data.data, 5 "Should same content"
                assert.equal data.message, \/ "Should same message"
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
              ..request \request do
                strategy: \next
                alias: \left
                message: \/
                data:
                  left: 100
                  right: 20
              , (error, data, message) !->
                current_index = data.data.index
                assert.equal data.data.data, 5 "Should same content"
                assert.equal data.message, \/ "Should same message"
                ..request \request do
                  strategy: \next
                  alias: \left
                  message: \+
                  data:
                    left: data.data.data
                    right: 5
                , (error, data, message) !->
                  assert.equal data.data.index, (current_index + 1) % 10, "Should equal next index"
                  assert.equal data.data.data, 10 "Should same content"
                  assert.equal data.message, \+ "Should same message"
                  current_index := data.data.index
                  ..request \request do
                    strategy: \next
                    alias: \left
                    message: \*
                    data:
                      left: data.data.data
                      right: 10
                  , (error, data, message) !->
                    assert.equal data.data.index, (current_index + 1) % 10, "Should equal next index"
                    assert.equal data.data.data, 100 "Should same content"
                    assert.equal data.message, \* "Should same message"
                    @exit!
                    async.each children, (item, callback) !->
                      item.exit!
                      callback!
                    , !-> defer.resolve!
