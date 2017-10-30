(function(global) {

    var ObjectFuncs = {
        updateObject: function(origin, update, ignore) {
            if(origin && update) {
                var changes = 0;
                if(typeof origin === 'object' && typeof update === 'object') {
                    for(var property in update) if(update.hasOwnProperty(property) && !isIgnored(property)) {
                        switch(typeof update[property]) {
                            case 'object':
                                if(Array.isArray(update[property])) {
                                    console.warning('[Utils:Object] "updateObject" does not support merging arrays.');
                                } else
                                    changes += ObjectFuncs.updateObject(origin[property], update[property]);
                                break;
                            default:
                                if(origin[property] !== update[property]) {
                                    origin[property] = update[property];
                                    changes++;
                                }
                                break;
                        }
                    }
                }
            }

            function isIgnored(property) {
                if(Array.isArray(ignore)) {
                    for(var i = 0; i < ignore.length; i++) {
                        if(property === ignore[i]) {
                            return true;
                        }
                    }
                } else if(property === ignore)
                    return true;

                return false;
            }

            return changes;
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Object = ObjectFuncs;

})(Function('return this')());