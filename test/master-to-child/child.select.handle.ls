define do
  * \module
    \intern!tdd
    \intern/chai!assert
    \intern/dojo/node!async
    \intern/dojo/node!../../lib/partner
  , (module, tdd, assert, async,  partner) !->

    tdd.suite module.id, !->

      tdd.test "select any child by alias/random then request handle" !->
        children = []
        defer = @async 2000
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/master-to-child/child.js" \child
            ..start callback!
            children.push ..
        , (error) !-> partner.select \child \random .request \+ do
          left: 2
          right: 2
        , (error, data, message) !->
            assert.equal message, \+ "Should get greating."
            assert.equal data, 4 "Get echo from child."
            async.each children, (item, callback) !->
              item.exit!
              callback!
            , !-> defer.resolve!

      tdd.test "select any child by alias/first then request handle" !->
        children = []
        defer = @async 2000
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/master-to-child/child.js" \child
            ..start callback
            ..index = item
            children.push ..
        , (error) !-> partner.select "file://test/master-to-child/child.js" \first .request \* do
          left: 2
          right: 3
        , (error, data, message) !->
            assert.equal @index, 1 "Should first child."
            assert.equal message, \* "Should get greating."
            assert.equal data, 6 "Get echo from child."
            async.each children, (item, callback) !->
              item.exit!
              callback!
            , !-> defer.resolve!

      tdd.test "select any child by alias/last then request handle" !->
        children = []
        defer = @async 2000
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/master-to-child/child.js" \child
            ..start callback
            ..index = item
            children.push ..
        , (error) !-> partner.select \child \last .request \/ do
          left: 20
          right: 4
        , (error, data, message) !->
          assert.equal @index, 10 "Should last child."
          assert.equal message, \/ "Should get greating."
          assert.equal data, 5 "Get echo from child."
          async.each children, (item, callback) !->
            item.exit!
            callback!
          , !-> defer.resolve!

      tdd.test "select any child by alias/index then request handle" !->
        children = []
        defer = @async 2000
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/master-to-child/child.js" \child
            ..start callback
            ..index = item
            children.push ..
        , (error) !-> partner.select \child 3 .request \- do
          left: 100
          right: 40
        , (error, data, message) !->
          assert.equal @index, 4 "Should index child."
          assert.equal message, \- "Should get greating."
          assert.equal data, 60 "Get echo from child."
          async.each children, (item, callback) !->
            item.exit!
            callback!
          , !-> defer.resolve!

      tdd.test "select any child by alias/next then request handle" !->
        children = []
        defer = @async 2000
        next = null
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/master-to-child/child.js" \child
            ..start callback
            ..index = item
            children.push ..
        , (error) !-> partner.select \child \next .request \+ do
            left: 100
            right: 40
        , (error, data, message) !->
          assert.equal message, \+ "Should get greating."
          assert.equal data, 140 "Get echo from child."
          next := @index
          partner.select \child \next .request \+ do
            left: data
            right: 60
          , (error, data, message) !->
            assert.equal (next + 1) % 10, @index, "Should next item."
            assert.equal message, \+ "Should get greating."
            assert.equal data, 200 "Get echo from child."
            next := @index
            partner.select \child \next .request \/ do
              left: data
              right: 4
            , (error, data, message) !->
              assert.equal (next + 1) % 10, @index, "Should next item."
              assert.equal message, \/ "Should get greating."
              assert.equal data, 50 "Get echo from child."
              async.each children, (item, callback) !->
                item.exit!
                callback!
              , !-> defer.resolve!
