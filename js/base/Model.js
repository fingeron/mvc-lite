(function(global) {

    var Model = function(name, initFunc) {
        this.name = name;
        this.initFunc = initFunc;

        // Default events
        this.events = {};

        this.init();
    };

    Model.prototype.init = function() {
        this.data = [];

        if(typeof this.initFunc !== 'function') {
            throw { message: this.name + ": Couldn't initialize the model (initFunc err)" };
        } else {
            this.initFunc(function(data, merge) {
                this.setData(data, !!merge);
            }.bind(this));
        }
    };

    Model.prototype.setData = function(data, merge, eventName) {
        merge = !!merge;
        if(!merge || !this.data)
            this.data = data;
        else {
            for(var i = 0; i < data.length; i++)
                this.data.push(data[i]);
        }

        // If eventName isn't specified default to 'setData'.
        this.emit(eventName || 'setData', this.data);
    };

    Model.prototype.emit = function() {
        var argsArr = [], event;
        for(var a = 0; a < arguments.length; a++) {
            if(a === 0)
                event = arguments[a];
            else
                argsArr.push(arguments[a]);
        }

        if(Array.isArray(this.events[event])) {
            for(var i = 0; i < this.events[event].length; i++) {
                this.events[event][i].apply(undefined, argsArr);
            }
        }
    };

    Model.prototype.subscribe = function(event, listener) {
        if(!this.events[event])
            this.events[event] = [];

        this.events[event].push(listener);

        return {
            unsubscribe: function(event, listener) {
                var index = this.events[event].indexOf(listener);
                this.events[event].splice(index, 1);
            }.bind(this, event, listener)
        };
    };

    global.Base = global.Base || {};
    global.Base.Model = Model;

})(Function('return this')());