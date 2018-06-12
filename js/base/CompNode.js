(function(global) {

    var CompNode = function(viewNode, values) {
        this.viewNode = viewNode;
        this.self = viewNode.self.cloneNode(false);
        if(Array.isArray(values))
            this.values = values;
        this.children = [];
    };

    CompNode.prototype.compare = function(comp, options) {
        var updated = false, $scope = comp.$scope;
        // Compare options:
        var isRecursive = options && options.recursive;

        if(Array.isArray(this.viewNode.directives)) {
            var directives = this.viewNode.directives,
                injectable, getterValue, skipped = 0;
            for(var i = 0; i < directives.length; i++) if(directives[i]) {
                injectable = directives[i].injectable;

                getterValue = injectable.getter(directives[i].statement, comp);

                // Checking for pipes and analyzing them
                if(Array.isArray(directives[i].pipes)) {
                    var p, pipeObj, pipe;
                    for(p = 0; p < directives[i].pipes.length; p++) {
                        pipeObj = directives[i].pipes[p];
                        pipe = global.App.getPipe(pipeObj.name);
                        if(pipe instanceof global.Base.Pipe) {
                            var data;
                            if(pipeObj.dataStatement)
                                data = comp.evalWithScope(pipeObj.dataStatement);

                            // Finally transform the value and apply it
                            getterValue = pipe.transform(getterValue, data);
                        }
                    }
                }

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
                var c, child, wasUpdated;
                for(c = 0; c < this.children.length; c++) {
                    child = this.children[c];
                    wasUpdated = child.compare(comp, options);
                    if(isRecursive && child.isComponent() && !wasUpdated) {
                        if(child.comp)
                            child.comp.update(options);
                        else
                            setTimeout(function(child, options) {
                                if(child.comp) child.comp.update(options);
                            }, 0, child, options);
                    }
                }
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
        return updated;
    };

    CompNode.prototype.appendChild = function(child) {
        this.children.push(child);
        child.parent = this;
        if(this.self && child.self) {
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
        } else if(child.self && this.self) {
            for(var n = 0; n < this.self.childNodes.length; n++)
                if(this.self.childNodes[n] === child.self) {
                    this.self.removeChild(child.self);
                    break;
                }
            child.self = undefined;
        }
    };

    CompNode.prototype.isComponent = function() {
        return this.self && this.self.nodeType === 1 &&
            (this.viewNode.controller || typeof this.self.getAttribute('controller') === 'string') &&
            !this.iterator;
    };

    CompNode.prototype.bootstrap = function(parent) {
        global.Core.Bootstrap(this.self, parent, this.inputs, function(comp) {
            this.comp = comp;
            this.self = comp.nodeTree.self;
        }.bind(this));
    };

    global.Base = global.Base || {};
    global.Base.CompNode = CompNode;

})(Function('return this')());