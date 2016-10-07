
var existsSync, fs, path, ref;

path = require('path');

fs = require('fs');

existsSync = (ref = fs.existsSync) != null ? ref : path.existsSync;

exports.container = function() {
    var argList, container, factories, get, haveVisited, list, load, loaddir, loadfile, modules, notEmpty, register, registerOne, resolve, toFactory;
    factories = {};
    modules = {};
    register = function(name, func) {
        var hash, results;
        if (name === Object(name)) {
            hash = name;
            results = [];
            for (name in hash) {
                func = hash[name];
                results.push(registerOne(name, func));
            }
            return results;
        } else {
            return registerOne(name, func);
        }
    };
    registerOne = function(name, func) {
        if (func == null) {
            throw new Error("cannot register null function");
        }
        return factories[name] = toFactory(func);
    };
    list = function() {
        return factories;
    };
    load = function(file) {
        var exists, stats;
        exists = existsSync(file);
        if (exists) {
            stats = fs.statSync(file);
            if (stats.isDirectory()) {
                return loaddir(file);
            }
        }
        return loadfile(file);
    };
    loadfile = function(file) {
        var module, name;
        module = file.replace(/\.\w+$/, "");
        name = path.basename(module).replace(/\-(\w)/g, function(match, letter) {
            return letter.toUpperCase();
        });
        return modules[name] = module;
    };
    loaddir = function(dir) {
        var file, filenames, files, i, len, results, stats;
        filenames = fs.readdirSync(dir);
        files = filenames.map(function(file) {
            return path.join(dir, file);
        });
        results = [];
        for (i = 0, len = files.length; i < len; i++) {
            file = files[i];
            if (!file.match(/\.(js|coffee)$/)) {
                continue;
            }
            stats = fs.statSync(file);
            if (stats.isFile()) {
                results.push(loadfile(file));
            } else {
                results.push(void 0);
            }
        }
        return results;
    };
    toFactory = function(func) {
        if (typeof func === "function") {
            return {
                func: func,
                required: argList(func)
            };
        } else {
            return {
                func: function() {
                    return func;
                },
                required: []
            };
        }
    };
    argList = function(func) {
        var match, required;
        match = func.toString().match(/function.*?\(([\s\S]*?)\)/);
        if (match == null) {
            throw new Error("could not parse function arguments: " + (func != null ? func.toString() : void 0));
        }
        required = match[1].split(",").filter(notEmpty).map(function(str) {
            return str.trim();
        });
        return required;
    };
    notEmpty = function(a) {
        return a;
    };
    get = function(name, overrides, visited) {
        var dependencies, factory, instance, isOverridden, module;
        if (visited == null) {
            visited = [];
        }
        isOverridden = overrides != null;
        if (haveVisited(visited, name)) {
            throw new Error("circular dependency with '" + name + "'");
        }
        visited = visited.concat(name);
        factory = factories[name];
        if (factory == null) {
            module = modules[name];
            if (module != null) {
                register(name, require(module));
                factory = factories[name];
            } else {
                throw new Error("dependency '" + name + "' was not registered");
            }
        }
        if ((factory.instance != null) && !isOverridden) {
            return factory.instance;
        }
        dependencies = factory.required.map(function(name) {
            if ((overrides != null ? overrides[name] : void 0) != null) {
                return overrides != null ? overrides[name] : void 0;
            } else {
                return get(name, overrides, visited);
            }
        });
        instance = factory.func.apply(factory, dependencies);
        if (!isOverridden) {
            factory.instance = instance;
        }
        return instance;
    };
    haveVisited = function(visited, name) {
        var isName;
        isName = function(n) {
            return n === name;
        };
        return visited.filter(isName).length;
    };
    resolve = function(overrides, func) {
        if (!func) {
            func = overrides;
            overrides = null;
        }
        register("__temp", func);
        return get("__temp", overrides);
    };
    container = {
        get: get,
        resolve: resolve,
        register: register,
        load: load,
        list: list
    };
    container.register("_container", container);
    return container;
};
