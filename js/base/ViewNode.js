(function(global) {

    var ViewNode = function(DOMNode) {
        this.self = DOMNode;
        this.children = [];

        this.parseNode();
    };

    ViewNode.prototype.parseNode = function() {
        var attrArr = this.self.attributes,
            attrName, attrValue;

        if(attrArr && attrArr.length > 0) for(var a = 0; a < attrArr.length; a++) {
            attrName = attrArr[a].name;
            attrValue = attrArr[a].value;

            if(attrName === 'controller') {
                this.controller = attrValue;
            } else {
                // Checking for injectables and saving their pipes & statements.
                var pipeSplit = attrValue.split(' | '),
                    injectable = global.App.getInjectable(attrName),
                    pipes;

                if(injectable instanceof global.Base.Injectable) {
                    attrValue = pipeSplit[0];
                    pipeSplit.splice(0, 1);

                    if(pipeSplit.length > 0) {
                        pipes = [];
                        for(var i = 0; i < pipeSplit.length; i++) {
                            var pipeParts = pipeSplit[i].trim().split(/:(.+)/g);
                            pipeParts = pipeParts.filter(function(p) { return p.length > 0 });
                            pipes.push({
                                name: pipeParts[0],
                                dataStatement: pipeParts[1]
                            });
                        }
                    }

                    if(!Array.isArray(this.directives))
                        this.directives = [];
                    this.directives.push({
                        injectable: injectable,
                        statement: attrValue,
                        pipes: pipes
                    });

                    // Clearing the `pipes` variable
                    pipes = undefined;

                    if(!injectable.keepAttribute) {
                        this.self.removeAttribute(attrName);
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

                // Checking for pipes and analyzing them
                if(Array.isArray(directive.pipes)) {
                    var p, pipeObj, pipe;
                    for(p = 0; p < directive.pipes.length; p++) {
                        pipeObj = directive.pipes[p];
                        pipe = global.App.getPipe(pipeObj.name);
                        if(pipe instanceof global.Base.Pipe) {
                            var data;
                            if(pipeObj.dataStatement)
                                data = comp.evalWithScope(pipeObj.dataStatement);

                            // Finally transform the value and apply it
                            value = pipe.transform(value, data);
                        }
                    }
                }

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

                if(typeof compNode.iterator.indexVarName === 'string') {
                    var indexVarName = compNode.iterator.indexVarName,
                        tempIndexVarValue = $scope[indexVarName];
                }

                // Removing the directive temporarily
                this.directives[i] = undefined;

                for(i = 0; i < arr.length; i++) {
                    $scope[compNode.iterator.varName] = arr[i];
                    // If present, assigning index to indexVarName.
                    if(indexVarName) $scope[indexVarName] = i;
                    childNode = this.generate(comp);
                    childNode.iteratorValue = arr[i];
                    compNode.appendChild(childNode);
                    if(childNode.isComponent())
                        childNode.bootstrap(comp);
                }

                // Re-assigning values.
                $scope[compNode.iterator.varName] = tempVal;
                this.directives[tempDirectivePos] = tempDirective;
                if(tempIndexVarValue)
                    $scope[indexVarName] = tempIndexVarValue;
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