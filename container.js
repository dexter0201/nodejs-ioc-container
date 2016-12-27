'use strict';

var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
var Dependency = require('./dependency');
var Consumer = require('./consumer');

function Container() {
    this.resolved = {};
    this.unResolved = {};
    this.consumers = [];
}

function destroyAndDelete(obj, name) {
    obj[name].destroy();
    delete obj[name];
}

Container.prototype.destroy = function () {
    var name;
    
    while (this.consumers.length) {
        this.consumers.pop().destroy();
    }
    
    this.consumers = null;
    
    for (name in this.unResolved) {
        destroyAndDelete(this.unResolved, name);
    }
    
    this.unResolved = null;
    
    for (name in this.resolved) {
        destroyAndDelete(this.resolved, name);
    }
    
    this.resolved = null;
};

Container.prototype.getParamNames = function (func) {
    var fnName = func.toString().replace(STRIP_COMMENTS, ''),
        result = fnName.slice(fnName.indexOf('(') + 1, fnName.indexOf(')')).match(ARGUMENT_NAMES);
    
    if (result === null) {
        result = [];
    }
        
    return result;
};

Container.prototype.register = function (name, resolver) {
    var deps = [],
        dep;
    
    if (typeof resolver === 'function') {
        if (resolver.length) {
            deps = this.getParamNames(resolver);
        }
    }
    
    dep = new Dependency(this, name, deps, resolver);
    dep.resolve();
};

Container.prototype.get = function (depName) {
    var resolve = this.resolved[depName];
    
    if (resolve) {
        return resolve.fire();
    }
    
    return null;
};

Container.prototype.resolve = function (consumer) {
    if (typeof consumer === 'function') {
        return null;
    }
    
    var deps,
        action,
        c;
    
    if (typeof consumer !== 'object' || !(consumer instanceof Array)) {
        deps = Array.prototype.slice.call(arguments);
    } else {
        deps = consumer;
    }
    
    action = deps.pop();
    
    if (typeof action !== 'function') {
        return this.get(consumer);
    }
    
    c = new Consumer(this, deps, action);
    c.resolve();
};

Container.prototype.notifyResolved = function (dependable) {
    var i, consumers, consumer;
    
    delete this.unResolved[dependable.name];
    
    this.resolved[dependable.name] = dependable;
    
    for (i in this.unResolved) {
        this.unResolved[i].resolve();
    }
    
    consumers = this.consumers;
    this.consumers = [];
    
    while (consumers.length) {
        consumer = consumers.pop();
        
        if (consumer.action) {
            consumer.resolve();
        }
    }
};

Container.prototype.unRegister = function (depName) {
    var resolve = this.resolved[depName];
    
    if (resolve) {
        destroyAndDelete(this.resolved, depName);
    }
    
    this.consumers.forEach(function (consumer) {
        console.log(consumer);
    });
};

module.exports = Container;