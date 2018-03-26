(function(global) {

    global.App.Injectable('bind-replace', {
        // Functions
        modifier: function(compNode, value) {
            if(compNode.self instanceof HTMLInputElement) {
                compNode.self.addEventListener('input', function(e) {
                    if(e && e.preventDefault) e.preventDefault();

                    if(typeof value === 'string')
                        value = new RegExp(value, 'g');

                    this.value = this.value.replace(value, '');
                });
            }
        },
        compare: function(oldVal, newVal) {
            return String(oldVal) === String(newVal);
        }
    });

})(Function('return this')());