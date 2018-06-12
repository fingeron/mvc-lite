(function(global) {

    global.App.Injectable('bind-attr', {
        // Options
        justModify: true,

        // Functions
        getter: function(statement, comp) {
            var attributes = global.Utils.String.toDictionary(statement),
                value;
            for(var attr in attributes) if(attributes.hasOwnProperty(attr)) {
                value = comp.evalWithScope(attributes[attr]);
                attributes[attr] = value;
            }
            return attributes;
        },
        modifier: function(compNode, value) {
            for(var attr in value)
                if(value.hasOwnProperty(attr)) {
                    if(value[attr] === false)
                        compNode.self.removeAttribute(attr);
                    else if(value[attr] === true)
                        compNode.self.setAttribute(attr, '');
                    else
                        compNode.self.setAttribute(attr, value[attr]);
                }
        }
    });

})(Function('return this')());