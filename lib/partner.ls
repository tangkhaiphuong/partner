/*
  Name:         partner.js
  Author:       Tăng Khải Phương - tangkhaiphuong@gmail.com
  Contributors: Tăng Khải Phương - tangkhaiphuong@gmail.com
  Licence:    MIT.
*/
module.exports = let
  processPool = []
  masterSlots = {}
  forwardSlots = {}
  messageSlots = {}
  masterHandler = null
  friendIndex = {}
  globalError =
    errors: []
    exit: -1
  messageHandler = []
  #so the program will not close instantly
  exitHandler = (options, err) !->
    if options.cleanup
      globalError.exit = err
      for item in processPool
        try item.stop!
        catch ex
          globalError.errors.push do
            name: ex.name
            message: ex.message
            stack: ex.stack
        try item.exit!
        catch ex
          globalError.errors.push do
            name: ex.name
            message: ex.message
            stack: ex.stack
    else if err?
      globalError.name = err.name
      globalError.message = err.message
      globalError.stack = err.stack
    process.send? do #Send back error to parent
      slotError: true
      error: globalError
    process.exit! if options.exit
  #do something when app is closing
  process.on \exit exitHandler.bind null, cleanup: true
  #catches ctrl+c event
  process.on \SIGINT exitHandler.bind null, exit: true
  process.on \SIGTERM exitHandler.bind null, exit: true
  #catches uncaught exceptions
  process.on \uncaughtException exitHandler.bind null, exit: true
  # Module import
  require! {
    \child_process
    \fs
    \events
    \path
  }
  EventEmitter = events.EventEmitter
  globalEvent = new EventEmitter!

  createUUID = ->
    \xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx .replace /[xy]/g, (c) ->
      r = Math.random! * 16 .|. 0
      v = (if c is "x" then r else (r .&. 0x3 .|. 0x8))
      v.toString 16

  process.on \message (message) !->
    switch message
    | \exit =>
      globalEvent.emit \exit
      process.exit!

  process.on \message (message) !->
    if message.slotPartner?
      if masterHandler?
        return masterHandler.call? globalEvent, message.message, message.data, (error, data) !->
          process.send do
            message: message.message
            data: data
            error: error
            slotPartner: message.slotPartner
      else
        return process.send do
          message: message.message
          error:
            message: "Partner doesn't handle."
          slotPartner: message.slotPartner
    else if message.slotMaster?
      response = masterSlots[message.slotMaster]
      delete masterSlots[message.slotMaster]
      return response?call? globalEvent, message.error, message.data, message.message
    else if message.slotForward?
      response = forwardSlots[message.slotForward]
      delete forwardSlots[message.slotForward]
      return response?call? globalEvent, message.error, message.data, message.message
    else if message.message?slotMessage?
      [item? message.message.message, message.message.data for item in messageHandler]
    else
      if message.start?
        startCounter = 0
        numberEvent = globalEvent.listeners \start .length
        prepare_callback = (error, data) !->
          ++startCounter
          if startCounter is numberEvent
            process.send do
              data: data
              error: error
              slotStart: message.slotStart
        ret = globalEvent.emit \start message.data, false, prepare_callback
        unless ret
          process.send do
            error:
              message: "Partner doesn't listen start event."
            slotStart: message.slotStart
        return
      if message.stop?
        stopCounter = 0
        numberEvent = globalEvent.listeners \stop .length
        prepare_callback = (error, data) !->
          ++stopCounter
          if stopCounter  is numberEvent
            process.send do
              data: data
              error: error
              slotStop: message.slotStop
        ret = globalEvent.emit \stop message.data, false, prepare_callback
        unless ret
          process.send do
            error:
              message: "Partner doesn't listen stop event."
            slotStop: message.slotStart
        return
      return globalEvent.emit \message message.message, message.data, false

  globalEvent.start = (data, cb) ->
    if not cb? and typeof data is \function
      cb = data
      data = undefined
    unless process.send?
      startCounter = 0
      numberEvent = globalEvent.listeners \start .length
      prepare_callback = !->
        ++startCounter
        cb?call? globalEvent if startCounter is numberEvent
      unless globalEvent.emit \start data, true, prepare_callback
        # Only send if all callback are invoke
        cb?call? globalEvent, message: "Master doesn't listen start event."
      return true
    else
      return false

  globalEvent.stop = (data, cb) ->
    if not cb? and typeof data is \function
      cb = data
      data = undefined
    unless process.send?
      stopCounter = 0
      numberEvent = globalEvent.listeners \stop .length
      prepare_callback = !->
        ++stopCounter
        cb?call? globalEvent if stopCounter is numberEvent
      unless globalEvent.emit \stop data, true, prepare_callback
        # Only send if all callback are invoke
          cb?call? globalEvent, message: "Master doesn't listen stop event."
      return true
    else
      return false

  globalEvent.handle = (message, data ,response) !->
    return masterHandler := message if typeof message is \function
    #throw new Error("First argument must be a string.") if typeof message isnt "string"
    if not response? and typeof data is \function
      response = data
      data = undefined
    masterHandler?call? globalEvent, message, data, (error, data) !-> response?call? globalEvent, error, data, message

  globalEvent.send = (message, data, sendHandle) !->
    #throw new Error("First argument must be a string.") if typeof message isnt "string"
    if process.send?
      process.send do
        * message: message
          data: data
        * sendHandle
    else
      globalEvent.emit \message message, data, true

  globalEvent.broadcast = (message, data, sendHandle) !->
    #throw new Error("First argument must be a string.") if typeof message isnt "string"
    for item in processPool
      item.send message, data, sendHandle

  globalEvent.list = -> processPool

  globalEvent.request = (message, data, response) !->
    #throw new Error("First argument must be a string.") if typeof message isnt "string"
    if not response? and typeof data is \function
      response = data
      data = undefined
    if process.send?
      slot = createUUID!
      masterSlots[slot] = response if response?
      process.send do
        message: message
        data: data
        slotMaster: slot
    else
      response?call? globalEvent, message: "Partner doesn't have master."

  # strategy: "first", "last", "random", "next", index
  globalEvent.with = (target, strategy = \first ) ->
    return throw message: "Unknown partner." unless target?
    request: (message, data, response) !->
      #throw new Error("First argument must be a string.") if typeof message isnt "string"
      if not response? and typeof data is \function
        response = data
        data = undefined
      if process.send?
        slot = createUUID!
        forwardSlots[slot] = response if response?
        process.send do
          message: message
          data: data
          slotForward: slot
          target: target
          strategy: strategy
      else
        response?call? globalEvent, message: "Partner doesn't have master.", target: target
    send: (message, data) !->
      #throw new Error("First argument must be a string.") if typeof message isnt "string"
      if process.send?
        process.send do
          message: message
          data: data
          slotSend: true
          target: target
          strategy: strategy
    register: (callback) !->
      return response?call? globalEvent, message: "Unknown partner." unless target?
      if process.send?
        messageHandler.push callback
        process.send do
          register: true
          slotMessage: true
          target: target
    unRegister: (callback) !->
      return response?call? globalEvent, message: "Unknown partner." unless target?
      if process.send?
        messageHandler.splice messageHandler.indexOf(callback), 1
        process.send do
          register: false
          slotMessage: true
          target: target

  # strategy: "first", "last", "random", "next", index
  globalEvent.select = (target, strategy = \first ) ->
    return throw message: "Unknown partner." unless target?
    request: (message, data, response) !->
      _url_info = require("url").parse target
      resolvedFile = null
      if _url_info.protocol?
        resolvedFile = target.replace "#{_url_info.protocol}//" ""
        resolvedFile = path.resolve resolvedFile if _url_info.protocol is \file:
      #throw new Error("First argument must be a string.") if typeof message isnt "string"
      if not response? and typeof data is \function
        response = data
        data = undefined
      poolItem = []
      index = -1
      address = null
      for item in processPool
        continue if item.getAlias! isnt target and item.getAddress! isnt resolvedFile
        address ?:= resolvedFile
        index++
        if strategy is \first or strategy is index
          return item.request message, data, response
        poolItem.push item
      unless poolItem.length is 0
        return poolItem[poolItem.length - 1].request message, data, response if strategy is \last
        return poolItem[0].request message, data, response if typeof strategy is \number
        return poolItem[Math.floor(Math.random!*poolItem.length)].request message, data, response if strategy is \random
        if strategy is \next
          friendIndex[address] = 0 unless friendIndex[address]?
          index = friendIndex[address]
          friendIndex[address] = index + 1
          if index >= poolItem.length
            index = 0
            friendIndex[address] = index + 1
          return poolItem[index].request message, data, response
        else #Don't know strategy, get first
          return poolItem[0].request message, data, response if typeof strategy is \number
      else
        response?call? globalEvent, message: "Not found.", target: target

    send: (message, data, sendHandle) !->
      _url_info = require("url").parse target
      resolvedFile = null
      if _url_info.protocol?
        resolvedFile = target.replace "#{_url_info.protocol}//" ""
        resolvedFile = path.resolve resolvedFile if _url_info.protocol is \file:
      #throw new Error("First argument must be a string.") if typeof message isnt "string"
      poolItem = []
      index = -1
      address = null
      for item in processPool
        continue if item.getAlias! isnt target and item.getAddress! isnt resolvedFile
        address ?:= resolvedFile
        index++
        if strategy is \first or strategy is index
          return item.send message, data, sendHandle
        poolItem.push item
      unless poolItem.length is 0
        return poolItem[poolItem.length - 1].send message, data, sendHandle if strategy is \last
        return poolItem[0].send message, data, sendHandle if typeof strategy is \number
        return poolItem[Math.floor(Math.random!*poolItem.length)].send message, data, sendHandle if strategy is \random
        if strategy is \next
          friendIndex[address] = 0 unless friendIndex[address]?
          index = friendIndex[address]
          friendIndex[address] = index + 1
          if index >= poolItem.length
            index = 0
            friendIndex[address] = index + 1
          return poolItem[index].send message, data, sendHandle
        else #Don't know strategy, get first
          return poolItem[0].send message, data, sendHandle if typeof strategy is \number
      else
        throw message: "Not found.", target: target

  globalEvent.create = (url, alias) ->

    _startSlots = {}
    _stopSlots = {}
    _partnerSlots = {}
    _forceExit = false
    _address = null
    _url = url
    _url_info = require("url").parse url
    if _url_info.protocol is \file:
      _address = path.resolve  url.replace \file:// ""
    _$ = null
    _opts = null
    _args = []
    _error = null
    _partnerHandler = null
    obj = new EventEmitter!
    obj.setOptions = (opts) -> _opts := opts
    obj.getOptions = -> _opts
    obj.setArguments = (args) -> _args := args
    obj.getArguments = -> _args
    obj.getUrl = -> _url
    obj.getAddress = -> _address
    obj.getAlias = -> alias
    obj.get = -> _$
    obj.start = (data, cb) !->
      _error :=
        exit: 0
        errors: []
      if not cb? and typeof data is \function
        cb = data
        data = undefined
      unless _$?
        processPool.push obj
        _forceExit := false
        if _url_info.protocol is "file:"
          if fs.existsSync _address
            _$ := child_process.fork _address, _args, _opts
          else
            return cb?call? obj,
              message: "Not found."
              url: url
        _$.on \error (error) !->
          obj.emit \error error
        _$.on \exit !->
          temp = _partnerSlots
          _partnerSlots := {}
          [temp[item]? message: "Partner is died.", url: obj.getUrl! for item in Object.keys temp]
          _$ := null
          unless _forceExit then obj.emit \exit _error, data
          for item, index in processPool
            return processPool.splice index, 1 if Object.is item, obj
        _$.on \message (message) !->
          #throw new Error("First argument must be a string.") if typeof message isnt "string"
          if message.slotError?
            _error = message.error
          else if message.slotStart?
            response = _startSlots[message.slotStart]
            delete _startSlots[message.slotStart]
            return response?call? obj, message.error, message.data
          else if message.slotStop?
            response = _stopSlots[message.slotStop]
            delete _stopSlots[message.slotStop]
            return response?call? obj, message.error, message.data
          else if message.slotPartner?
            response = _partnerSlots[message.slotPartner]
            delete _partnerSlots[message.slotPartner]
            return response?call? obj, message.error, message.data, message.message
          else if message.slotForward?
            _url_info = require("url").parse message.target
            target = null
            if _url_info.protocol?
              target = message.target.replace "#{_url_info.protocol}//" ""
              target = path.resolve target if _url_info.protocol is \file:
            action = (item) !->
              item.request message.message, message.data, (error, data, message_) !->
                self = _$
                self?send do
                  message: message_
                  data: data
                  error: error
                  slotForward: message.slotForward
            poolItem = []
            index = -1
            address = null
            for item in processPool
              continue if item.getAlias! isnt message.target and item.getAddress! isnt target
              address := target
              index++
              if message.strategy is \first or message.strategy is index
                return action item
              poolItem.push item
            unless poolItem.length is 0
              return action poolItem[poolItem.length - 1] if message.strategy is \last
              return action poolItem[0] if typeof message.strategy is \number
              return action poolItem[Math.floor(Math.random!*poolItem.length)] if message.strategy is \random
              if message.strategy is \next
                friendIndex[address] = 0 unless friendIndex[address]?
                index = friendIndex[address]
                friendIndex[address] = index + 1
                if index >= poolItem.length
                  index = 0
                  friendIndex[address] = index + 1
                return action poolItem[index]
              else #Don't know strategy, get first
              return action poolItem[0] if typeof message.strategy is \number
            else
              self = _$
              self?send do
                message: message.message
                data: data
                error:
                  message: "Not found."
                  address: message.target
                slotForward: message.slotForward
          else if message.slotSend?
            _url_info = require("url").parse message.target
            target = null
            if _url_info.protocol?
              target = message.target.replace "#{_url_info.protocol}//" ""
              target = path.resolve target if _url_info.protocol is \file:
            poolItem = []
            index = -1
            address = null
            for item in processPool
              continue if item.getAlias! isnt message.target and item.getAddress! isnt target
              address := target
              index++
              if message.strategy is \first or message.strategy is index
                return item.send message.message, message.data
              poolItem.push item
            unless poolItem.length is 0
              return poolItem[poolItem.length - 1].send message.message, message.data if message.strategy is \last
              return poolItem[0].send message.message, message.data if typeof message.strategy is \number
              return poolItem[Math.floor(Math.random!*poolItem.length)].send message.message, message.data if message.strategy is \random
              if message.strategy is \next
                friendIndex[address] = 0 unless friendIndex[address]?
                index = friendIndex[address]
                friendIndex[address] = index + 1
                if index >= poolItem.length
                  index = 0
                  friendIndex[address] = index + 1
                return poolItem[index].send message.message, message.data
              else #Don't know strategy, get first
              return poolItem[0].send message.message, message.data if typeof message.strategy is \number
          else if message.slotMaster?
            if _partnerHandler?
              _partnerHandler.call? obj, message.message, message.data, (error, data)->
                self = _$
                self?send do
                  message: message.message
                  data: data
                  error: error
                  slotMaster: message.slotMaster
            else
              self = _$
              self?send do
                message: message.message
                error:
                  message: "Master doesn't handle."
                  target: target
                slotMaster: message.slotMaster
          else if message.slotMessage?
            _url_info = require("url").parse message.target
            target = message.target
            if _url_info.protocol?
              target := message.target.replace "#{_url_info.protocol}//" ""
              target := path.resolve target if _url_info.protocol is \file:
            if message.register
              (messageSlots[target] ?= []).push obj
            else
              messageSlots[target]?splice messageSlots[target].indexOf(obj), 1
          else
            messageSlots[obj.getAddress!]?forEach (item) !->
              item.send do
                message: message.message
                slotMessage: true
                data: message.data
            messageSlots[obj.getAlias!]?forEach (item) !->
              item.send do
                message: message.message
                slotMessage: true
                data: message.data
            obj.emit \message message.message, message.data, true
            return

      self = _$
      slot = createUUID!
      _startSlots[slot] = cb if cb?
      self?send do
        * start: true
          data: data
          slotStart: slot
        * null

    obj.stop = (data, cb) !->
      if not cb? and typeof data is \function
        cb = data
        data = undefined
      self = _$
      slot = createUUID!
      _stopSlots[slot] = cb if cb?
      self?send do
        * stop: true,
          data: data
          slotStop: slot
        * null

    obj.send = (message, data, sendHandle) !->
      #throw new Error("First argument must be a string.") if typeof message isnt "string"
      self = _$
      self?send do
        * message: message
          data: data
        * sendHandle

    obj.request = (message, data, response) !->
      #throw new Error("First argument must be a string.") if typeof message isnt "string"
      if not response? and typeof data is \function
        response = data
        data = undefined
      return response?call? obj, message: "Partner isn't ready", url: obj.getAddress! unless _$?
      self = _$
      slot = createUUID!
      _partnerSlots[slot] = response if response?
      self?send do
        message: message
        data: data
        slotPartner: slot

    obj.handle = (cb) !-> _partnerHandler := cb

    obj.broadcast = (message, data, sendHandle) !->
      #throw new Error("First argument must be a string.") if typeof message isnt "string"
      for item in processPool
        continue if Object.is item, obj
        item.send message, data, sendHandle

    obj.exit = !->
      _forceExit := true
      self = _$
      self?send \exit null
      _$ := null
      for item, index in processPool
        if Object.is item, obj
          return processPool.splice index, 1

    obj

  globalEvent