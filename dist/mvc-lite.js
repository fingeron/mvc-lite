(function(global) {

    global.Config = {
        viewOptions: {
            templatesFolder: 'app'
        }
    };

})(Function('return this')());
(function(global) {

    var ArrayFunctions = {
        clean: function(arr) {
            if(!Array.isArray(arr))
                throw { message: "[Array:Clean] Cannot work with a non-array!" };

            for(var i = 0; i < arr.length; i++) {
                if(arr[i] === undefined) {
                    arr.splice(i, 1);
                    i--;
                } else if(Array.isArray(arr[i]))
                    this.clean(arr[i]);
            }
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Array = ArrayFunctions;

})(Function('return this')());
(function(global) {

    var Http = {
        get: function(url, data, callback) {
            var xhr = new XMLHttpRequest();

            if(typeof data.headers === 'object') {
                for(var header in data.headers) if(data.headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, data.headers[header]);
                }
            }
            if(typeof data.params === 'object') {
                var urlParams = '?';
                for(var param in data.params) if(data.params.hasOwnProperty(param)) {
                    urlParams += param + '=' + data.params[param] + '&';
                }
                url += urlParams;
            }

            xhr.open('GET', url, true);

            xhr.onreadystatechange = function() {
                if(xhr.status === 200 && xhr.readyState === 4) {
                    callback(JSON.parse(xhr.responseText));
                }
            };
            xhr.send();
        },
        post: function(url, data, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);

            // analyse request data
            if(typeof data.headers === 'object') {
                for(var header in data.headers) if(data.headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, data.headers[header]);
                }
            }

            if (typeof data.body === 'object') {
                data = data.body;
            }

            xhr.onreadystatechange = function() {
                if(xhr.status === 200 && xhr.readyState === 4) {
                    callback(JSON.parse(xhr.responseText));
                }
            };
            xhr.send(JSON.stringify(data));
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Http = Http;

})(Function('return this')());
(function(global) {

    var ObjectFuncs = {
        updateObject: function(origin, update, ignore) {
            if(origin && update) {
                var changes = 0;
                if(typeof origin === 'object' && typeof update === 'object') {
                    for(var property in update) if(update.hasOwnProperty(property) && !isIgnored(property)) {
                        switch(typeof update[property]) {
                            case 'object':
                                if(Array.isArray(update[property])) {
                                    console.warning('[Utils:Object] "updateObject" does not support merging arrays.');
                                } else
                                    changes += ObjectFuncs.updateObject(origin[property], update[property]);
                                break;
                            default:
                                if(origin[property] !== update[property]) {
                                    origin[property] = update[property];
                                    changes++;
                                }
                                break;
                        }
                    }
                }
            }

            function isIgnored(property) {
                if(Array.isArray(ignore)) {
                    for(var i = 0; i < ignore.length; i++) {
                        if(property === ignore[i]) {
                            return true;
                        }
                    }
                } else if(property === ignore)
                    return true;

                return false;
            }

            return changes;
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Object = ObjectFuncs;

})(Function('return this')());
(function(global) {

    var Observable = function() {
        this.listeners = [];
        this.lastMessage = undefined;
    };

    Observable.prototype = {
        subscribe: function(listener) {
            if(typeof listener === 'function') {
                this.listeners.push(listener);
                return {
                    unsubscribe: this.unsubscribe.bind(this, listener)
                }
            }
            else
                console.error(listener, 'is not a function. Cannot subscribe to Observable.');
        },

        unsubscribe: function(listener) {
            for(var i = this.listeners.length - 1; i >= 0; i--) {
                if(this.listeners[i] === listener)
                    this.listeners.splice(i, 1);
            }
        },

        next: function(value) {
            this.listeners.forEach(function(listener) {
                listener(value);
            });
            this.lastMessage = value;
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Observable = Observable;

})(Function('return this')());
(function(global) {

    var String = {
        // "name: Tal, city: Or Yehuda" ---> [{key: name, value: Tal}, {key: city, value: "Or Yehuda"}]
        toKeyValueArray: function(str, separator) {
            if(typeof separator !== 'string')
                separator = ',';
            var entries = str.split(separator),
                matchGroups,
                arr = [];
            entries.forEach(function(entry) {
                matchGroups = (/([\w-]+): *(.+)/g).exec(entry.trim());
                arr.push({
                    key: matchGroups[1],
                    value: matchGroups[2]
                });
            });
            return arr;
        },
        toDictionary: function(str, separator, equalizer) {
            if(typeof separator !== 'string')
                separator = ',';
            if(typeof equalizer !== 'string')
                equalizer = ':';
            var entries = str.split(separator),
                matchGroups,
                dic = {};
            entries.forEach(function(entry) {
                var regexp = new RegExp('([\\w-]+)' + equalizer + ' *(.+)');
                matchGroups = regexp.exec(entry.trim());
                if(Array.isArray(matchGroups) && matchGroups.length === 3)
                    dic[matchGroups[1]] = matchGroups[2];
            });
            return dic;
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.String = String;

})(Function('return this')());
(function(global) {

    var CompNode = function(viewNode, values) {
        this.viewNode = viewNode;
        this.self = viewNode.self.cloneNode(false);
        if(Array.isArray(values))
            this.values = values;
        this.children = [];
    };

    CompNode.prototype.compare = function(comp) {
        var updated = false, $scope = comp.$scope;

        if(Array.isArray(this.viewNode.directives)) {
            var directives = this.viewNode.directives,
                injectable, getterValue, skipped = 0;
            for(var i = 0; i < directives.length; i++) if(directives[i]) {
                injectable = directives[i].injectable;
                getterValue = injectable.getter(directives[i].statement, comp);

                // If injectable getter with current scope result is
                // different from current one, update the CompNode.
                if(!injectable.compare(this.values[i-skipped], getterValue)) {
                    this.values[i-skipped] = getterValue;
                    if(injectable.justModify && this.self) {
                        injectable.modifier(this, getterValue);
                    } else {
                        updated = true;
                        break;
                    }
                }
                else if(getterValue && Array.isArray(getterValue.array))
                    break;
                else if(getterValue === false && typeof this.self === 'undefined')
                    break;
            } else
                skipped++;
        }

        // If not updated, recursively compare nodes.
        // Else, generate new CompNode and replace.
        if(!updated) {
            // If node is multipleNodes, compare children by iterator
            if(this.multipleNodes) {
                // Creating helper variables and temp placeholders.
                var viewNode = this.viewNode,
                    iterator = this.iterator,
                    tempVal = $scope[iterator.varName],
                    tempDirective = viewNode.directives[i],
                    tempDirectivePos = i,
                    newCompNode;

                // Ignoring the iterator directive for now
                viewNode.directives[tempDirectivePos] = undefined;

                for(i = 0; i < iterator.array.length; i++) {
                    // Injecting the proper value to scope
                    $scope[iterator.varName] = iterator.array[i];

                    if(this.children[i] instanceof CompNode) {
                        this.children[i].compare(comp);
                        this.children[i].iteratorValue = iterator.array[i];
                    } else {
                        newCompNode = viewNode.generate(comp);
                        newCompNode.iteratorValue = iterator.array[i];
                        this.appendChild(newCompNode);
                        if(newCompNode.isComponent())
                            newCompNode.bootstrap();
                    }
                }

                // Clearing all irrelevant children
                var fromChild = i;
                for(i; i < this.children.length; i++) {
                    this.removeChild(this.children[i]);
                }
                this.children.splice(fromChild, i - fromChild);

                // Reassigning values
                $scope[iterator.varName] = tempVal;
                viewNode.directives[tempDirectivePos] = tempDirective;
            } else {
                this.children.forEach(function(child) {
                    child.compare(comp);
                });
            }
        } else {
            // If there were changes, generate a new node.
            var newNode = this.viewNode.generate(comp);

            if(this.iteratorValue)
                newNode.iteratorValue = this.iteratorValue;

            // Assign values and replace with current one
            this.parent.replaceChild(newNode, this);

            // Finally if node is a component bootstrap it.
            if(newNode.isComponent())
                newNode.bootstrap(comp);
        }
    };

    CompNode.prototype.appendChild = function(child) {
        this.children.push(child);
        child.parent = this;
        if(child.self) {
            this.self.appendChild(child.self);
        }
    };

    CompNode.prototype.replaceChild = function(newNode, child) {
        newNode.parent = child.parent;

        if(newNode.self && child.self) {
            this.removeChild(child, newNode)
        } else if(newNode.self && !child.self) {
            var childIndex = this.children.indexOf(child);
            if(childIndex >= 0) {
                this.children.splice(childIndex, 1, newNode);

                var insertBefore;
                while(!insertBefore && childIndex < this.children.length - 1) {
                    if(this.children[++childIndex].self)
                        insertBefore = this.children[childIndex].self;
                }

                if(insertBefore)
                    insertBefore.parentNode.insertBefore(newNode.self, insertBefore);
                else if(this.self)
                    this.self.appendChild(newNode.self);
            } else
                console.error("CompNode: replaceChild failed, 2nd parameter is not a child of this node.");
        } else if(!newNode.self && child.self) {
            this.removeChild(child);
        }
    };

    CompNode.prototype.removeChild = function(child, replace) {
        if(child.comp instanceof global.Base.Component) {
            child.comp.onDestroy();
            delete child.comp;
        } else if(Array.isArray(child.children)) {
            for(var i = 0; i < child.children.length; i++)
                child.removeChild(child.children[i]);
            child.children.splice(0, child.children.length);
        }

        if(replace) {
            this.children.splice(this.children.indexOf(child), 1, replace);
            this.self.replaceChild(replace.self, child.self);
        } else if(child.self) {
            this.self.removeChild(child.self);
            child.self = undefined;
        }
    };

    CompNode.prototype.isComponent = function() {
        return this.self && this.self.nodeType === 1 &&
            (this.viewNode.controller || typeof this.self.getAttribute('controller') === 'string') &&
            !this.iterator;
    };

    CompNode.prototype.bootstrap = function(parent) {
        this.comp = global.Core.Bootstrap(this.self, parent, this.inputs);
        this.self = this.comp.nodeTree.self;
    };

    global.Base = global.Base || {};
    global.Base.CompNode = CompNode;

})(Function('return this')());
(function(global) {

    var Component = function(el, parent, $scope) {
        this.el = el;
        if(parent instanceof Component) {
            this.parent = parent;
            parent.children = parent.children || [];
            parent.children.push(this);
        }
        this.$scope = $scope;
    };

    Component.prototype.setView = function(compNode) {
        this.el.parentNode.replaceChild(compNode.self, this.el);
        this.nodeTree = compNode;
        this.el = compNode.self;
    };

    Component.prototype.update = function() {
        if(this.nodeTree instanceof global.Base.CompNode)
            this.nodeTree.compare(this);
    };

    Component.prototype.getInput = function(name, defaultValue) {
        if(this.inputs && this.inputs.hasOwnProperty(name))
            return this.inputs[name];
        else {
            return defaultValue;
        }
    };

    Component.prototype.onDestroy = function() {
        if(Array.isArray(this.children))
            while(this.children.length > 0)
                this.children[0].onDestroy();

        if(Array.isArray(this.subscriptions))
            this.subscriptions.forEach(function(subscription) {
                subscription.unsubscribe();
            });

        if(this.parent instanceof Component)
            this.parent.children.splice(this.parent.children.indexOf(this), 1);
    };

    global.Base = global.Base || {};
    global.Base.Component = Component;

})(Function('return this')());
(function(global) {

    var Controller = function(name, view, constructor) {
        this.name = name;
        this.view = view;
        this.constructor = constructor;
    };

    Controller.prototype.generateComponent = function(el, parent, inputs) {
        // Creating new scope object
        var $scope = {};

        // Generating new component
        var comp = new global.Base.Component(el, parent, $scope);

        // Keeping the element's content as original HTML
        if(el.innerHTML.length > 0) {
            comp.subView = new global.Base.View('content-outlet', null, el.innerHTML);
        }

        // If inputs assigning them to comp
        if(typeof inputs === 'object')
            comp.inputs = inputs;

        // Provide the $scope with a function to retrieve inputs
        $scope.getInput = function(name, defaultValue) {
            $scope[name] = this.getInput(name, defaultValue);
        }.bind(comp);

        // Provide the $scope with option to hold component subscriptions
        $scope.addSubscription = function() {
            this.subscriptions = this.subscriptions || [];
            for(var i = 0; i < arguments.length; i++)
                this.subscriptions.push(arguments[i]);
        }.bind(comp);

        // Running the constructor
        this.constructor.call(this, $scope, comp.update.bind(comp));

        // Eventually setting the view for the component
        comp.setView(this.view.generate(comp));

        return comp;
    };

    global.Base = global.Base || {};
    global.Base.Controller = Controller;

})(Function('return this')());
(function(global) {

    var TAG = "[Injectable]";

    var Injectable = function(name, options) {
        this.name = name;

        // Modifier function:
        try {
            this.modifier = options.modifier.bind(this);
        } catch(err) {
            console.error(TAG, this.name + ": No modifier set.");
        }

        // Overriding prototype functions
        if(typeof options.getter === 'function')
            this.getter = options.getter.bind(this);
        if(typeof options.compare === 'function')
            this.compare = options.compare.bind(this);

        // Other options:
        this.keepAttribute = !!options.keepAttribute;
        this.justModify = !!options.justModify;
        this.useComponentInGetter = !!options.useComponentInGetter;
    };

    Injectable.prototype.getter = function(statement, comp) {
        var result;
        try {
            with(comp.$scope) { result = eval(statement); }
        } catch(err) {
            console.error(TAG, this.name + ':', "Couldn't evaluate '" + statement + "'.");
        }
        return result;
    };

    Injectable.prototype.compare = function(oldVal, newVal) {
        if(oldVal === newVal)
            return true;
    };

    global.Base = global.Base || {};
    global.Base.Injectable = Injectable;

})(Function('return this')());
(function(global) {

    var Model = function(name, initFunc) {
        this.name = name;
        this.initFunc = initFunc;

        // Default events
        this.events = {};

        this.init();
    };

    Model.prototype.init = function() {
        this.data = [];

        if(typeof this.initFunc !== 'function') {
            throw { message: this.name + ": Couldn't initialize the model (initFunc err)" };
        } else {
            this.initFunc(function(data, merge) {
                this.setData(data, !!merge);
            }.bind(this));
        }
    };

    Model.prototype.setData = function(data, merge, eventName) {
        merge = !!merge;
        if(!merge || !this.data)
            this.data = data;
        else {
            for(var i = 0; i < data.length; i++)
                this.data.push(data[i]);
        }

        // If eventName isn't specified default to 'setData'.
        this.emit(eventName || 'setData', this.data);
    };

    Model.prototype.emit = function() {
        var argsArr = [], event;
        for(var a = 0; a < arguments.length; a++) {
            if(a === 0)
                event = arguments[a];
            else
                argsArr.push(arguments[a]);
        }

        if(Array.isArray(this.events[event])) {
            for(var i = 0; i < this.events[event].length; i++) {
                this.events[event][i].apply(undefined, argsArr);
            }
        }
    };

    Model.prototype.subscribe = function(event, listener) {
        if(!this.events[event])
            this.events[event] = [];

        this.events[event].push(listener);

        return {
            unsubscribe: function(event, listener) {
                var index = this.events[event].indexOf(listener);
                this.events[event].splice(index, 1);
            }.bind(this, event, listener)
        };
    };

    global.Base = global.Base || {};
    global.Base.Model = Model;

})(Function('return this')());
(function(global) {

    var TAG = "[Route]";

    var Route = function(options) {
        if(options.hasOwnProperty('path'))
            this.path = options.path.split('/');
        else
            throw { message: TAG + " Route must have a path." };

        if(options.hasOwnProperty('controller')) {
            this.controller = options.controller;
        } else if(options.hasOwnProperty('redirect'))
            this.redirect = options.redirect;
        else
            throw { message: TAG + " Route must have a controller." };

        if(Array.isArray(options.children))
            this.children = options.children.map(function(child) {
                return new Route(child);
            });
    };

    Route.prototype.checkUrl = function(urlParts, matchesArr) {
        var matchingParts = 0;

        if(this.path.length > urlParts.length)
            return false;

        for(var i = 0; i < this.path.length; i++) {
            if(this.path[i] === urlParts[i])
                matchingParts++;
        }

        if(this.path.length === matchingParts) {
            if(this.redirect) {
                return { redirect: this.redirect };
            }
            if(!Array.isArray(matchesArr))
                matchesArr = [];
            matchesArr.push(this.controller);

            if(this.path.length < urlParts.length) {
                if(!Array.isArray(this.children))
                    return false;

                var wasFound = false;
                urlParts.splice(0, matchingParts);
                for(i = 0; i < this.children.length; i++) {
                    if(this.children[i].checkUrl(urlParts, matchesArr)) {
                        wasFound = matchesArr;
                        break;
                    }
                }
                return wasFound
            } else if(Array.isArray(this.children)) {
                var child = this.children.filter(function(c) {
                    return c.path.length === 1 && c.path[0] === '';
                });
                while(Array.isArray(child) && child.length > 0) {
                    child = child[0];
                    matchesArr.push(child.controller);
                    if(Array.isArray(child.children))
                        child = child.children.filter(function(c) {
                            return c.path.length === 0;
                        });
                }
            }
            return {
                controllers: matchesArr
            };
        }

        return false;
    };

    global.Base = global.Base || {};
    global.Base.Route = Route;

})(Function('return this')());
(function(global) {

    var viewOptions = global.Config.viewOptions;

    var View = function(name, relPath, template) {
        this.name = name;

        if(!template)
            this.loadTemplate(relPath);
        else {
            this.templateSrc = template;
        }

        this.buildNodeTree();
    };

    View.prototype.loadTemplate = function(relPath) {
        var path = viewOptions.templatesFolder + '/' + relPath + this.name + '.html';
        path = path.replace(/\/\//g, '/');

        this.templateSrc = getTemplate(path);

        function getTemplate(path) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', path, false);
            xhr.send();
            return xhr.responseText;
        }
    };

    View.prototype.buildNodeTree = function() {
        var tempEl = document.createElement('temp');
        tempEl.innerHTML = this.templateSrc;

        // Creating node tree
        var viewNode = new global.Base.ViewNode(document.createElement(this.name));
        for(var i = 0; i < tempEl.childNodes.length; i++) {
            viewNode.children.push(buildNodeObject(tempEl.childNodes[i]));
        }

        // NodeTree was created and saved in the view.
        this.nodeTree = viewNode;

        function buildNodeObject(DOMNode) {
            var viewNode = new global.Base.ViewNode(DOMNode),
                childNode;
            for(var n = 0; n < DOMNode.childNodes.length; n++) {
                childNode = buildNodeObject(DOMNode.childNodes[n]);
                childNode.parent = viewNode;
                viewNode.children.push(childNode);
            } 
            return viewNode;
        }
    };

    View.prototype.generate = function(comp) {
        var componentTree = new global.Base.CompNode(this.nodeTree);
        for(var c = 0; c < this.nodeTree.children.length; c++) {
            componentTree.appendChild(this.nodeTree.children[c].generate(comp));
        }
        return componentTree;
    };

    global.Base = global.Base || {};
    global.Base.View = View;

})(Function('return this')());
(function(global) {

    var ViewNode = function(DOMNode) {
        this.self = DOMNode;
        this.children = [];

        this.parseNode();
    };

    ViewNode.prototype.parseNode = function() {
        var attrArr = this.self.attributes;
        if(attrArr && attrArr.length > 0) for(var a = 0; a < attrArr.length; a++) {
            if(attrArr[a].name === 'controller') {
                this.controller = attrArr[a].value;
            } else {
                // Checking for injectables and saving their statements.
                var injectable = global.App.getInjectable(attrArr[a].name);
                if(injectable instanceof global.Base.Injectable) {
                    if(!Array.isArray(this.directives))
                        this.directives = [];
                    this.directives.push({
                        injectable: injectable,
                        statement: attrArr[a].value
                    });
                    if(!injectable.keepAttribute) {
                        this.self.removeAttribute(attrArr[a].name);
                        // Removing attribute will lower 'attrArr.length' by 1.
                        a--;
                    }
                }
            }
        }
    };

    ViewNode.prototype.generate = function(comp) {
        var compNode = new global.Base.CompNode(this),
            $scope = comp.$scope;

        if(Array.isArray(this.directives)) {
            var directive, i;
            compNode.values = [];

            for(i = 0; i < this.directives.length && compNode.self; i++) if(this.directives[i]) {
                directive = this.directives[i];

                // Get value from injectable getter
                var value = directive.injectable.getter(directive.statement, comp);

                // Running modifier on created compNode with getter value
                directive.injectable.modifier(compNode, value);

                // Saving the value to compNode
                compNode.values.push(value);

                // If compNode is multipleNodes, break this loop and continue.
                if(compNode.multipleNodes)
                    break;
            }
        }

        // If has self continue with generating children
        if(compNode.self) {
            if(compNode.multipleNodes) {
                // Creating variables and saving temp values for later re-assign.
                var arr = compNode.iterator.array,
                    tempVal = $scope[compNode.iterator.varName],
                    tempDirective = this.directives[i],
                    tempDirectivePos = i,
                    childNode;

                // Removing the directive temporarily
                this.directives[i] = undefined;

                for(i = 0; i < arr.length; i++) {
                    $scope[compNode.iterator.varName] = arr[i];
                    childNode = this.generate(comp);
                    childNode.iteratorValue = arr[i];
                    compNode.appendChild(childNode);
                    if(childNode.isComponent())
                        childNode.bootstrap(comp);
                }

                // Re-assigning values.
                $scope[compNode.iterator.varName] = tempVal;
                this.directives[tempDirectivePos] = tempDirective;
            } else
                generateChildren(this, compNode);
        }

        // Eventually return the compNode
        return compNode;

        function generateChildren(viewNode, node) {
            var generated;
            // Recursively appending ViewNode's children to given CompNode.
            for(var i = 0; i < viewNode.children.length; i++) {
                generated = viewNode.children[i].generate(comp);
                node.appendChild(generated);

                if(generated.replaceSelfWith) {
                    generated.self.parentNode.replaceChild(generated.replaceSelfWith.self, generated.self);
                    delete generated.replaceSelfWith;
                }
                if(generated.isComponent()) generated.bootstrap(comp);
            }
        }
    };

    global.Base = global.Base || {};
    global.Base.ViewNode = ViewNode;

})(Function('return this')());
(function(global) {

    var Bootstrap = function(el, parent, inputs) {
        if(el.nodeType === 1) {
            var controller = getControllerFromEl(el);
            if(controller instanceof global.Base.Controller) {
                return controller.generateComponent(el, parent, inputs);
            } else
                throw { message: "Controller " + el.getAttribute('controller') + " not found." };
        } else
            throw { message: "Cannot bootstrap a non-element object." };
    };

    function getControllerFromEl(el) {
        var attrText = el.getAttribute('controller');
        if(typeof attrText === 'string') {
            var controller = global.App.getController(attrText);
            if(controller instanceof global.Base.Controller)
                return controller;
        }
    }

    global.Core = global.Core || {};
    global.Core.Bootstrap = Bootstrap;

})(Function('return this')());
(function(global) {

    var TAG = "[Router]", routerInstance;

    var Router = function(routes) {
        // Singleton
        if(routerInstance)
            return routerInstance;

        if(Array.isArray(routes)) {
            // Initializing onhashchange:
            window.onhashchange = function() {
                if(!this.navigating) {
                    this.navigateTo(location.hash);
                }
                this.navigating = false;
            }.bind(this);
            // Initializing Router
            try {
                this.routes = routes.map(function(r) {
                    return new global.Base.Route(r);
                });
            } catch(err) {
                throw err;
            }
            this.navigations = 0;
            routerInstance = this;
            this.navigateTo(location.hash);
        } else
            throw { message: TAG + " 'routes' should be an array of routes." };
    };

    Router.prototype.navigateTo = function(url) {
        // First validate url
        if(url[0] === '#') {
            if(url[1] !== '/') {
                url = url.slice(1, url.length);
            } else
                url = url.slice(2, url.length);
        }
        if(url !== this.currentPath) {
            this.navigations++;
            this.lastPath = this.currentPath || url;
            this.currentPath = url;

            var resultsObj = this.parseUrl(url);
            if(resultsObj) {
                var results = resultsObj.results;
                if(results.redirect) {
                    this.navigateTo(results.redirect);
                } else {
                    if(typeof resultsObj.params === 'string' && resultsObj.params.length > 0) {
                        resultsObj.params = global.Utils.String.toDictionary(resultsObj.params, '&', '=');
                    }
                    history.replaceState(null, '', '#/' + url);
                    this.stateChange(resultsObj)
                }
            } else
                console.error("UNKNOWN ROUTE " + url);
        }
    };

    Router.prototype.parseUrl = function(url) {
        var urlParts = url.split('?'),
            paramsString = urlParts[1];

        // First handling the URL
        urlParts = urlParts[0].split('/').filter(function(p) {
            return p !== '#';
        });

        var results;
        for(var r = 0; r < this.routes.length && !results; r++) {
            results = this.routes[r].checkUrl(urlParts);
        }

        if(results) {
            return {
                results: results,
                params: paramsString
            }
        } else
            return false;
    };

    Router.prototype.stateChange = function(urlParseResults) {
        var results = urlParseResults.results;
        if(!this.state)
            this.state = {
                controllers: results.controllers,
                params: urlParseResults.params,
                nextController: results.controllers[0]
            };
        else {
            var affectedCompNode;
            for(var i = 0; i < results.controllers.length; i++) {
                if(results.controllers[i] !== this.state.controllers[i]) {

                    for(var j = i; j < results.controllers.length; j++) {
                        this.state.controllers[j] = results.controllers[j];
                    }

                    if(j < this.state.controllers.length)
                        this.state.controllers.splice(j, this.state.controllers.length);

                    this.state.nextController = results.controllers[i];
                    affectedCompNode = this.state.compNodes[i];
                    break;
                }
            }
            // Params check
            if(typeof urlParseResults.params === 'object') {
                for(var param in urlParseResults.params) if(urlParseResults.params.hasOwnProperty(param))
                    this.updateParam(param, urlParseResults.params[param]);
                for(param in this.state.params) if(this.state.params.hasOwnProperty(param))
                    if(!urlParseResults.params[param])
                        this.updateParam(param);
            } else {
                var stateParams = this.state.params;
                if(typeof stateParams === 'object')
                    for(param in stateParams) if(stateParams.hasOwnProperty(param))
                        this.updateParam(param);
            }
            if(affectedCompNode instanceof global.Base.CompNode) {
                var comp = affectedCompNode.comp,
                    newCompNode = affectedCompNode.viewNode.generate(comp);
                affectedCompNode.parent.replaceChild(newCompNode, affectedCompNode);
                newCompNode.bootstrap(comp.parent);
            }
        }
    };

    Router.prototype.nextController = function(compNode) {
        if(this.state && this.state.nextController) {
            // Saving nextController and clearing it's data
            var nextController = this.state.nextController;
            this.state.nextController = undefined;

            // Searching for it's place in the stack
            for(var i = 0; i < this.state.controllers.length; i++) {
                if(nextController === this.state.controllers[i]) {
                    // Creating an array to save compNodes accordingly
                    if(!Array.isArray(this.state.compNodes)) this.state.compNodes = [];

                    // Assigning next controller on the stack to nextController
                    this.state.nextController = this.state.controllers[i+1];

                    // Placing the compNode in it's correct place
                    this.state.compNodes[i] = compNode;
                    break;
                }
            }
            return nextController;
        } else
            console.error(TAG, "Failed to load next controller, end of list.");
    };

    Router.prototype.updateParam = function(key, value) {
        var params = this.params(), changes = 0;
        if(params[key] !== value) {
            if(!value || value.length === 0)
                delete params[key];
            else
                params[key] = value;
            changes++;

            // emit to subscriptions
            if(this.paramSubscriptions) {
                var subsObservable = this.paramSubscriptions[key];
                if(subsObservable instanceof global.Utils.Observable) {
                    subsObservable.next(value);
                }
            }
        }
        if(changes > 0) {
            this.navigating = true;
            var currUrl = location.hash;
            currUrl = currUrl.split('?')[0] + '?';
            for(var param in params) if(params.hasOwnProperty(param)) {
                currUrl += param + '=' + params[param] + '&'
            }
            location.hash = currUrl.substr(0, currUrl.length - 1);
            this.currentPath = location.hash.substr(2, location.hash.length);
        }
        if(this.state) this.state.params = params;
    };

    Router.prototype.subscribeToParam = function(param, listener) {
        if(typeof this.paramSubscriptions !== 'object')
            this.paramSubscriptions = {};
        var subs = this.paramSubscriptions;
        if(!(subs[param] instanceof global.Utils.Observable))
            subs[param] = new global.Utils.Observable();
        var subscription = subs[param].subscribe(listener);
        if(this.state && this.state.params) {
            listener(this.state.params[param]);
        }
        return subscription;
    };

    Router.prototype.isLandingPage = function() {
        return this.lastPath === this.currentPath
                && this.navigations === 1;
    };

    Router.prototype.params = function() {
        return (this.state && typeof this.state.params === 'object') ?
                this.state.params :
                {};
    };

    global.Core = global.Core || {};
    global.Core.Router = Router;

})(Function('return this')());
(function(global) {

    var Controllers = {},
        Injectables = {},
        Models     = {},
        routerInstance;

    global.App = {
        // Getters
        getController: function(name) {
            return Controllers[name];
        },
        getInjectable: function(name) {
            return Injectables[name];
        },
        getModel: function(name) {
            return Models[name];
        },

        // Generators
        Bootstrap: bootstrapApp,
        Controller: generateController,
        Injectable: generateInjectable,
        Model: createModel,
        Router: getRouter
    };

    function bootstrapApp(componentName) {
        var TAG = "[Bootstrap]";

        var compEl = document.querySelector('*[controller="' + componentName + '"]');
        if(compEl && compEl.nodeType === 1) {
            try {
                var result = global.Core.Bootstrap(compEl);
            } catch(err) {
                console.error(TAG, err.message);
            }
            return result;
        } else
            console.error(TAG, "Could not find placeholder for '" + componentName + "'.");
    }

    function generateController(name, relViewPath, constructor) {
        var TAG = "[Controller]";

        try {
            // Creating a View
            var view = new global.Base.View(name, relViewPath);

            // Returning a Controller with the generated View
            Controllers[name] = new global.Base.Controller(name, view, constructor);
        } catch(err) {
            console.error(TAG, err.message);
        }
    }

    function generateInjectable(name, options) {
        var TAG = "[Injectable]";
        try {
            Injectables[name] = new global.Base.Injectable(name, options);
        } catch(err) {
            console.error(TAG, err.message);
        }
    }

    function createModel(name, initFunc) {
        var TAG = "[Model]";
        try {
            Models[name] = new global.Base.Model(name, initFunc);
        } catch(err) {
            console.error(TAG, err.message);
        }
    }

    function getRouter(routes) {
        if(!routerInstance)
            routerInstance = new global.Core.Router(routes);

        return routerInstance;
    }

})(Function('return this')());
(function(global) {

    global.App.Injectable('bind-class', {
        // Options
        justModify: true,

        // Functions
        getter: function(statement, comp) {
            var classes = global.Utils.String.toDictionary(statement),
                value;
            try {
                with(comp.$scope) {
                    for(var className in classes) if(classes.hasOwnProperty(className)) {
                        value = eval(classes[className]);
                        classes[className] = !!value;
                    }
                }
            } catch(err) {
                throw { message: this.name + ": " + err.message };
            }
            return classes;
        },
        modifier: function(compNode, value) {
            var total = 0;
            for(var className in value) if(value.hasOwnProperty(className)) {
                if(value[className]) {
                    compNode.self.classList.add(className);
                    total++;
                } else
                    compNode.self.classList.remove(className);
            }
            if(total === 0 && compNode.self.classList.length === 0)
                compNode.self.removeAttribute('class');
        }
    });

})(Function('return this')());
(function(global) {

    global.App.Injectable('bind-if', {
        getter: function(statement, comp) {
            var result;
            try {
                with(comp.$scope) { result = eval(statement); }
            } catch(err) {
                throw this.name + ": Couldn't evaluate '" + statement + "'.";
            }
            return !!result;
        },
        modifier: function(compNode, value) {
            if(!value) {
                compNode.self = undefined;
            }
        }
    });

})(Function('return this')());
(function(global) {

    global.App.Injectable('content-outlet', {
        // Functions
        getter: function(statement, comp) {
            return comp;
        },
        modifier: function(compNode, comp) {
            if(comp.subView) {
                compNode.replaceSelfWith = comp.subView.generate(comp.parent);
            }
        }
    });

})(Function('return this')());
(function(global) {

    global.App.Injectable('bind-events', {
        getter: function(statement, comp) {
            var events = global.Utils.String.toDictionary(statement),
                matches, funcName, variables;

            for(var event in events) if(events.hasOwnProperty(event)) {
                var regEx = new RegExp("^(.+)\\((.*)\\)$");
                matches = events[event].match(regEx);

                if(!Array.isArray(matches) || matches.length < 2)
                    throw (this.name + ": Invalid statement, expecting: [event: func()]");

                funcName = matches[1];
                variables = matches[2].split(',');

                for(var i = 0; i < variables.length; i++) {
                    try {
                        with(comp.$scope) {
                            variables[i] = eval(variables[i]);
                        }
                    } catch(err) {
                        throw (this.name + ": " + err.message)
                    }
                }

                events[event] = function(funcName, variables, el) {
                    var func;
                    try {
                        with(comp.$scope) {
                            func = eval(funcName);
                        }
                    } catch(err) {
                        throw (this.name + ": " + err.message)
                    }
                    if(typeof func === 'function')
                        func.apply(el, variables);
                }.bind(this, funcName, variables);
            }
            return events;
        },
        modifier: function(compNode, value) {
            for(var event in value) if(value.hasOwnProperty(event)) {
                compNode.self.addEventListener(event, function(callback, e) {
                    if(e && e.preventDefault) e.preventDefault();
                    try {
                        callback(e.currentTarget);
                    } catch(err) {
                        console.error('[Injectable]', err);
                    }
                }.bind(this, value[event]));
            }
        },
        compare: function(oldVal, newVal) {
            return true;
        }
    });

})(Function('return this')());
(function(global) {

    global.App.Injectable('input', {
        getter: function(statement, comp) {
            var inputs = global.Utils.String.toDictionary(statement);
            try {
                for(var input in inputs) if(inputs.hasOwnProperty(input)) {
                    with(comp.$scope) {
                        inputs[input] = eval(inputs[input]);
                    }
                }
            } catch(err) {
                throw { message: this.name + ": " + err.message };
            }
            return inputs;
        },
        modifier: function(compNode, value) {
            compNode.inputs = value;
        },
        compare: function(oldVal, newVal) {
            var equals = true;
            for(var input in newVal) if(newVal.hasOwnProperty(input)) {
                if(newVal[input] !== oldVal[input]) {
                    equals = false;
                    break;
                }
            }
            return equals;
        }
    });

})(Function('return this')());
(function(global) {

    global.App.Injectable('bind-for', {
        getter: function(statement, comp) {
            var words = statement.split(' '),
                result = {};
            for(var w = 0; w < words.length; w++) {
                if(words[w] === 'in' && w > 0 && w < (words.length-1)) {
                    try {
                        with(comp.$scope) {
                            result.array = eval(words[w+1]);
                        }
                    } catch(err) {
                        throw err;
                    }
                    result.varName = words[w-1];
                }
            }
            return result;
        },
        modifier: function(compNode, value) {
            compNode.self = document.createElement('iterator');
            compNode.multipleNodes = true;
            compNode.iterator = value;
        },
        compare: function(oldVal, newVal) {
            return oldVal.array === newVal.array;
        }
    });

})(Function('return this')());
(function(global) {

    var TAG = "[Router-Outlet]";

    global.App.Injectable('router-outlet', {
        getter: function(statement, comp) {
            return true;
        },
        modifier: function(compNode, value) {
            var Router = global.App.Router(),
                controllerName = Router.nextController(compNode),
                controller = global.App.getController(controllerName);

            if(controller instanceof global.Base.Controller) {
                compNode.self.setAttribute('controller', controllerName);
            }
        }
    });

})(Function('return this')());
(function(global) {

    global.App.Injectable('bind-value', {
        // Options
        justModify: true,

        // Functions
        modifier: function(compNode, value) {
            compNode.self.innerHTML = value;
        }
    });

})(Function('return this')());