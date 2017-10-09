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
                // Checking for injectables and saving their statements
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
                        // Because we removed attribute 'attrArr.length', which is
                        // a reference to node.attributes, will return a number lower by 1.
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

            for(i = 0; i < this.directives.length; i++) {
                directive = this.directives[i];

                // Get value from injectable getter
                var value = directive.injectable.getter(directive.statement, $scope);

                // Running modifier on created compNode with getter value
                directive.injectable.modifier(compNode, value);

                // Eventually saving the value to compNode
                compNode.values.push(value);
            }
        }

        // If has self
        if(compNode.self) {
            // Recursively generate children
            var generated;
            for(i = 0; i < this.children.length; i++) {
                generated = this.children[i].generate($scope, compNode);
                generated.parent = compNode;
                compNode.appendChild(generated);

                if(generated.isComponent()) {
                    generated.comp = global.Core.Bootstrap(generated.self);
                    generated.self = generated.comp.nodeTree.self;
                }
            }
        }

        return compNode;
    };

    global.Base = global.Base || {};
    global.Base.ViewNode = ViewNode;

})(Function('return this')());