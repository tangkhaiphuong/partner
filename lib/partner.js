/*
  Name:         partner.js
  Author:       Tăng Khải Phương - tangkhaiphuong@gmail.com
  Contributors: Tăng Khải Phương - tangkhaiphuong@gmail.com
  Licence:    MIT.
*/
module.exports = (function(){
  var processPool, masterSlots, forwardSlots, messageSlots, masterHandler, friendIndex, globalError, messageHandler, exitHandler, child_process, fs, events, path, EventEmitter, globalEvent, createUUID;
  processPool = [];
  masterSlots = {};
  forwardSlots = {};
  messageSlots = {};
  masterHandler = null;
  friendIndex = {};
  globalError = {
    errors: [],
    exit: -1
  };
  messageHandler = [];
  exitHandler = function(options, err){
    var i$, ref$, len$, item, ex;
    if (options.cleanup) {
      globalError.exit = err;
      for (i$ = 0, len$ = (ref$ = processPool).length; i$ < len$; ++i$) {
        item = ref$[i$];
        try {
          item.stop();
        } catch (e$) {
          ex = e$;
          globalError.errors.push({
            name: ex.name,
            message: ex.message,
            stack: ex.stack
          });
        }
        try {
          item.exit();
        } catch (e$) {
          ex = e$;
          globalError.errors.push({
            name: ex.name,
            message: ex.message,
            stack: ex.stack
          });
        }
      }
    } else if (err != null) {
      globalError.name = err.name;
      globalError.message = err.message;
      globalError.stack = err.stack;
    }
    if (typeof process.send == 'function') {
      process.send({
        slotError: true,
        error: globalError
      });
    }
    if (options.exit) {
      process.exit();
    }
  };
  process.on('exit', exitHandler.bind(null, {
    cleanup: true
  }));
  process.on('SIGINT', exitHandler.bind(null, {
    exit: true
  }));
  process.on('SIGTERM', exitHandler.bind(null, {
    exit: true
  }));
  process.on('uncaughtException', exitHandler.bind(null, {
    exit: true
  }));
  child_process = require('child_process');
  fs = require('fs');
  events = require('events');
  path = require('path');
  EventEmitter = events.EventEmitter;
  globalEvent = new EventEmitter();
  createUUID = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      var r, v;
      r = Math.random() * 16 | 0;
      v = c === "x"
        ? r
        : r & 0x3 | 0x8;
      return v.toString(16);
    });
  };
  process.on('message', function(message){
    switch (message) {
    case 'exit':
      globalEvent.emit('exit');
      process.exit();
    }
  });
  process.on('message', function(message){
    var response, ref$, i$, ref1$, len$, item, startCounter, numberEvent, prepare_callback, ret, stopCounter;
    if (message.slotPartner != null) {
      if (masterHandler != null) {
        return typeof masterHandler.call == 'function' ? masterHandler.call(globalEvent, message.message, message.data, function(error, data){
          process.send({
            message: message.message,
            data: data,
            error: error,
            slotPartner: message.slotPartner
          });
        }) : void 8;
      } else {
        return process.send({
          message: message.message,
          error: {
            message: "Partner doesn't handle."
          },
          slotPartner: message.slotPartner
        });
      }
    } else if (message.slotMaster != null) {
      response = masterSlots[message.slotMaster];
      delete masterSlots[message.slotMaster];
      return response != null ? typeof response.call == 'function' ? response.call(globalEvent, message.error, message.data, message.message) : void 8 : void 8;
    } else if (message.slotForward != null) {
      response = forwardSlots[message.slotForward];
      delete forwardSlots[message.slotForward];
      return response != null ? typeof response.call == 'function' ? response.call(globalEvent, message.error, message.data, message.message) : void 8 : void 8;
    } else if (((ref$ = message.message) != null ? ref$.slotMessage : void 8) != null) {
      for (i$ = 0, len$ = (ref1$ = messageHandler).length; i$ < len$; ++i$) {
        item = ref1$[i$];
        if (typeof item == 'function') {
          item(message.message.message, message.message.data);
        }
      }
    } else {
      if (message.start != null) {
        startCounter = 0;
        numberEvent = globalEvent.listeners('start').length;
        prepare_callback = function(error, data){
          ++startCounter;
          if (startCounter === numberEvent) {
            process.send({
              data: data,
              error: error,
              slotStart: message.slotStart
            });
          }
        };
        ret = globalEvent.emit('start', message.data, false, prepare_callback);
        if (!ret) {
          process.send({
            error: {
              message: "Partner doesn't listen start event."
            },
            slotStart: message.slotStart
          });
        }
        return;
      }
      if (message.stop != null) {
        stopCounter = 0;
        numberEvent = globalEvent.listeners('stop').length;
        prepare_callback = function(error, data){
          ++stopCounter;
          if (stopCounter === numberEvent) {
            process.send({
              data: data,
              error: error,
              slotStop: message.slotStop
            });
          }
        };
        ret = globalEvent.emit('stop', message.data, false, prepare_callback);
        if (!ret) {
          process.send({
            error: {
              message: "Partner doesn't listen stop event."
            },
            slotStop: message.slotStart
          });
        }
        return;
      }
      return globalEvent.emit('message', message.message, message.data, false);
    }
  });
  globalEvent.start = function(data, cb){
    var startCounter, numberEvent, prepare_callback;
    if (cb == null && typeof data === 'function') {
      cb = data;
      data = undefined;
    }
    if (process.send == null) {
      startCounter = 0;
      numberEvent = globalEvent.listeners('start').length;
      prepare_callback = function(){
        ++startCounter;
        if (startCounter === numberEvent) {
          if (cb != null) {
            if (typeof cb.call == 'function') {
              cb.call(globalEvent);
            }
          }
        }
      };
      if (!globalEvent.emit('start', data, true, prepare_callback)) {
        if (cb != null) {
          if (typeof cb.call == 'function') {
            cb.call(globalEvent, {
              message: "Master doesn't listen start event."
            });
          }
        }
      }
      return true;
    } else {
      return false;
    }
  };
  globalEvent.stop = function(data, cb){
    var stopCounter, numberEvent, prepare_callback;
    if (cb == null && typeof data === 'function') {
      cb = data;
      data = undefined;
    }
    if (process.send == null) {
      stopCounter = 0;
      numberEvent = globalEvent.listeners('stop').length;
      prepare_callback = function(){
        ++stopCounter;
        if (stopCounter === numberEvent) {
          if (cb != null) {
            if (typeof cb.call == 'function') {
              cb.call(globalEvent);
            }
          }
        }
      };
      if (!globalEvent.emit('stop', data, true, prepare_callback)) {
        if (cb != null) {
          if (typeof cb.call == 'function') {
            cb.call(globalEvent, {
              message: "Master doesn't listen stop event."
            });
          }
        }
      }
      return true;
    } else {
      return false;
    }
  };
  globalEvent.handle = function(message, data, response){
    if (typeof message === 'function') {
      return masterHandler = message;
    }
    if (response == null && typeof data === 'function') {
      response = data;
      data = undefined;
    }
    if (masterHandler != null) {
      if (typeof masterHandler.call == 'function') {
        masterHandler.call(globalEvent, message, data, function(error, data){
          if (response != null) {
            if (typeof response.call == 'function') {
              response.call(globalEvent, error, data, message);
            }
          }
        });
      }
    }
  };
  globalEvent.send = function(message, data, sendHandle){
    if (process.send != null) {
      process.send({
        message: message,
        data: data
      }, sendHandle);
    } else {
      globalEvent.emit('message', message, data, true);
    }
  };
  globalEvent.broadcast = function(message, data, sendHandle){
    var i$, ref$, len$, item;
    for (i$ = 0, len$ = (ref$ = processPool).length; i$ < len$; ++i$) {
      item = ref$[i$];
      item.send(message, data, sendHandle);
    }
  };
  globalEvent.list = function(){
    return processPool;
  };
  globalEvent.request = function(message, data, response){
    var slot;
    if (response == null && typeof data === 'function') {
      response = data;
      data = undefined;
    }
    if (process.send != null) {
      slot = createUUID();
      if (response != null) {
        masterSlots[slot] = response;
      }
      process.send({
        message: message,
        data: data,
        slotMaster: slot
      });
    } else {
      if (response != null) {
        if (typeof response.call == 'function') {
          response.call(globalEvent, {
            message: "Partner doesn't have master."
          });
        }
      }
    }
  };
  globalEvent['with'] = function(target, strategy){
    strategy == null && (strategy = 'first');
    if (target == null) {
      return (function(){
        throw {
          message: "Unknown partner."
        };
      }());
    }
    return {
      request: function(message, data, response){
        var slot;
        if (response == null && typeof data === 'function') {
          response = data;
          data = undefined;
        }
        if (process.send != null) {
          slot = createUUID();
          if (response != null) {
            forwardSlots[slot] = response;
          }
          process.send({
            message: message,
            data: data,
            slotForward: slot,
            target: target,
            strategy: strategy
          });
        } else {
          if (response != null) {
            if (typeof response.call == 'function') {
              response.call(globalEvent, {
                message: "Partner doesn't have master.",
                target: target
              });
            }
          }
        }
      },
      send: function(message, data){
        if (process.send != null) {
          process.send({
            message: message,
            data: data,
            slotSend: true,
            target: target,
            strategy: strategy
          });
        }
      },
      register: function(callback){
        if (target == null) {
          return typeof response != 'undefined' && response !== null ? typeof response.call == 'function' ? response.call(globalEvent, {
            message: "Unknown partner."
          }) : void 8 : void 8;
        }
        if (process.send != null) {
          messageHandler.push(callback);
          process.send({
            register: true,
            slotMessage: true,
            target: target
          });
        }
      },
      unRegister: function(callback){
        if (target == null) {
          return typeof response != 'undefined' && response !== null ? typeof response.call == 'function' ? response.call(globalEvent, {
            message: "Unknown partner."
          }) : void 8 : void 8;
        }
        if (process.send != null) {
          messageHandler.splice(messageHandler.indexOf(callback), 1);
          process.send({
            register: false,
            slotMessage: true,
            target: target
          });
        }
      }
    };
  };
  globalEvent.select = function(target, strategy){
    strategy == null && (strategy = 'first');
    if (target == null) {
      return (function(){
        throw {
          message: "Unknown partner."
        };
      }());
    }
    return {
      request: function(message, data, response){
        var _url_info, resolvedFile, poolItem, index, address, i$, ref$, len$, item;
        _url_info = require("url").parse(target);
        resolvedFile = null;
        if (_url_info.protocol != null) {
          resolvedFile = target.replace(_url_info.protocol + "//", "");
          if (_url_info.protocol === 'file:') {
            resolvedFile = path.resolve(resolvedFile);
          }
        }
        if (response == null && typeof data === 'function') {
          response = data;
          data = undefined;
        }
        poolItem = [];
        index = -1;
        address = null;
        for (i$ = 0, len$ = (ref$ = processPool).length; i$ < len$; ++i$) {
          item = ref$[i$];
          if (item.getAlias() !== target && item.getAddress() !== resolvedFile) {
            continue;
          }
          address == null && (address = resolvedFile);
          index++;
          if (strategy === 'first' || strategy === index) {
            return item.request(message, data, response);
          }
          poolItem.push(item);
        }
        if (poolItem.length !== 0) {
          if (strategy === 'last') {
            return poolItem[poolItem.length - 1].request(message, data, response);
          }
          if (typeof strategy === 'number') {
            return poolItem[0].request(message, data, response);
          }
          if (strategy === 'random') {
            return poolItem[Math.floor(Math.random() * poolItem.length)].request(message, data, response);
          }
          if (strategy === 'next') {
            if (friendIndex[address] == null) {
              friendIndex[address] = 0;
            }
            index = friendIndex[address];
            friendIndex[address] = index + 1;
            if (index >= poolItem.length) {
              index = 0;
              friendIndex[address] = index + 1;
            }
            return poolItem[index].request(message, data, response);
          } else {
            if (typeof strategy === 'number') {
              return poolItem[0].request(message, data, response);
            }
          }
        } else {
          if (response != null) {
            if (typeof response.call == 'function') {
              response.call(globalEvent, {
                message: "Not found.",
                target: target
              });
            }
          }
        }
      },
      send: function(message, data, sendHandle){
        var _url_info, resolvedFile, poolItem, index, address, i$, ref$, len$, item;
        _url_info = require("url").parse(target);
        resolvedFile = null;
        if (_url_info.protocol != null) {
          resolvedFile = target.replace(_url_info.protocol + "//", "");
          if (_url_info.protocol === 'file:') {
            resolvedFile = path.resolve(resolvedFile);
          }
        }
        poolItem = [];
        index = -1;
        address = null;
        for (i$ = 0, len$ = (ref$ = processPool).length; i$ < len$; ++i$) {
          item = ref$[i$];
          if (item.getAlias() !== target && item.getAddress() !== resolvedFile) {
            continue;
          }
          address == null && (address = resolvedFile);
          index++;
          if (strategy === 'first' || strategy === index) {
            return item.send(message, data, sendHandle);
          }
          poolItem.push(item);
        }
        if (poolItem.length !== 0) {
          if (strategy === 'last') {
            return poolItem[poolItem.length - 1].send(message, data, sendHandle);
          }
          if (typeof strategy === 'number') {
            return poolItem[0].send(message, data, sendHandle);
          }
          if (strategy === 'random') {
            return poolItem[Math.floor(Math.random() * poolItem.length)].send(message, data, sendHandle);
          }
          if (strategy === 'next') {
            if (friendIndex[address] == null) {
              friendIndex[address] = 0;
            }
            index = friendIndex[address];
            friendIndex[address] = index + 1;
            if (index >= poolItem.length) {
              index = 0;
              friendIndex[address] = index + 1;
            }
            return poolItem[index].send(message, data, sendHandle);
          } else {
            if (typeof strategy === 'number') {
              return poolItem[0].send(message, data, sendHandle);
            }
          }
        } else {
          throw {
            message: "Not found.",
            target: target
          };
        }
      }
    };
  };
  globalEvent.create = function(url, alias){
    var _startSlots, _stopSlots, _partnerSlots, _forceExit, _address, _url, _url_info, _$, _opts, _args, _error, _partnerHandler, obj;
    _startSlots = {};
    _stopSlots = {};
    _partnerSlots = {};
    _forceExit = false;
    _address = null;
    _url = url;
    _url_info = require("url").parse(url);
    if (_url_info.protocol === 'file:') {
      _address = path.resolve(url.replace('file://', ""));
    }
    _$ = null;
    _opts = null;
    _args = [];
    _error = null;
    _partnerHandler = null;
    obj = new EventEmitter();
    obj.setOptions = function(opts){
      return _opts = opts;
    };
    obj.getOptions = function(){
      return _opts;
    };
    obj.setArguments = function(args){
      return _args = args;
    };
    obj.getArguments = function(){
      return _args;
    };
    obj.getUrl = function(){
      return _url;
    };
    obj.getAddress = function(){
      return _address;
    };
    obj.getAlias = function(){
      return alias;
    };
    obj.get = function(){
      return _$;
    };
    obj.start = function(data, cb){
      var self, slot;
      _error = {
        exit: 0,
        errors: []
      };
      if (cb == null && typeof data === 'function') {
        cb = data;
        data = undefined;
      }
      if (_$ == null) {
        processPool.push(obj);
        _forceExit = false;
        if (_url_info.protocol === "file:") {
          if (fs.existsSync(_address)) {
            _$ = child_process.fork(_address, _args, _opts);
          } else {
            return cb != null ? typeof cb.call == 'function' ? cb.call(obj, {
              message: "Not found.",
              url: url
            }) : void 8 : void 8;
          }
        }
        _$.on('error', function(error){
          obj.emit('error', error);
        });
        _$.on('exit', function(){
          var temp, i$, ref$, len$, item, index;
          temp = _partnerSlots;
          _partnerSlots = {};
          for (i$ = 0, len$ = (ref$ = Object.keys(temp)).length; i$ < len$; ++i$) {
            item = ref$[i$];
            if (typeof temp[item] == 'function') {
              temp[item]({
                message: "Partner is died.",
                url: obj.getUrl()
              });
            }
          }
          _$ = null;
          if (!_forceExit) {
            obj.emit('exit', _error, data);
          }
          for (i$ = 0, len$ = (ref$ = processPool).length; i$ < len$; ++i$) {
            index = i$;
            item = ref$[i$];
            if (Object.is(item, obj)) {
              return processPool.splice(index, 1);
            }
          }
        });
        _$.on('message', function(message){
          var _error, response, _url_info, target, action, poolItem, index, address, i$, ref$, len$, item, self, ref1$, ref2$;
          if (message.slotError != null) {
            _error = message.error;
          } else if (message.slotStart != null) {
            response = _startSlots[message.slotStart];
            delete _startSlots[message.slotStart];
            return response != null ? typeof response.call == 'function' ? response.call(obj, message.error, message.data) : void 8 : void 8;
          } else if (message.slotStop != null) {
            response = _stopSlots[message.slotStop];
            delete _stopSlots[message.slotStop];
            return response != null ? typeof response.call == 'function' ? response.call(obj, message.error, message.data) : void 8 : void 8;
          } else if (message.slotPartner != null) {
            response = _partnerSlots[message.slotPartner];
            delete _partnerSlots[message.slotPartner];
            return response != null ? typeof response.call == 'function' ? response.call(obj, message.error, message.data, message.message) : void 8 : void 8;
          } else if (message.slotForward != null) {
            _url_info = require("url").parse(message.target);
            target = null;
            if (_url_info.protocol != null) {
              target = message.target.replace(_url_info.protocol + "//", "");
              if (_url_info.protocol === 'file:') {
                target = path.resolve(target);
              }
            }
            action = function(item){
              item.request(message.message, message.data, function(error, data, message_){
                var self;
                self = _$;
                if (self != null) {
                  self.send({
                    message: message_,
                    data: data,
                    error: error,
                    slotForward: message.slotForward
                  });
                }
              });
            };
            poolItem = [];
            index = -1;
            address = null;
            for (i$ = 0, len$ = (ref$ = processPool).length; i$ < len$; ++i$) {
              item = ref$[i$];
              if (item.getAlias() !== message.target && item.getAddress() !== target) {
                continue;
              }
              address = target;
              index++;
              if (message.strategy === 'first' || message.strategy === index) {
                return action(item);
              }
              poolItem.push(item);
            }
            if (poolItem.length !== 0) {
              if (message.strategy === 'last') {
                return action(poolItem[poolItem.length - 1]);
              }
              if (typeof message.strategy === 'number') {
                return action(poolItem[0]);
              }
              if (message.strategy === 'random') {
                return action(poolItem[Math.floor(Math.random() * poolItem.length)]);
              }
              if (message.strategy === 'next') {
                if (friendIndex[address] == null) {
                  friendIndex[address] = 0;
                }
                index = friendIndex[address];
                friendIndex[address] = index + 1;
                if (index >= poolItem.length) {
                  index = 0;
                  friendIndex[address] = index + 1;
                }
                return action(poolItem[index]);
              } else {}
              if (typeof message.strategy === 'number') {
                return action(poolItem[0]);
              }
            } else {
              self = _$;
              if (self != null) {
                self.send({
                  message: message.message,
                  data: data,
                  error: {
                    message: "Not found.",
                    address: message.target
                  },
                  slotForward: message.slotForward
                });
              }
            }
          } else if (message.slotSend != null) {
            _url_info = require("url").parse(message.target);
            target = null;
            if (_url_info.protocol != null) {
              target = message.target.replace(_url_info.protocol + "//", "");
              if (_url_info.protocol === 'file:') {
                target = path.resolve(target);
              }
            }
            poolItem = [];
            index = -1;
            address = null;
            for (i$ = 0, len$ = (ref$ = processPool).length; i$ < len$; ++i$) {
              item = ref$[i$];
              if (item.getAlias() !== message.target && item.getAddress() !== target) {
                continue;
              }
              address = target;
              index++;
              if (message.strategy === 'first' || message.strategy === index) {
                return item.send(message.message, message.data);
              }
              poolItem.push(item);
            }
            if (poolItem.length !== 0) {
              if (message.strategy === 'last') {
                return poolItem[poolItem.length - 1].send(message.message, message.data);
              }
              if (typeof message.strategy === 'number') {
                return poolItem[0].send(message.message, message.data);
              }
              if (message.strategy === 'random') {
                return poolItem[Math.floor(Math.random() * poolItem.length)].send(message.message, message.data);
              }
              if (message.strategy === 'next') {
                if (friendIndex[address] == null) {
                  friendIndex[address] = 0;
                }
                index = friendIndex[address];
                friendIndex[address] = index + 1;
                if (index >= poolItem.length) {
                  index = 0;
                  friendIndex[address] = index + 1;
                }
                return poolItem[index].send(message.message, message.data);
              } else {}
              if (typeof message.strategy === 'number') {
                return poolItem[0].send(message.message, message.data);
              }
            }
          } else if (message.slotMaster != null) {
            if (_partnerHandler != null) {
              if (typeof _partnerHandler.call == 'function') {
                _partnerHandler.call(obj, message.message, message.data, function(error, data){
                  var self;
                  self = _$;
                  return self != null ? self.send({
                    message: message.message,
                    data: data,
                    error: error,
                    slotMaster: message.slotMaster
                  }) : void 8;
                });
              }
            } else {
              self = _$;
              if (self != null) {
                self.send({
                  message: message.message,
                  error: {
                    message: "Master doesn't handle.",
                    target: target
                  },
                  slotMaster: message.slotMaster
                });
              }
            }
          } else if (message.slotMessage != null) {
            _url_info = require("url").parse(message.target);
            target = message.target;
            if (_url_info.protocol != null) {
              target = message.target.replace(_url_info.protocol + "//", "");
              if (_url_info.protocol === 'file:') {
                target = path.resolve(target);
              }
            }
            if (message.register) {
              ((ref$ = messageSlots[target]) != null
                ? ref$
                : messageSlots[target] = []).push(obj);
            } else {
              if ((ref$ = messageSlots[target]) != null) {
                ref$.splice(messageSlots[target].indexOf(obj), 1);
              }
            }
          } else {
            if ((ref1$ = messageSlots[obj.getAddress()]) != null) {
              ref1$.forEach(function(item){
                item.send({
                  message: message.message,
                  slotMessage: true,
                  data: message.data
                });
              });
            }
            if ((ref2$ = messageSlots[obj.getAlias()]) != null) {
              ref2$.forEach(function(item){
                item.send({
                  message: message.message,
                  slotMessage: true,
                  data: message.data
                });
              });
            }
            obj.emit('message', message.message, message.data, true);
            return;
          }
        });
      }
      self = _$;
      slot = createUUID();
      if (cb != null) {
        _startSlots[slot] = cb;
      }
      if (self != null) {
        self.send({
          start: true,
          data: data,
          slotStart: slot
        }, null);
      }
    };
    obj.stop = function(data, cb){
      var self, slot;
      if (cb == null && typeof data === 'function') {
        cb = data;
        data = undefined;
      }
      self = _$;
      slot = createUUID();
      if (cb != null) {
        _stopSlots[slot] = cb;
      }
      if (self != null) {
        self.send({
          stop: true,
          data: data,
          slotStop: slot
        }, null);
      }
    };
    obj.send = function(message, data, sendHandle){
      var self;
      self = _$;
      if (self != null) {
        self.send({
          message: message,
          data: data
        }, sendHandle);
      }
    };
    obj.request = function(message, data, response){
      var self, slot;
      if (response == null && typeof data === 'function') {
        response = data;
        data = undefined;
      }
      if (_$ == null) {
        return response != null ? typeof response.call == 'function' ? response.call(obj, {
          message: "Partner isn't ready",
          url: obj.getAddress()
        }) : void 8 : void 8;
      }
      self = _$;
      slot = createUUID();
      if (response != null) {
        _partnerSlots[slot] = response;
      }
      if (self != null) {
        self.send({
          message: message,
          data: data,
          slotPartner: slot
        });
      }
    };
    obj.handle = function(cb){
      _partnerHandler = cb;
    };
    obj.broadcast = function(message, data, sendHandle){
      var i$, ref$, len$, item;
      for (i$ = 0, len$ = (ref$ = processPool).length; i$ < len$; ++i$) {
        item = ref$[i$];
        if (Object.is(item, obj)) {
          continue;
        }
        item.send(message, data, sendHandle);
      }
    };
    obj.exit = function(){
      var self, i$, ref$, len$, index, item;
      _forceExit = true;
      self = _$;
      if (self != null) {
        self.send('exit', null);
      }
      _$ = null;
      for (i$ = 0, len$ = (ref$ = processPool).length; i$ < len$; ++i$) {
        index = i$;
        item = ref$[i$];
        if (Object.is(item, obj)) {
          return processPool.splice(index, 1);
        }
      }
    };
    return obj;
  };
  return globalEvent;
}.call(this));
