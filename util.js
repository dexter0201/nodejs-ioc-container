'use strict';

function Util() {
}

Util.inherit = function (a, b) {
    a.prototype = Object.create(b.prototype, {
        'constructor': {
            value: a,
            enumerable: false,
            configurable: false,
            writable: false
        }
    });
};

Util.forEachArrayConditionally = function (arr, func) {
    var l = arr.length, a, ret, i;
    
    for (i = 0; i < l; i += 1) {
        a = arr[i];
        
        if (typeof a !== 'undefined') {
            ret = func(a, i, arr);
        
            if (typeof ret !== 'undefined') {
                return ret;
            }
        }
    }
};

module.exports = Util;