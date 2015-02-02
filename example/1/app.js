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
