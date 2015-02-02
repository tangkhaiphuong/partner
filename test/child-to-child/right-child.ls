require! {
  \../../lib/partner
}
partner.on \start (data, master, done) !-> done!
partner.on \stop (data, master, done) !-> done!
register = (message, data) !-> partner.send message, data
partner.handle (message, data, response) !->
  switch message
  | \send =>
    partner.with(data.alias, data.strategy)
      callback = (message, data) !->
        response null do
          message: message
          data: data
        ..unRegister callback
      ..register callback
      ..send data.message, data.data
  | \request =>
    partner.with(data.alias, data.strategy).request data.message, data.data, (error, data_, message) !->
      response error,
        message: data.message
        data: data_
  | \register => partner.with(\left strategy).register register
  | \unregister => partner.with(\left strategy).register register
partner.start!