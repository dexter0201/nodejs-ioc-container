'use strict';

var Dependable = require('./dependable');
var util = require('./util');

function Consumer(container, deps, action) {
    if (typeof action !== 'function') {
        console.log(deps, action);
        throw new Error('Consumer must provide a consumer function');
    }
    
    Dependable.call(this, container, deps, action);
}

util.inherit(Consumer, Dependable);

Consumer.prototype.onResolved = function () {
    this.fire();
    this.destroy();
};

Consumer.prototype.onUnResolved = function () {
    this.container.consumers.push(this);
};

module.exports = Consumer;