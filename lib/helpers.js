'use strict';

exports.yell = function (msg) {
    return msg.toUpperCase();
};

exports.setChecked = function (value, currentValue) {
    if(value == currentValue) {
       return "checked"
    } else {
       return "";
 		}
 };

 exports.getGravatarURL = function (user, size) {
 		return user.gravatar(size);
 }