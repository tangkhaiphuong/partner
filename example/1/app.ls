# Import libraries
partner = require "../../lib/partner"
child = partner.create "file://#{__filename}"
/* Handle child message. */
child.on "message", (message, data) ->
  /* Go message from child. */
  console.log "------------------------------"
  console.log "[Child::Message]: Got message from child: #{JSON.stringify message: message, data: data}"
/* Handle child exit. */
child.on "exit", (errors, data) ->
  /* Go message from child. */
  console.log "[Child::Exit]: Child is killed. Start again with arguments: #{JSON.stringify data}"
  /* Start again. */
  @start data
  console.log "------------------------------"
/* Handle child request. */
child.handle (message, data, response) ->
  /* Go request from child. */
  console.log "[Master::Request]: Got request from child: #{JSON.stringify message: message, data: data}"
  switch message
    when "Multiply" then response null, data.first * data.second
    else response "Master don't handle it!"
/* Handle start event. */
partner.on "start", (data, master) ->
  if master
    console.log "[Start]: I'm master: #{JSON.stringify(data)}"
    /* Start child if itself is master. */
    child.start "Child::Start", (error) !->
      console.log "[Start]: Got error: ", error
      process.exit!
    /* Send message to child. */
    child.send "Hello", "How are you?"
    console.log "------------------------------"
    /* Request message to child process. */
    child.request "Sum",
      first: 1
      second: 2
    , (error, data, message) ->
      console.log "------------------------------"
      return console.error "[#{message}::Master::Response]: Got error: ", error if error?
      console.log "[#{message}::Master::Response]: #{JSON.stringify message: message, data: data}"
    /* Request message to child process with no handle. */
    child.request "NoHandler", "Data", (error, data, message) ->
      console.log "------------------------------"
      return console.error "[#{message}::Master::Response]: Got error: ", error if error?
      console.log "[#{message}::Master::Response]: #{JSON.stringify message: message, data: data}"
    /* Stop entry point after 6 second. */
    setTimeout ->
      console.log "------------------------------"
      partner.stop "Master::Stop"
    , 3000
    /* Kill child after 2 second. */
    setTimeout ->
      console.log "------------------------------"
      console.log "            child.get().kill()"
      child.get().kill()
    , 2000
  else
    console.log "[Start]: I'm child: #{JSON.stringify(data)}"
    ### Send to itself .###
    console.log "------------------------------"
    partner.send "???", "Who am I?"
    /* Ask master request. */#
    partner.request "Multiply",
      first: 10
      second: 10
    , (error, data, message) ->
      console.log "------------------------------"
      return console.error "[#{message}::Child::Response]: Got error: ", error if error?
      console.log "[#{message}::Child::Response]: #{JSON.stringify message: message, data: data}"
    /* Request message to child process with no handle. */
    partner.request "Reject", "Data", (error, data, message) ->
      console.log "------------------------------"
      return console.error "[#{message}::Child::Response]: Got error: ", error if error?
      console.log "[#{message}::Child::Response]: #{JSON.stringify message: message, data: data}"

/* Handle stop event. */
partner.on "stop", (data, master) ->
  if master
    /* Stop child if itself is master. */
    child.stop "Child::Stop"
    console.log "[Stop]: I'm master: #{JSON.stringify(data)}"
    /* Stop child after 1 second. */
    setTimeout ->
      console.log "------------------------------"
      console.log "            child.stop('Child::Stop')"
      child.stop "Child::Stop"
    , 2000
    /* Force kill child after 3 second. */
    setTimeout ->
      console.log "------------------------------"
      console.log "            child.exit()"
      child.exit()
    , 3000
  else console.log "[Stop]: I'm child: #{JSON.stringify(data)}"
/* Handle message event. */
partner.on \message (message, data, master) ->
  if master then console.log "[Message]: Got message from itself: #{JSON.stringify message: message, data: data}"
  else console.log "[Message]: Got message from parent: #{JSON.stringify message: message, data: data}"
/* Handle default request */
partner.handle (message, data, response) ->
  /* Go request from child. */
  console.log "[Child::Request]: Got request from parent: #{JSON.stringify message: message, data: data}"
  switch message
    when "Sum" then response null, data.first + data.second
    else response "I don't handle it!"
/* Start entry point. */
partner.start "Master::Start"
