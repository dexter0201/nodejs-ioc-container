nodejs-ioc-container
===================

This project will be supported:
* Ioc Container
* Lazy Dependencies loading

Usage
-----------------

#### Create a Container
A Container is a single unit of dependency handling. It registers dependencies and resolves them for dependency consumers.
```javascript
var container = require('nodejs-ioc-container').getContainer();

container.register(...
container.resolve(...
container.get(...
container.destroy();
```

#### Register a Dependency
```javascript
container.register('connection', connection);
```
`connection` is either an object or a function that will return a connection object.
You cannot register functions that will depend on other dependencies - this you can do with v1.0.0 - https://github.com/dexter0201/nodejs-ioc-container/releases/tag/v1.0.0


#### Consume dependencies
##### get
Use `get` when you need to check if the dependency is registered, because `get` returns immediately.
```javascript
container.get('connection', function(connection) {
    if (!connection) {
  
    } else {
  
    }
});
```
In the above example, if the `get` is called before connection is registered, you will get `null`.

##### resolve
If you have a function that needs a connection, use
```javascript
container.resolve('connection', function(connection) {/*use connection*/});
```
`resolve` also supports the "Array notation":
```javascript
container.resolve(['connection', function (connection){/*use connection*/});
```
and, of course, the "dependable notation":
```javascript
container.resolve(function(connection) {/*use connection*/});
```
**tldr**: if `resolve` gets a function as a first parameter, it will stringify/parse it to read the names of dependables you need.

##### Chain dependency providers
You can register functions that will depend on other dependencies and chain dependency providers. For example, if you cannot provide a `database` without obtaining a `configuration` first, you register your `database` provider in the following manner:
```javascript
container.register('database',function (configuration) {
  //use the configuration to produce your database connection
  var database = createDatabase(configuration);
  //and finally
  return database;
});
```

