(function(global) {

    global.App.Injectable('bind-value', {
        // Options
        justModify: true,

        // Functions
        modifier: function(compNode, value) {
            if(compNode.self instanceof HTMLInputElement)
                compNode.self.value = value;

            if(typeof value === 'function')
                value = typeof value;

            compNode.self.innerText = value;
        }
    });

})(Function('return this')());