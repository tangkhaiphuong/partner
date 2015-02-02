# partner 

Wrapping `require("child_process")` module. Supporting to manage child process status such as start, 
stop. Handle message, exit status, request/response between parent and child.

Installation
----
    npm install partner
Usage
====
`var partner = require("partner");`

### partner.on("start", function(data, master, done){ })

Handling start event.

`start` start event.

`function(data, master, done)` callback function.

* `data` Start argument.
* `master` false it is child process otherwise callback is invoked from `partner.start([data], [function(error){ }])`
* `done(error)` callback notify to master.

### partner.on("stop", function(data, master, done)){ })

Handling stop event.

`stop` stop event.

`function(data, master, done)` callback function.

* `data` Stop argument.
* `master` false it is child process otherwise callback is invoked from `partner.stop([data], [function(error){ }])`
* `done(error)` callback notify to master.

### partner.on("message", function(message, data, master){ })

Handling message.

`message` message event.

`function(message, data, master)` callback function.

* `message` Message name.
* `data` Data payload
* `master` false it is child process otherwise callback is invoked from `partner.send(message, data, [sendHandle])`

### partner.handle(`function(message, data, response){ }`)

Handling request from parent

`function(message, data, response)` callback function.

* `message` Message name.
* `data` Data payload
* `response` Callback function(error, data). Invoke to send response to parent.

### partner.request(message, data, `function(error, data, message){ }`)

Request parent handle.

* `message` Message name.
* `data` Data payload
* `function(error, data, message)` callback function.

### partner.with(`modulePath|alias`, [strategy])

Asking parent dispatches request/message from other children by module path or alias.

* `module|alias` Module file path or alias to handle request.
* `strategy` Strategy for select partner to handle. There are: "first", "last", "next", "random", index-number

`var friend = partner.with("modulePath", [strategy])`

* `friend.request(message, data, function(error, data, message)){ }`) Request handle
* `friend.send(message, data, [sendHandle])` Send message.
* `friend.register(function(message, data) { ... })` Register handle message.
* `friend.unRegister(function(message, data) { ... })` Unregister handle message.

### partner.select(`modulePath|alias`, [strategy]);

Select a child by file path or alias and request handle with strategy.

* `module|alias` Module file path or alias to handle request.
* `strategy` Strategy for select partner to handle. There are: "first", "last", "next", "random", index-number

`var child = partner.select("modulePath", [strategy])`

* `child.request(message, data, function(error, data, message)){ }`) Request handle
* `child.send(message, data, [sendHandle])` Send message.

### partner.send(message, data, [sendHandle])

Sending message. If itself is child process then send back to parent, otherwise raise "message" event for itself.

* `message` Message in string format.
* `data` Data payload.

### partner.broadcast(message, data, [sendHandle])

Sending message for all children process.

* `message` Message in string format.
* `data` Data payload.

### partner.stop([data], [function(error){}])

Sending current process. If itself is child process then do nothing, otherwise raise "stop" event for itself.

* `data` Optional data payload.
* `function(error)` callback function.

### partner.start([data], [function(error){}])

Start current process. If itself is child process then do nothing, otherwise raise "start" event for itself.

* `data` Optional data payload.
* `function(error)` callback function.

### partner.list(): Array

List all children process.

### partner.create(`modulePath`, [alias]): object

Create child process with JavaScript file path, alias. Return new partner object with methods:

`var child = partner.create("file://./child.js");`

* `child.setOptions(options)` set options for child process like: `child_process.fork(modulePath, [args], [options])`.

* `child.getOptions()` get options.

* `child.setArguments(args)` set arguments for child process like: `child_process.fork(modulePath, [args], [options])`.

* `child.getArguments()` get arguments.

* `child.getFile()` get absolute file path.

* `child.get()` get ChildProcess object.

* `child.start([data], [callback])` start child process with argument data. Callback if partner invoke done([error], 
[data])

* `child.stop([data], [callback])`  stop child process with argument data. Callback if partner invoke done([error], [data])

* `child.send(message, data, [sendHandle])` send message to child process with data and sendHandler

* `child.request(message, data, function(error, data, message){ })` request child process message and waiting for
response in callback.

* `child.broadcast(message, data, [sendHandle])` send message to all children process except itself with data and 
sendHandler.

* `child.exit()` force child process must stop.

* `child.on("message", function(message, data){} )` handle message event is sent back from child.

* `child.on("exit", function(errors, data){} )` handle exit event if child is kill or die. Data is start data.

* `child.handle(function(message, data, response){ })` handle request from child.

# Examples

