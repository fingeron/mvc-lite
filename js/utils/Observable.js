(function(global) {

    var Observable = function() {
        this.listeners = [];
        this.lastMessage = undefined;
    };

    Observable.prototype = {
        subscribe: function(listener) {
            if(typeof listener === 'function') {
                this.listeners.push(listener);
                return {
                    unsubscribe: this.unsubscribe.bind(this, listener)
                }
            }
            else
                console.error(listener, 'is not a function. Cannot subscribe to Observable.');
        },

        unsubscribe: function(listener) {
            for(var i = this.listeners.length - 1; i >= 0; i--) {
                if(this.listeners[i] === listener)
                    this.listeners.splice(i, 1);
            }
        },

        next: function(value) {
            this.listeners.forEach(function(listener) {
                listener(value);
            });
            this.lastMessage = value;
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Observable = Observable;

})(Function('return this')());