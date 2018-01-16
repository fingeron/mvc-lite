(function(global) {

    global.App.Injectable('bind-attr', {
        // Options
        justModify: true,

        // Functions
        getter: function(statement, comp) {
            var attributes = global.Utils.String.toDictionary(statement),
                value;
            try {
                with(comp.$scope) {
                    for(var attr in attributes) if(attributes.hasOwnProperty(attr)) {
                        value = eval(attributes[attr]);
                        attributes[attr] = value;
                    }
                }
            } catch(err) {
                throw { message: this.name + ": " + err.message };
            }
            return attributes;
        },
        modifier: function(compNode, value) {
            for(var attr in value) if(value.hasOwnProperty(attr))
                compNode.self.setAttribute(attr, value[attr]);
        }
    });

})(Function('return this')());