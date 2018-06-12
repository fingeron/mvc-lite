(function(global) {

    // Filling the missing
    if(typeof Array.prototype.find === 'undefined')
        Array.prototype.find = function(evaluator) {
            for(var i = 0; i < this.length; i++) {
                if(evaluator(this[i]))
                    return this[i];
            }
        };

    var ArrayFunctions = {
        clean: function(arr) {
            if(!Array.isArray(arr))
                throw { message: "[Array:Clean] Cannot work with a non-array!" };

            for(var i = 0; i < arr.length; i++) {
                if(arr[i] === undefined) {
                    arr.splice(i, 1);
                    i--;
                } else if(Array.isArray(arr[i]))
                    this.clean(arr[i]);
            }
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Array = ArrayFunctions;

})(Function('return this')());