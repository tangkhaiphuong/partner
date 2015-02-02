# Import libraries
partner = require \../../lib/partner
### Handle start event. ###
partner.on \start (data, master, done) !->
  console.log "Right::Start"
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
  request = partner.with \left strategy.name
  for i in [1 to 5]
    #request.send "Hello", "World"
    request.request \Divide do
      first: 100
      second: 2
    , (error, data, message) !->
      console.log "------------------------------"
      return console.error "Got error: ", error if error?
      console.log "#{JSON.stringify message: message, data: data}"
  # Handler messsage
  request.register (message, data) !->
    console.log "Got", message, data
  done()
### Handle stop event. ###
partner.on \stop (data, master, done) !-> done()
### Handle message event. ###
partner.on \message (message, data, master) !->
### Handle default request ###
### Start entry point. ###
partner.start()
