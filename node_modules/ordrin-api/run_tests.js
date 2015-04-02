(function(){
  "use strict";

  var argv = require("optimist").argv;
  var reporter = require("nodeunit").reporters.default;

  if(argv.group){
    console.log(argv.group);
    process.env.ORDRIN_NODE_TEST_GROUP = argv.group;
  } else if(argv.endpoint){
    process.env.ORDRIN_NODE_TEST_ENDPOINT = argv.endpoint;
  } else if(argv._){
    process.env.ORDRIN_NODE_TEST_NAMES = argv._.join(",");
  }

  reporter.run(["test.js"]);
}());
