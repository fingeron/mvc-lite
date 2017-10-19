(function(global) {

    global.App.Injectable('bind-class', {
        // Options
        justModify: true,

        // Functions
        getter: function(statement, $scope) {
            var classes = global.Utils.String.toDictionary(statement),
                value;
            try {
                with($scope) {
                    for(var className in classes) if(classes.hasOwnProperty(className)) {
                        value = eval(classes[className]);
                        classes[className] = !!value;
                    }
                }
            } catch(err) {
                throw { message: this.name + ": " + err.message };
            }
            return classes;
        },
        modifier: function(compNode, value) {
            for(var className in value) if(value.hasOwnProperty(className)) {
                value[className] ?
                    compNode.self.classList.add(className) :
                    compNode.self.classList.remove(className);
            }
        }
    });

})(Function('return this')());