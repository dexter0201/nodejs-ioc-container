'use strict';

var util = require('./util');

function Dependable(container, deps, action) {
    this.container = container;
    this.deps = deps;
    this.action = action;
    this.resolved = null;
}

Dependable.prototype.destroy = function () {
    if (this.container.resolved && this.container.resolved[this.name] === this) {
        delete this.container.resolved[this.name];
    }
    
    if (this.container.unresolved && this.container.unresolved[this.name] === this) {
        delete this.container.unresolved[this.name];
    }
    
    this.resolved = null;
    this.action = null;
    this.deps = null;
    this.container = null;
};

Dependable.prototype.onResolved = function () {
    throw new Error('onResolved methods must be overridden');
};

Dependable.prototype.onUnResolved = function () {
    throw new Error('onUnResolved methods must be overridden');
};

Dependable.prototype.resolve = function () {
    if (this.resolved !== null) {
        return;
    }
    
    this.resolved = [];
    util.forEachArrayConditionally(this.deps, this.tryResolve.bind(this));
    
    if (this.resolved !== null) {
        if (this.resolved && this.resolved.length !== this.deps.length) {
            var errMsg = 'How come there is ' + this.resolved.length + ' resolveds on ' + this.deps.length + ' deps?';
            
            throw new Error(errMsg);
        }
        
        this.onResolved();
    } else {
        this.onUnResolved();
    }
};

Dependable.prototype.tryResolve = function (depName) {
    var resolve = this.container.resolved[depName];
    
    if (typeof resolve === 'undefined') {
        this.resolved = null;
        
        return false;
    }
    
    this.resolved.push(resolve.fire());
};

Dependable.prototype.fire = function () {
    return (typeof this.action === 'function') ? this.runAction() : this.action;
};

Dependable.prototype.runAction = function () {
    return this.action.apply(null, this.resolved);
};

module.exports = Dependable;