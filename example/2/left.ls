index = null
# Import libraries
partner = require \../../lib/partner
### Handle start event. ###
partner.on \start (data, master, done) !->
  console.log "Left::Start: #{index := data}"
  ### Raise message interval ###
  setInterval !->
    partner.send \new.data new Date()
  , 2000
  done()
### Handle stop event. ###
partner.on \stop (data, master, done) !-> done()
### Handle message event. ###
partner.on \message (message, data, master) ->
  console.log "Left::Message: #{index} #{JSON.stringify message: message, data: data}"
### Handle default request ###
partner.handle (message, data, response) !->
  ### Go request from child. ###
  switch message
    when \Divide then response null,
      result: data.first / data.second
      index: index
    when \Multiple then response null,
      result: data.first * data.second
      index: index
    else response "I don't handle it!"
### Start entry point. ###
partner.start()
