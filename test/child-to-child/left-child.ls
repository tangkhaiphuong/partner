require! {
  \../../lib/partner
}
index = null
partner.on \start (data, master, done) !-> done!
partner.on \stop (data, master, done) !-> done!
partner.on \message (message, data) !->
  partner.send message, do
    data: data
    index: index
partner.handle (message, data, response) !->
  switch message
  | \- => response null,
    data: data.left - data.right
    index: index
  | \+ => response null,
    data: data.left + data.right
    index: index
  | \* => response null,
    data: data.left * data.right
    index: index
  | \/ => response null,
    data: data.left / data.right
    index: index
  | \die => process.exit!
  | \index => index := data
  | \start-tick =>
    @timer = setInterval !-> partner.send \tick new Date!
    , data
  | \stop-stick => clearInterval @timer
  | _ => response "Not support."
partner.start!