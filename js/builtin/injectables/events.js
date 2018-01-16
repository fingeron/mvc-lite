(function(global) {

    global.App.Injectable('bind-events', {
        getter: function(statement, comp) {
            var entryRegExp = new RegExp('([a-z]+\\: ?.+?\\(.*?\\)), ?');

            var events = global.Utils.String.toDictionary(statement, false, false, entryRegExp),
                matches, funcName, variables;

            for(var event in events) if(events.hasOwnProperty(event)) {
                var regEx = new RegExp("^(.+)\\((.*)\\)$");
                matches = events[event].match(regEx);

                if(!Array.isArray(matches) || matches.length < 2)
                    throw (this.name + ": Invalid statement, expecting: [event: func()]");

                funcName = matches[1];
                variables = matches[2].split(',');

                for(var i = 0; i < variables.length; i++) {
                    try {
                        with(comp.$scope) {
                            variables[i] = eval(variables[i]);
                        }
                    } catch(err) {
                        throw (this.name + ": " + err.message)
                    }
                }

                events[event] = {
                    variables: variables,
                    func: function(funcName, variables, el) {
                        var func;
                        try {
                            with(comp.$scope) {
                                func = eval(funcName);
                            }
                        } catch(err) {
                            throw (this.name + ": " + err.message)
                        }
                        if(typeof func === 'function')
                            func.apply(el, variables);
                    }.bind(this, funcName, variables)
                };
            }
            return events;
        },
        modifier: function(compNode, value) {
            for(var event in value) if(value.hasOwnProperty(event)) {
                compNode.self.addEventListener(event, function(callback, e) {
                    if(e && e.preventDefault) e.preventDefault();
                    try {
                        callback(e.currentTarget);
                    } catch(err) {
                        console.error('[Injectable]', err);
                    }
                }.bind(this, value[event].func));
            }
        },
        compare: function(oldVal, newVal) {
            for(var event in oldVal) {
                if(!newVal[event])
                    return false;

                var oldVars = oldVal[event].variables, newVars = newVal[event].variables;
                if(oldVars.length !== newVars.length)
                    return false;

                for(var i = 0; i < oldVars.length; i++) {
                    if(oldVars[i] !== newVars[i])
                        return false;
                }
            }
            return true;
        }
    });

})(Function('return this')());