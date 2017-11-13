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