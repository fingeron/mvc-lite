(function(global) {

    global.App.Injectable('bind-events', {
        getter: function(statement, $scope) {
            var events = global.Utils.String.toDictionary(statement);
            for(var event in events) if(events.hasOwnProperty(event)) {
                events[event] = function(eventStatement) {
                    try {
                        with($scope) {
                            eval(eventStatement);
                        }
                    } catch(err) {
                        throw (this.name + ": " + err.message)
                    }
                }.bind(this, events[event]);
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