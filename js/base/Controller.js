(function(global) {

    var Controller = function(name, view, constructor) {
        this.name = name;
        this.view = view;
        this.constructor = constructor;
    };

    global.Base = global.Base || {};
    global.Base.Controller = Controller;

})(Function('return this')());