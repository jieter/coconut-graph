var util = {
    extend: require('extend'),
    template: require('./template.js'),

    // create an object from a given prototype
    create: Object.create || function () {
        function F() {}
        return function (proto) {
            F.prototype = proto;
            return new F();
        };
    },

    setOptions: function (obj, options) {
        obj.options = util.extend({}, obj.options, options);
        return obj.options;
    }
};

module.exports = util;
