(function(global) {

    global.Config = {
        viewOptions: {
            templatesFolder: 'app'
        }
    };

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
            var changes = 0;
            if(typeof origin === 'object' && typeof update === 'object') {
                for(var property in update) if(update.hasOwnProperty(property) && !isIgnored(property)) {
                    switch(typeof update[property]) {
                        case 'object':
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
        toDictionary: function(str, separator) {
            if(typeof separator !== 'string')
                separator = ',';
            var entries = str.split(separator),
                matchGroups,
                dic = {};
            entries.forEach(function(entry) {
                matchGroups = (/([\w-]+): *(.+)/g).exec(entry.trim());
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

    CompNode.prototype.compare = function($scope) {
        var updated = false;
        if(Array.isArray(this.viewNode.directives)) {
            var directives = this.viewNode.directives,
                injectable, getterValue, skipped = 0;
            for(var i = 0; i < directives.length; i++) if(directives[i]) {
                injectable = directives[i].injectable;
                getterValue = injectable.getter(directives[i].statement, $scope);

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
                } else if(getterValue && Array.isArray(getterValue.array)) {
                    break;
                }
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

                viewNode.directives[tempDirectivePos] = undefined;
                for(i = 0; i < iterator.array.length; i++) {
                    $scope[iterator.varName] = iterator.array[i];
                    if(this.children[i] instanceof CompNode) {
                        this.children[i].compare($scope);
                        this.children[i].iteratorValue = iterator.array[i];
                    } else {
                        newCompNode = viewNode.generate($scope);
                        newCompNode.iteratorValue = iterator.array[i];
                        this.appendChild(newCompNode);
                    }
                }
                // Reassigning values
                $scope[iterator.varName] = tempVal;
                viewNode.directives[tempDirectivePos] = tempDirective;
            } else {
                this.children.forEach(function(child) {
                    child.compare($scope);
                });
            }
        } else {
            // If there were changes, generate a new node.
            var newNode = this.viewNode.generate($scope);

            if(this.iteratorValue)
                newNode.iteratorValue = this.iteratorValue;

            // Assign values and replace with current one
            this.parent.replaceChild(newNode, this);

            // Finally if node is a component bootstrap it.
            if(newNode.isComponent()) {
                newNode.comp = global.Core.Bootstrap(newNode.self, newNode.inputs);
                newNode.self = newNode.comp.nodeTree.self;
            }
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
            this.self.replaceChild(newNode.self, child.self);
            this.children.splice(this.children.indexOf(child), 1, newNode);
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
                else
                    this.self.appendChild(newNode.self);
            } else
                console.error("CompNode: replaceChild failed, 2nd parameter is not a child of this node.");
        } else if(!newNode.self && child.self) {
            this.removeChild(child);
        }
    };

    CompNode.prototype.removeChild = function(child) {
        this.self.removeChild(child.self);
        child.self = undefined;
        child.children.splice(0, child.children.length);
    };

    CompNode.prototype.isComponent = function() {
        return this.self && this.self.nodeType === 1 && this.viewNode.controller && !this.iterator;
    };

    CompNode.prototype.bootstrap = function() {
        this.comp = global.Core.Bootstrap(this.self, this.inputs);
        this.self = this.comp.nodeTree.self;
    };

    global.Base = global.Base || {};
    global.Base.CompNode = CompNode;

})(Function('return this')());
(function(global) {

    var Component = function(el, $scope) {
        this.el = el;
        this.$scope = $scope;
    };

    Component.prototype.setView = function(compNode) {
        this.el.parentNode.replaceChild(compNode.self, this.el);
        this.nodeTree = compNode;
        this.el = compNode.self;
    };

    Component.prototype.update = function() {
        this.nodeTree.compare(this.$scope);
    };

    Component.prototype.getInput = function(name) {
        if(this.inputs && this.inputs.hasOwnProperty(name))
            return this.inputs[name];
        else {
            throw { message: "Input " + name + " doesn't exist." };
        }
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

    Controller.prototype.generateComponent = function(el, inputs) {
        // Creating new scope object
        var $scope = {};

        // Generating new component
        var comp = new global.Base.Component(el, $scope);

        // If inputs assigning them to comp
        if(typeof inputs === 'object')
            comp.inputs = inputs;

        // Provide the $scope with a function to retrieve inputs
        $scope.getInput = function(name) {
            $scope[name] = this.getInput(name);
        }.bind(comp);

        // Running the constructor
        this.constructor.call(this, $scope, comp.update.bind(comp));

        // Eventually setting the view for the component
        comp.setView(this.view.generate($scope));

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
    };

    Injectable.prototype.getter = function(statement, $scope) {
        var result;
        try {
            with($scope) { result = eval(statement); }
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
        if(typeof this.initFunc !== 'function') {
            throw { message: this.name + ": Couldn't initialize the model (initFunc err)" };
        } else {
            this.initFunc(function(data) {
                this.setData(data);
            }.bind(this));
        }
    };

    Model.prototype.setData = function(data, /*optional:*/ eventName) {
        this.data = data;

        // If eventName isn't specified default to 'setData'.
        this.emit(eventName || 'setData', data);
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
            unsubscribe: function(listener) {
                this.events.splice(this.events.indexOf(listener), 1);
            }.bind(this, listener)
        };
    };

    global.Base = global.Base || {};
    global.Base.Model = Model;

})(Function('return this')());
(function(global) {

    var viewOptions = global.Config.viewOptions;

    var View = function(name, relPath) {
        this.name = name;
        this.loadTemplate(relPath);
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

    View.prototype.generate = function($scope) {
        var componentTree = new global.Base.CompNode(this.nodeTree);
        for(var c = 0; c < this.nodeTree.children.length; c++) {
            componentTree.appendChild(this.nodeTree.children[c].generate($scope, componentTree));
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

    ViewNode.prototype.generate = function($scope) {
        var compNode = new global.Base.CompNode(this);

        if(Array.isArray(this.directives)) {
            var directive, i;
            compNode.values = [];

            for(i = 0; i < this.directives.length && compNode.self; i++) if(this.directives[i]) {
                directive = this.directives[i];

                // Get value from injectable getter
                var value = directive.injectable.getter(directive.statement, $scope);

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

                var childCount = 0;
                for(i = 0; i < arr.length; i++) {
                    $scope[compNode.iterator.varName] = arr[i];
                    childNode = this.generate($scope);
                    childNode.iteratorValue = arr[i];
                    if(childNode.self) childCount++;
                    compNode.appendChild(childNode);
                    if(childNode.isComponent()) childNode.bootstrap();
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
                generated = viewNode.children[i].generate($scope, node);
                node.appendChild(generated);

                if(generated.isComponent()) generated.bootstrap();
            }
        }
    };

    global.Base = global.Base || {};
    global.Base.ViewNode = ViewNode;

})(Function('return this')());
(function(global) {

    var Bootstrap = function(el, inputs) {
        if(el.nodeType === 1) {
            var controller = getControllerFromEl(el);
            if(controller instanceof global.Base.Controller) {
                return controller.generateComponent(el, inputs);
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

    var Controllers = {};
    var Injectables = {};
    var Models     = {};

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
        Model: createModel
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

})(Function('return this')());
(function(global) {

    global.App.Injectable('bind-class', {
        // Options
        justModify: true,

        // Functions
        getter: function(statement, $scope) {
            var classes = global.Utils.String.toDictionary(statement),
                value;
            try {
                with($scope) {
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
            for(var className in value) if(value.hasOwnProperty(className)) {
                value[className] ?
                    compNode.self.classList.add(className) :
                    compNode.self.classList.remove(className);
            }
        }
    });

})(Function('return this')());
(function(global) {

    global.App.Injectable('bind-if', {
        getter: function(statement, $scope) {
            var result;
            try {
                with($scope) { result = eval(statement); }
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

    global.App.Injectable('bind-events', {
        getter: function(statement, $scope) {
            var events = global.Utils.String.toDictionary(statement),
                matches, funcName, variables;

            for(var event in events) if(events.hasOwnProperty(event)) {
                var regEx = new RegExp("^(.+)\\((.*)\\)$");
                matches = events[event].match(regEx);
                funcName = matches[1];
                variables = matches[2].split(',');

                events[event] = function(funcName, variables) {
                    var func;
                    try {
                        with($scope) {
                            func = eval(funcName);
                        }
                        var values = [];
                        for(var i = 0; i < variables.length; i++) {
                            values[i] = $scope[variables[i]];
                        }
                        func.apply(undefined, values);
                    } catch(err) {
                        throw (this.name + ": " + err.message)
                    }
                }.bind(this, funcName, variables);
            }
            return events;
        },
        modifier: function(compNode, value) {
            for(var event in value) if(value.hasOwnProperty(event)) {
                compNode.self.addEventListener(event, function(callback, e) {
                    if(e && e.preventDefault) e.preventDefault();
                    try {
                        callback();
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
        getter: function(statement, $scope) {
            var inputs = global.Utils.String.toDictionary(statement);
            try {
                for(var input in inputs) if(inputs.hasOwnProperty(input)) {
                    with($scope) {
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
        getter: function(statement, $scope) {
            var words = statement.split(' '),
                result = {};
            for(var w = 0; w < words.length; w++) {
                if(words[w] === 'in' && w > 0 && w < (words.length-1)) {
                    try {
                        with($scope) {
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
        compare: function(oldVal, newVal) {
            return oldVal.array === newVal.array;
        },
        modifier: function(compNode, value) {
            compNode.self = document.createElement('iterator');
            compNode.multipleNodes = true;
            compNode.iterator = value;
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