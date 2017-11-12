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

    Component.prototype.getInput = function(name, defaultValue) {
        if(this.inputs && this.inputs.hasOwnProperty(name))
            return this.inputs[name];
        else {
            return defaultValue;
        }
    };

    Component.prototype.onDestroy = function() {
        if(Array.isArray(this.children))
            while(this.children.length > 0)
                this.children[0].onDestroy();

        if(Array.isArray(this.subscriptions))
            this.subscriptions.forEach(function(subscription) {
                subscription.unsubscribe();
            });

        if(this.parent instanceof Component)
            this.parent.children.splice(this.parent.children.indexOf(this), 1);
    };

    global.Base = global.Base || {};
    global.Base.Component = Component;

})(Function('return this')());