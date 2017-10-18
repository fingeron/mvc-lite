(function(global) {

    var Model = function(name, initFunc) {
        this.name = name;
        this.initFunc = initFunc;

        // Default events
        this.events = {};

        this.getData();
    };

    Model.prototype.getData = function() {
        if(typeof this.initFunc !== 'function') {
            throw { message: this.name + ": Couldn't initialize the model (initFunc err)" };
        } else {
            this.initFunc(function(data) {
                this.setData(data);
            }.bind(this));
        }
    };

    Model.prototype.setData = function(data, /*optional:*/ eventName) {
        this.data = data;

        // If eventName isn't specified default to 'setData'.
        this.emit(eventName || 'setData', data);
    };

    Model.prototype.emit = function(event, data) {
        if(Array.isArray(this.events[event])) {
            for(var i = 0; i < this.events[event].length; i++) {
                this.events[event][i](data);
            }
        }
    };

    Model.prototype.subscribe = function(event, listener) {
        if(!this.events[event])
            this.events[event] = [];

        this.events[event].push(listener);

        return {
            unsubscribe: function(listener) {
                this.events.splice(this.events.indexOf(listener), 1);
            }.bind(this, listener)
        };
    };

    global.Base = global.Base || {};
    global.Base.Model = Model;

})(Function('return this')());