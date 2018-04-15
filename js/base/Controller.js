(function(global) {

    var Controller = function(name, view, constructor) {
        this.name = name;
        this.view = view;
        this.constructor = constructor;
    };

    Controller.prototype.generateComponent = function(el, parent, inputs, callback) {
        // Creating new scope object
        var $scope = {};

        // Generating new component
        var comp = new global.Base.Component(this.name, el, parent, $scope);

        // If inputs assigning them to comp
        if(typeof inputs === 'object')
            comp.inputs = inputs;

        // Provide the $scope with a function to retrieve inputs
        $scope.getInput = function(name, defaultValue) {
            $scope[name] = this.getInput(name, defaultValue);
        }.bind(comp);

        // Provide the $scope with option to hold component subscriptions
        $scope.addSubscription = function() {
            this.subscriptions = this.subscriptions || [];
            for(var i = 0; i < arguments.length; i++)
                this.subscriptions.push(arguments[i]);
        }.bind(comp);

        // Running the constructor
        this.constructor.call(this, $scope, comp.update.bind(comp));

        // Eventually setting the view for the component
        this.view.generate(comp, function(componentTree) {
            comp.setView(componentTree);
            if(typeof callback === 'function')
                callback(comp);
        });
        return comp;
    };

    global.Base = global.Base || {};
    global.Base.Controller = Controller;

})(Function('return this')());