(function(global) {

    global.App.Injectable('content-outlet', {
        // Functions
        getter: function(statement, comp) {
            return comp;
        },
        modifier: function(compNode, comp) {
            if(comp.subView) {
                compNode.replaceSelfWith = comp.subView.generate(comp.parent);
            }
        }
    });

})(Function('return this')());