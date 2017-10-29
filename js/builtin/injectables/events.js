(function(global) {

    global.App.Injectable('bind-events', {
        getter: function(statement, $scope) {
            var events = global.Utils.String.toDictionary(statement),
                matches, funcName, variables;

            for(var event in events) if(events.hasOwnProperty(event)) {
                var regEx = new RegExp("^(.+)\\((.*)\\)$");
                matches = events[event].match(regEx);
                funcName = matches[1];
                variables = matches[2].split(',');

                for(var i = 0; i < variables.length; i++) {
                    try {
                        with($scope) {
                            variables[i] = eval(variables[i]);
                        }
                    } catch(err) {
                        throw (this.name + ": " + err.message)
                    }
                }

                events[event] = function(funcName, variables) {
                    var func;
                    try {
                        with($scope) {
                            func = eval(funcName);
                        }
                        func.apply(undefined, variables);
                    } catch(err) {
                        throw (this.name + ": " + err.message)
                    }
                }.bind(this, funcName, variables);
            }
            return events;
        },
        modifier: function(compNode, value) {
            for(var event in value) if(value.hasOwnProperty(event)) {
                compNode.self.addEventListener(event, function(callback, e) {
                    if(e && e.preventDefault) e.preventDefault();
                    try {
                        callback();
                    } catch(err) {
                        console.error('[Injectable]', err);
                    }
                }.bind(this, value[event]));
            }
        },
        compare: function(oldVal, newVal) {
            return true;
        }
    });

})(Function('return this')());