(function(global) {

    var TAG = "[Injectable]";

    var Injectable = function(name, options) {
        this.name = name;

        // Modifier function:
        try {
            this.modifier = options.modifier.bind(this);
        } catch(err) {
            console.error(TAG, this.name + ": No modifier set.");
        }

        // Overriding prototype functions
        if(typeof options.getter === 'function')
            this.getter = options.getter.bind(this);
        if(typeof options.compare === 'function')
            this.compare = options.compare.bind(this);

        // Other options:
        this.keepAttribute = !!options.keepAttribute;
        this.justModify = !!options.justModify;
    };

    Injectable.prototype.getter = function(statement, $scope) {
        var result;
        try {
            with($scope) { result = eval(statement); }
        } catch(err) {
            console.error(TAG, this.name + ':', "Couldn't evaluate '" + statement + "'.");
        }
        return result;
    };

    Injectable.prototype.compare = function(oldVal, newVal) {
        if(oldVal === newVal)
            return true;
    };

    global.Base = global.Base || {};
    global.Base.Injectable = Injectable;

})(Function('return this')());