<pre><code>
var partner, child;
partner = require("../../lib/partner");
child = partner.create("file://" + __filename);
/* Handle child message. */
child.on("message", function(message, data){
  /* Go message from child. */
  console.log("------------------------------");
  return console.log("[Child::Message]: Got message from child: " + JSON.stringify({
    message: message,
    data: data
  }));
});
/* Handle child exit. */
child.on("exit", function(errors, data){
  /* Go message from child. */
  console.log("[Child::Exit]: Child is killed. Start again with arguments: " + JSON.stringify(data));
  /* Start again. */
  this.start(data);
  return console.log("------------------------------");
});
/* Handle child request. */
child.handle(function(message, data, response){
  /* Go request from child. */
  console.log("[Master::Request]: Got request from child: " + JSON.stringify({
    message: message,
    data: data
  }));
  switch (message) {
  case "Multiply":
    return response(null, data.first * data.second);
  default:
    return response("Master don't handle it!");
  }
});
/* Handle start event. */
partner.on("start", function(data, master){
  if (master) {
    console.log("[Start]: I'm master: " + JSON.stringify(data));
    /* Start child if itself is master. */
    child.start("Child::Start", function(error){
      console.log("[Start]: Got error: ", error);
      process.exit();
    });
    /* Send message to child. */
    child.send("Hello", "How are you?");
    console.log("------------------------------");
    /* Request message to child process. */
    child.request("Sum", {
      first: 1,
      second: 2
    }, function(error, data, message){
      console.log("------------------------------");
      if (error != null) {
        return console.error("[" + message + "::Master::Response]: Got error: ", error);
      }
      return console.log("[" + message + "::Master::Response]: " + JSON.stringify({
        message: message,
        data: data
      }));
    });
    /* Request message to child process with no handle. */
    child.request("NoHandler", "Data", function(error, data, message){
      console.log("------------------------------");
      if (error != null) {
        return console.error("[" + message + "::Master::Response]: Got error: ", error);
      }
      return console.log("[" + message + "::Master::Response]: " + JSON.stringify({
        message: message,
        data: data
      }));
    });
    /* Stop entry point after 6 second. */
    setTimeout(function(){
      console.log("------------------------------");
      return partner.stop("Master::Stop");
    }, 3000);
    /* Kill child after 2 second. */
    return setTimeout(function(){
      console.log("------------------------------");
      console.log("            child.get().kill()");
      return child.get().kill();
    }, 2000);
  } else {
    console.log("[Start]: I'm child: " + JSON.stringify(data));
    console.log("------------------------------");
    partner.send("???", "Who am I?");
    /* Ask master request. */
    partner.request("Multiply", {
      first: 10,
      second: 10
    }, function(error, data, message){
      console.log("------------------------------");
      if (error != null) {
        return console.error("[" + message + "::Child::Response]: Got error: ", error);
      }
      return console.log("[" + message + "::Child::Response]: " + JSON.stringify({
        message: message,
        data: data
      }));
    });
    /* Request message to child process with no handle. */
    return partner.request("Reject", "Data", function(error, data, message){
      console.log("------------------------------");
      if (error != null) {
        return console.error("[" + message + "::Child::Response]: Got error: ", error);
      }
      return console.log("[" + message + "::Child::Response]: " + JSON.stringify({
        message: message,
        data: data
      }));
    });
  }
});
/* Handle stop event. */
partner.on("stop", function(data, master){
  if (master) {
    /* Stop child if itself is master. */
    child.stop("Child::Stop");
    console.log("[Stop]: I'm master: " + JSON.stringify(data));
    /* Stop child after 1 second. */
    setTimeout(function(){
      console.log("------------------------------");
      console.log("            child.stop('Child::Stop')");
      return child.stop("Child::Stop");
    }, 2000);
    /* Force kill child after 3 second. */
    return setTimeout(function(){
      console.log("------------------------------");
      console.log("            child.exit()");
      return child.exit();
    }, 3000);
  } else {
    return console.log("[Stop]: I'm child: " + JSON.stringify(data));
  }
});
/* Handle message event. */
partner.on('message', function(message, data, master){
  if (master) {
    return console.log("[Message]: Got message from itself: " + JSON.stringify({
      message: message,
      data: data
    }));
  } else {
    return console.log("[Message]: Got message from parent: " + JSON.stringify({
      message: message,
      data: data
    }));
  }
});
/* Handle default request */
partner.handle(function(message, data, response){
  /* Go request from child. */
  console.log("[Child::Request]: Got request from parent: " + JSON.stringify({
    message: message,
    data: data
  }));
  switch (message) {
  case "Sum":
    return response(null, data.first + data.second);
  default:
    return response("I don't handle it!");
  }
});
/* Start entry point. */
partner.start("Master::Start");

</code></pre>

# TODO
* Support socket.io to connect other process cross network.

# License

MIT

