define do
  * \module
    \intern!tdd
    \intern/chai!assert
    \intern/dojo/node!async
    \intern/dojo/node!../../lib/partner
  , (module, tdd, assert, async,  partner) !->

    tdd.suite module.id, !->

      tdd.test "list all chilren" !->
        children = []
        defer = @async 2000
        async.each [1 to 10], (item, callback) !->
          partner.create "file://test/master-to-child/child.js" \child
            ..start !->
              children.push ..
              callback!
        , (error) !->
          assert.equal partner.list!.length, children.length, "Number of process should equal"
          children.splice(6, 1)[0].exit!
          assert.equal partner.list!.length, children.length, "Number of process should equal"
          children.splice(5, 1)[0].exit!
          assert.equal partner.list!.length, children.length, "Number of process should equal"
          console.log children.length
          async.each children, (item, callback) !->
            item.exit!
            callback!
          , !-> defer.resolve!