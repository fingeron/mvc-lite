(function(global) {

    var Injectable = function(name, options) {
        this.name = name;

        // Modifier function:
        this.modifier = options.modifier.bind(this);

        // Overriding prototype functions
        if(typeof options.getter === 'function')
            this.getter = options.getter.bind(this);
        if(typeof options.compare === 'function')
            this.compare = options.compare.bind(this);

        // Other options:
        this.keepAttribute = !!options.keepAttribute;
    };

    Injectable.prototype.getter = function(statement, $scope) {
        var TAG = "[Injectable:Getter]";
        var result;
        try {
            with($scope) { result = eval(statement); }
        } catch(err) {
            console.error(TAG, this.name + ':', "Couldn't evaluate '" + statement + "'.");
        }
        return result;
    };

    global.Base = global.Base || {};
    global.Base.Injectable = Injectable;

})(Function('return this')());