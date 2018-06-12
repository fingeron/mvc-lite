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
            this.listeners.splice(this.listeners.indexOf(listener), 1);
        },

        next: function() {
            var args = arguments;
            this.listeners.forEach(function(listener) { listener.apply({}, args); });
            this.lastMessage = args.length > 1 ? args : args[0];
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Observable = Observable;

})(Function('return this')());