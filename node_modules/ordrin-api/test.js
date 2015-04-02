(function(){
  "use strict";
  
  var _ = require("underscore");
  var fs = require("fs");
  var JaySchema = require("jayschema");
  var jayschema = new JaySchema();
  
  exports.setUp = function(callback){
    var ordrin = require("./");
    this.ordrin_api = new ordrin.APIs("2HGAzwbK5IWNJPRN_c-kvbqtfGhS-k2a6p-1Zg2iNN4");
    callback();
  };

  function getTrayItem(menu){
    var item;
    _.each(menu, function(category){
      var result;
      if(category.is_orderable == 1){
        if(parseFloat(category.price)>=5){
          item = category.id;
        }
      } else if(category.children){
        result = getTrayItem(category.children);
        if(result){
          item = result;
        }
      }
    });
    return item;
  }

  var json_data = JSON.parse(fs.readFileSync('./tests.json'));

  var test_cases = json_data.tests;
  var data = {};
  data.funcs = {
    gen_email : function(){
      return "test_node+" + Date.now() + "@ordr.in";
    },
    gen_tray : function(menu){
      return getTrayItem(menu).toString() + "/10";
    },
    tomorrow : function(){
      var date = new Date(Date.now() + 86400000);
      var monthNum = (date.getMonth()+1).toString();
      if(monthNum.length == 1){
        monthNum = "0" + monthNum;
      }
      var dateNum = date.getDate().toString();
      if(dateNum.length == 1){
        dateNum = "0" + dateNum;
      }
      return monthNum + "-" + dateNum;
    }
  };
  data.output = {};
  data.data = json_data.data;
  _.each(data.data, function(group){
    _.each(group, function(value, name){
      if(_.isArray(value)){
        group[name] = data.funcs[value[0]](null, value.slice(1));
        console.log(name + ": " + group[name]);
      }
    });
  });

  function deepGet(obj, route){
    route = route.replace(/\[[\'\"]?(\w+)[\'\"]?\]/, '.$1');
    _.each(route.split('.'), function(word){
      obj = obj[word];
    });
    return obj;
  };

  function fixValue(value){
    var pointer;
    if(_.isArray(value)){
      pointer = deepGet(data, value[0]);
      if(_.isFunction(pointer)){
        value = pointer.apply(null, _.map(value.slice(1), fixValue));
      } else {
        value = pointer;
      }
    }
    return value;
  };

  function fixInput(input){
    _.each(input, function(value, name){
      input[name] = fixValue(value).toString();
    });
    return input;
  };

  function isSubset(sub, set){
    return _.all(sub, _.partial(_.contains, set));
  };

  function getTestOrder(test_cases, targets){
    var tests, queue, order, item, to_run;
    tests = _.object(_.map(test_cases, function(test){
      return [test.name, test];
    }));
    if(_.isUndefined(targets)){
      queue = _.pluck(test_cases, "name");
      order = _.filter(queue, function(name){
        return _.isEmpty(tests[name].dependencies);
      });
      queue = _.difference(queue, order);
      while(!_.isEmpty(queue)){
        order = order.concat(_.filter(queue, function(name){
          return isSubset(tests[name].dependencies, order) && isSubset(tests[name].soft_dependencies, order);
        }));
        if(_.isEmpty(_.intersection(queue, order))){
          throw new Error("Dependency cycle detected: " + JSON.stringify(queue)+";"+JSON.stringify(order));
        }
        queue = _.difference(queue, order);
      }
      return order;
    } else {
      to_run = targets;
      queue = _.filter(_.flatten(_.pluck(_.values(_.pick(tests, targets)), "dependencies")), _.isString);
      console.log(queue);
      while(!_.isEmpty(queue)){
        item = queue.shift();
        to_run.push(item);
        queue.push.apply(queue, tests[item].dependencies);
      }
      return _.filter(getTestOrder(test_cases), _.partial(_.contains, to_run));
    }
  };
  var tests = _.object(_.map(test_cases, function(test){
    return [test.name, test];
  }));
  var order;
  if(process.env.ORDRIN_NODE_TEST_NAMES){
    order = getTestOrder(test_cases, process.env.ORDRIN_NODE_TEST_NAMES.split(","));
  } else if(process.env.ORDRIN_NODE_TEST_ENDPOINT){
    order = getTestOrder(test_cases, _.pluck(_.where(test_cases, {"function" : process.env.ORDRIN_NODE_TEST_ENDPOINT}), "name"));
  } else if(process.env.ORDRIN_NODE_TEST_GROUP){
    order = getTestOrder(test_cases, _.pluck(_.where(test_cases, {"group" : process.env.ORDRIN_NODE_TEST_GROUP}), "name"));
  } else {
    order = getTestOrder(test_cases);
  }
  _.each(order, function(test_name){
    var test_case = tests[test_name];
    exports["test_"+test_case.name] = function(test){
      test.expect(3);
      this.ordrin_api[test_case["function"]](fixInput(test_case.input), function(error, output){
        data.output[test_case.name] = output;
        if(test_case.output.success === null){
          if(error){
            var validation = jayschema.validate(error, test_case.output.schema);
            test.ok(_.isEmpty(validation), test_case["function"]+" error different from expected: " + JSON.stringify(validation));
            test.ok((new RegExp(test_case.output.success_regex)).test(JSON.stringify(error)), "Did not match regex");
          } else {
            var validation = jayschema.validate(output, test_case.output.schema);
            test.ok(_.isEmpty(validation), test_case["function"]+" returned improperly formatted output: "+JSON.stringify(validation));
            test.ok((new RegExp(test_case.output.fail_regex)).test(JSON.stringify(output)), "Did not match regex");
          }
          test.ok(true, "I needed a third test");
        } else if(test_case.output.success){
          test.ok(!error, test_case["function"]+" failed with error "+JSON.stringify(error));
          if(!error){
            var validation = jayschema.validate(output, test_case.output.schema);
            test.ok(_.isEmpty(validation), test_case["function"]+" returned improperly formatted output: "+JSON.stringify(validation));
            test.ok((new RegExp(test_case.output.success_regex)).test(JSON.stringify(output)), "Did not match regex");
          }
        } else {
          test.ok(error, test_case["function"]+" with input "+JSON.stringify(test_case.input)+" succeeded unexpectedly.");
          var validation = jayschema.validate(error, test_case.output.schema);
          test.ok(_.isEmpty(validation), test_case["function"]+" error different from expected: " + JSON.stringify(validation));
          test.ok((new RegExp(test_case.output.fail_regex)).test(JSON.stringify(error)), "Did not match regex");
        }
        test.done();
      });
    };
  });
}());
