(function(global) {

    var ObjectFuncs = {
        updateObject: function(origin, update) {
            var changes = 0;
            if(typeof origin === 'object' && typeof update === 'object') {
                for(var property in update) if(update.hasOwnProperty(property)) {
                    switch(typeof update[property]) {
                        case 'object':
                            if(!Array.isArray(update[property]))
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
            return changes;
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Object = ObjectFuncs;

})(Function('return this')());