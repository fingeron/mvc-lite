(function(global) {

    global.App.Injectable('bind-value', {
        modifier: function(compNode, value) {
            compNode.self.innerHTML = value;
        }
    });

})(Function('return this')());