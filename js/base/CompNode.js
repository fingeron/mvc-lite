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
                injectable;
            for(var i = 0; i < directives.length; i++) {
                injectable = directives[i].injectable;

                // If injectable getter with current scope result is
                // different from current one, update the CompNode.
                if(this.values[i] !== injectable.getter(directives[i].statement, $scope)) {
                    updated = true;
                    break;
                }
            }
        }

        // If updated, recursively compare nodes.
        // Else, generate new ViewNode and replace.
        if(!updated) {
            this.children.forEach(function(child) {
                child.compare($scope);
            });
        } else {
            var newNode = this.viewNode.generate($scope);
            this.parent.replaceChild(newNode, this);
            if(newNode.isComponent())
                global.Core.Bootstrap(newNode.self);
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
        if(newNode.self && child.self) {
            this.self.replaceChild(newNode.self, child.self);
            for(var i = 0; i < this.children.length; i++) {
                if(this.children[i] === child)
                    this.children[i] = newNode;
            }
        } else if(newNode.self && !child.self) {
            var childIndex = this.children.indexOf(child);
            if(childIndex >= 0) {
                this.children.splice(childIndex, 1, newNode);

                var insertBefore;
                while(!insertBefore && childIndex < this.children.length) {
                    if(this.children[++childIndex].self)
                        insertBefore = this.children[childIndex].self;
                }

                if(insertBefore)
                    insertBefore.parentNode.insertBefore(newNode.self, insertBefore);
                else
                    insertBefore.parentNode.appendChild(newNode.self);
            } else
                console.error("CompNode: replaceChild failed, 2nd parameter is not a child of this node.");
        } else if(!newNode.self && child.self) {
            this.removeChild(child);
        }
    };

    CompNode.prototype.removeChild = function(child) {
        this.children.splice(this.children.indexOf(child), 1);
        child.children.forEach(function(child2) {
            child.removeChild(child2);
        });
        this.self.removeChild(child.self);
    };

    CompNode.prototype.isComponent = function() {
        return this.self && this.self.nodeType === 1 && this.viewNode.controller;
    };

    global.Base = global.Base || {};
    global.Base.CompNode = CompNode;

})(Function('return this')());