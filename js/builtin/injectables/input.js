(function(global) {

    global.App.Injectable('input', {
        getter: function(statement, $scope) {
            var inputs = global.Utils.String.toDictionary(statement);
            try {
                for(var input in inputs) if(inputs.hasOwnProperty(input)) {
                    with($scope) {
                        inputs[input] = eval(inputs[input]);
                    }
                }
            } catch(err) {
                throw { message: this.name + ": " + err.message };
            }
            return inputs;
        },
        modifier: function(compNode, value) {
            compNode.inputs = value;
        },
        compare: function(oldVal, newVal) {
            var equals = true;
            for(var input in newVal) if(newVal.hasOwnProperty(input)) {
                if(newVal[input] !== oldVal[input]) {
                    equals = false;
                    break;
                }
            }
            return equals;
        }
    });

})(Function('return this')());