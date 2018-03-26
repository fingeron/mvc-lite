(function(global) {

    global.App.Injectable('bind-for', {
        getter: function(statement, comp) {
            var words = statement.split(' '),
                result = {};
            for(var w = 0; w < words.length; w++) {
                if(words[w] === 'in' && w > 0 && w < (words.length-1)) {
                    result.array = comp.evalWithScope(words[w+1]);
                    result.varName = words[w-1];
                }
                if(words[w] === 'let' && w < (words.length-2)) {
                    var varName = words[++w], varType = words[++w];
                    switch (varType) {
                        case 'index':
                            result.indexVarName = varName;
                            break;
                        default:
                            break;
                    }
                }
            }
            return result;
        },
        modifier: function(compNode, value) {
            compNode.self = document.createElement('iterator');
            compNode.multipleNodes = true;
            compNode.iterator = value;
        },
        compare: function(oldVal, newVal) {
            return oldVal.array === newVal.array;
        }
    });

})(Function('return this')());