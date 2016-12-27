'use strict';

var Container = require('./container');
var containerInstance = null;

function getContainer() {
    if (containerInstance === null) {
        containerInstance = new Container();
    }
    
    return containerInstance;
}

module.exports = {
    getContainer: getContainer
};