(function(global) {

    global.App.Injectable('bind-if', {
        modifier: function(compNode, value) {
            if(!value) {
                compNode.self = undefined;
            }
        }
    });

})(Function('return this')());