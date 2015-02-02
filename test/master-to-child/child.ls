require! {
  \../../lib/partner
}
partner.on \start (data, master, done) !->
  done!
  partner.send \start data if data?
partner.on \stop (data, master, done) !->
  done!
  partner.send \stop data if data?
partner.on \message (message, data) !->
  partner.send message, data
partner.handle (message, data, response) !->
  switch message
  | \- => response null, data.left - data.right
  | \+ => response null, data.left + data.right
  | \* => response null, data.left * data.right
  | \/ => response null, data.left / data.right
  | \die =>
    response!
    process.exit!
  | _ => response "Not support."
partner.start!