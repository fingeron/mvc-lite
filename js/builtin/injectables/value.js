(function(global) {

    global.App.Injectable('bind-value', {
        // Options
        justModify: true,

        // Functions
        modifier: function(compNode, value) {
            compNode.self.innerHTML = value;
        }
    });

})(Function('return this')());