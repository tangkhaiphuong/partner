define({
  useLoader: {
    'host-node': 'requirejs'
  },
  suites: ['test/master-to-master/partner.start', 'test/master-to-master/partner.stop', 'test/master-to-master/partner.send', 'test/master-to-master/partner.handle', 'test/master-to-child/child.list', 'test/master-to-child/child.start', 'test/master-to-child/child.stop', 'test/master-to-child/child.exit', 'test/master-to-child/child.send', 'test/master-to-child/child.request', 'test/master-to-child/child.select.message', 'test/master-to-child/child.select.handle', 'test/child-to-child/friend.with.message', 'test/child-to-child/friend.with.handle'],
  excludeInstrumentation: /^(?:test|node_modules)\//
});
