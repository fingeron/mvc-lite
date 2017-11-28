(function(global) {

    var Pipe = function(name, func) {
        this.name = name;
        this.func = func;
    };

    Pipe.prototype.transform = function(value, data) {
        return this.func(value, data);
    };

    global.Base = global.Base || {};
    global.Base.Pipe = Pipe;

})(Function('return this')());