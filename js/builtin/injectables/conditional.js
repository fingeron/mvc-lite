(function(global) {

    global.App.Injectable('bind-if', {
        getter: function(statement, comp) {
            var result;
            try {
                with(comp.$scope) { result = eval(statement); }
            } catch(err) {
                throw this.name + ": Couldn't evaluate '" + statement + "'.";
            }
            return !!result;
        },
        modifier: function(compNode, value) {
            if(!value) {
                compNode.self = undefined;
            }
        }
    });

})(Function('return this')());