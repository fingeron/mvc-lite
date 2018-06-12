(function(global) {

    var TAG = '[Object]';

    var ObjectFuncs = {
        findInObject: function(obj, path) {
            var parts = path.split('.'), i = 0;

            while(parts.length > 0 && typeof obj === 'object')
                obj = obj[parts[i++]];

            return obj;
        },
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
                if(Array.isArray(ignore))
                    return ignore.indexOf(property) >= 0;
                else if(property === ignore)
                    return true;

                return false;
            }

            return changes;
        },
        /*
        * Input: list=[{name: "yossi"}, ...]&key='name'
        * Output: { yossi: {name: "yossi"}, ...}
        * */
        makeDictionary: function(list, key) {
            if(!Array.isArray(list) || typeof key !== 'string')
                return console.error(TAG, 'makeDictionary usage error.');
            var dict = {};
            for(var i = 0; i < list.length; i++)
                if(typeof list[i] === 'object')
                    dict[this.findInObject(list[i], key)] = list[i];
            return dict;
        },
        groupByKey: function(list, key) {
            if(!Array.isArray(list) || typeof key !== 'string')
                return console.error(TAG, 'groupByKey usage error.');
            var group = {}, item, itemKey;
            for(var i = 0; i < list.length; i++) {
                item = list[i];
                itemKey = this.findInObject(item, key);
                group[itemKey] = group[itemKey] || [];
                group[itemKey].push(item);
            }
            return group;
        }
    };

    global.Utils = global.Utils || {};
    global.Utils.Object = ObjectFuncs;

})(Function('return this')());