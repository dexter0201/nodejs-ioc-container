'use strict';

var Dependable = require('./dependable');
var uitl = require('./util');

function Dependency(container, name, deps, action) {
    this.name = name;
    this.hasResult = false;
    this.result = null;
    Dependable.call(this, container, deps, action);
}

uitl.inherit(Dependency, Dependable);

Dependency.prototype.destroy = function () {
    Dependable.prototype.destroy.call(this);
    this.hasResult = null;
    this.result = null;
    this.name = null;
};

Dependency.prototype.fire = function () {
    return this.hasResult ? this.result : Dependable.prototype.fire.call(this);
};

Dependency.prototype.runAction = function () {
    this.hasResult = true;
    this.result = Dependable.prototype.runAction.call(this);
    this.resolved = null;
    this.action = null;
    this.deps = null;
    
    return this.result;
};

Dependency.prototype.onResolved = function () {
    this.container.notifyResolved(this);
};

Dependency.prototype.onUnResolved = function () {
    this.container.unResolved[this.name] = this;
};

module.exports = Dependency;