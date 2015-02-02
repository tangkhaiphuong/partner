# Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
# These default settings work OK for most people. The options that *must* be changed below are the
# packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define do
  # The desired AMD loader to use when running unit tests (client.html/client.js). Omit to use the default Dojo
  # loader
  useLoader:
    \host-node : \requirejs

  # Non-functional test suite(s) to run in each browser
  suites:
    \test/master-to-master/partner.start
    \test/master-to-master/partner.stop
    \test/master-to-master/partner.send
    \test/master-to-master/partner.handle
    \test/master-to-child/child.list
    \test/master-to-child/child.start
    \test/master-to-child/child.stop
    \test/master-to-child/child.exit
    \test/master-to-child/child.send
    \test/master-to-child/child.request
    \test/master-to-child/child.select.message
    \test/master-to-child/child.select.handle
    \test/child-to-child/friend.with.message
    \test/child-to-child/friend.with.handle

  # A regular expression matching URLs to files that should not be included in code coverage analysis
  excludeInstrumentation: /^(?:test|node_modules)\//
