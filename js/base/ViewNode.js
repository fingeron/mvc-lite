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

            for(i = 0; i < this.directives.length && compNode.self; i++) {
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
            if(compNode.multipleNodes) {
                var arr = compNode.iterator.array,
                    tempVal = $scope[compNode.iterator.varName],
                    childNode;

                for(i = 0; i < arr.length; i++) {
                    $scope[compNode.iterator.varName] = arr[i];
                    childNode = new global.Base.CompNode(this);
                    generateChildren(this, childNode);
                    compNode.appendChild(childNode);
                }

                $scope[compNode.iterator.varName] = tempVal;
            } else
                generateChildren(this, compNode);
        }

        function generateChildren(viewNode, node) {
            var generated;
            // Recursively appending ViewNode's children to given CompNode.
            for(var i = 0; i < viewNode.children.length; i++) {
                generated = viewNode.children[i].generate($scope, node);
                generated.parent = node;
                node.appendChild(generated);

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