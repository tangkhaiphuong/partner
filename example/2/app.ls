# Import libraries
partner = require \../../lib/partner
lefts = []
[lefts.push partner.create "file://#{__dirname}/left.js" \left for i in [1 to 5]]
right = partner.create "file://#{__dirname}/right.js" \right
### Handle start event. ###
partner.on \start (data, master) !->
  [item.start index for item, index in lefts]
  right.start!
  return
   # Uncomment to test send with group worker
  strategies = [
    name: \first
    describe: "Request with first strategy"
  ,
    name: \last
    describe : "Request with last strategy"
  ,
    name: \random
    describe : "Request with random strategy"
  ,
    name: \next
    describe : "Request with next strategy"
  ,
    name: 2
    describe : "Request with specify index"
  ]
  strategy = strategies[3]
  # Request to left
  console.log strategy.describe
  request = partner.select \left strategy.name
  for i in [1 to 10]
    #request.send "Abc", "Bca"
    request.request \Multiple do
      first: 100
      second: 2
    , (error, data, message) !->
      console.log "------------------------------"
      return console.error "Got error: ", error if error?
      console.log "#{JSON.stringify message: message, data: data}"
partner.start()
