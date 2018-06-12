(function(global) {

    var Pipe = function(name, func) {
        this.name = name;
        this.func = func;
    };

    Pipe.prototype.transform = function(value, data) {
        if(Array.isArray(value)) {
            var pipeFunc = this.func;
            return value.map(function(item) {
                return pipeFunc(item, data);
            });
        } else if(typeof value === 'object') {
            var retObj = {};
            for(var param in value)
                if(value.hasOwnProperty(param))
                    retObj[param] = this.func(value[param], data);
            return retObj;
        } else
            return this.func(value, data);
    };

    global.Base = global.Base || {};
    global.Base.Pipe = Pipe;

})(Function('return this')());