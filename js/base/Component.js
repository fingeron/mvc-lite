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
        if(!this.inputs || typeof this.inputs[name] === 'undefined')
            throw { message: "Input " + name + " doesn't exist." };
        else {
            return this.inputs[name];
        }
    };

    global.Base = global.Base || {};
    global.Base.Component = Component;

})(Function('return this')());