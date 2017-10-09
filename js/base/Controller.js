(function(global) {

    var Controller = function(name, view, constructor) {
        this.name = name;
        this.view = view;
        this.constructor = constructor;
    };

    Controller.prototype.generateComponent = function(el) {
        // Creating new scope object
        var $scope = {};

        // Generating new component
        var comp = new global.Base.Component(el, $scope);

        // Running the constructor
        this.constructor.call(this, $scope, comp.update.bind(comp));

        // Eventually setting the view for the component
        comp.setView(this.view.generate($scope));

        return comp;
    };

    global.Base = global.Base || {};
    global.Base.Controller = Controller;

})(Function('return this')());