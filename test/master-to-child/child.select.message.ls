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
          partner.create "file://test/master-to-child/child.js" \child
            ..on \message (message, data) !->
              assert.equal message, \greating "Should get greating."
              assert.equal data, \hello "Get echo from child."
              async.each children, (item, callback) !->
                item.exit!
                callback!
              , !-> defer.resolve!
            ..start callback!
            children.push ..
        , (error) !-> partner.select \child \random .send \greating \hello

      tdd.test "select any child by alias/first then send message" !->
        children = []
        defer = @async 2000
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/master-to-child/child.js" \child
            ..on \exit !->
              console.log "Why invoke me???"
            ..on \message (message, data) !->
              assert.equal @index, 1 "Should first child."
              assert.equal message, \greating "Should get greating."
              assert.equal data, \hello "Get echo from child."
              async.each children, (item, callback) !->
                item.exit!
                callback!
              , !-> defer.resolve!
            ..start callback
            ..index = item
            children.push ..
        , (error) !-> partner.select "file://test/master-to-child/child.js" \first .send \greating \hello

      tdd.test "select any child by alias/last then send message" !->
        children = []
        defer = @async 2000
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/master-to-child/child.js" \child
            ..on \message (message, data) !->
              assert.equal @index, 10 "Should last child."
              assert.equal message, \greating "Should get greating."
              assert.equal data, \hello "Get echo from child."
              async.each children, (item, callback) !->
                item.exit!
                callback!
              , !-> defer.resolve!
            ..start callback
            ..index = item
            children.push ..
        , (error) !-> partner.select \child \last .send \greating \hello

      tdd.test "select any child by alias/index then send message" !->
        children = []
        defer = @async 2000
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/master-to-child/child.js"
            ..on \message (message, data) !->
              assert.equal @index, 4 "Should fourth child."
              assert.equal message, \greating "Should get greating."
              assert.equal data, \hello "Get echo from child."
              async.each children, (item, callback) !->
                item.exit!
                callback!
              , !-> defer.resolve!
            ..start callback
            ..index = item
            children.push ..
        , (error) !-> partner.select "file://test/master-to-child/child.js" 3 .send \greating \hello

      tdd.test "select any child by alias/next then request handle" !->
        children = []
        defer = @async 2000
        first-time = true
        second-time = true
        next = null
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/master-to-child/child.js" \child
            ..on \message (message, data) !->
              assert.equal message, \greating "Should get greating."
              assert.equal data, \hello "Get echo from child."
              if first-time
                next := @index
                first-time := false
                return partner.select \child \next .send \greating \hello
              if second-time
                assert.equal (next + 1) % 10, @index, "Should next item."
                next := @index
                second-time := false
                return partner.select \child \next .send \greating \hello
              assert.equal (next + 1) % 10, @index, "Should next item."
              async.each children, (item, callback) !->
                item.exit!
                callback!
              , !-> defer.resolve!
            ..start callback
            ..index = item
            children.push ..
        , (error) !-> partner.select \child \next .send \greating \hello
