(function(global) {

    global.App.Injectable('bind-if', {
        getter: function(statement, comp) {
            return !!(comp.evalWithScope(statement));
        },
        modifier: function(compNode, value) {
            if(!value) {
                compNode.self = undefined;
            }
        }
    });

})(Function('return this')());