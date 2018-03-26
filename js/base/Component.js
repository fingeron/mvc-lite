(function(global) {

    var Component = function(name, el, parent, $scope) {
        this.name = name;
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

    Component.prototype.update = function(options) {
        // Starting update process
        if(this.nodeTree instanceof global.Base.CompNode) {
            this.nodeTree.compare(this, options);
        }
    };

    Component.prototype.getInput = function(name, defaultValue) {
        if(this.inputs && this.inputs.hasOwnProperty(name)) {
            if(typeof this.inputs[name] !== 'undefined' || typeof defaultValue === 'undefined')
                return this.inputs[name];
            else
                return defaultValue;
        } else {
            return defaultValue;
        }
    };

    Component.prototype.evalWithScope = function($) {
        var result;
        try {
            with(this.$scope) { result = eval($); }
        } catch(err) {
            console.error('[Component:' + this.name + '] - ' + err.message);
        }
        return result;
    };

    Component.prototype.onDestroy = function() {
        if(typeof this.$scope.onDestroy === 'function')
            this.$scope.onDestroy();

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