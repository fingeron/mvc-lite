(function(global) {

    global.App.Injectable('bind-value', {
        // Options
        justModify: true,

        // Functions
        modifier: function(compNode, value) {
            if(compNode.self instanceof HTMLInputElement)
                compNode.self.value = value;
            compNode.self.innerHTML = value;
        }
    });

})(Function('return this')());