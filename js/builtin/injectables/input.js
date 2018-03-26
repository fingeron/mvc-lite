(function(global) {

    global.App.Injectable('input', {
        getter: function(statement, comp) {
            var inputs = global.Utils.String.toDictionary(statement);
            for(var input in inputs) if(inputs.hasOwnProperty(input)) {
                inputs[input] = comp.evalWithScope(inputs[input]);
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