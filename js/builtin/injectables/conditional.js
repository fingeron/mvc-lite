(function(global) {

    global.App.Injectable('bind-value', {
        modifier: function(compNode, value) {
            if(!value) {
                if(compNode.parent)
                    compNode.parent.removeChild(compNode);
                else
                    compNode.self = undefined;
            }
        }
    });

})(Function('return this')());