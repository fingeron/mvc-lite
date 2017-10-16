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
                    if(injectable.justModify && this.self) {
                        this.values[i-skipped] = getterValue;
                        injectable.modifier(this, getterValue);
                    } else {
                        updated = true;
                        break;
                    }
                } else if(Array.isArray(getterValue.array)) {
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
                newNode.comp = global.Core.Bootstrap(newNode.self);
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
        return this.self && this.self.nodeType === 1 && this.viewNode.controller;
    };

    global.Base = global.Base || {};
    global.Base.CompNode = CompNode;

})(Function('return this')());