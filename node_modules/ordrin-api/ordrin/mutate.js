(function(){
  var crypto = require('crypto');
  exports.sha256 = function(value){
    return crypto.createHash('sha256').update(value).digest('hex');
  };

  exports.state = function(value){
    return value.toUpperCase();
  };

  exports.phone = function(value){
    return value.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3');
  };

  exports.identity = function(value){
    return value;
  };
})();
