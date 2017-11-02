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