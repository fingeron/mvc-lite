(function(global) {

    var TAG = "[Route]";

    var Route = function(options) {
        if(options.hasOwnProperty('path'))
            this.path = options.path.split('/');
        else
            throw { message: TAG + " Route must have a path." };

        if(options.hasOwnProperty('controller')) {
            this.controller = options.controller;
        } else if(options.hasOwnProperty('redirect'))
            this.redirect = options.redirect;
        else
            throw { message: TAG + " Route must have a controller." };

        if(Array.isArray(options.children))
            this.children = options.children.map(function(child) {
                return new Route(child);
            });
    };

    Route.prototype.checkUrl = function(urlParts, matchesArr) {
        var matchingParts = 0;

        if(this.path.length > urlParts.length)
            return false;

        for(var i = 0; i < this.path.length; i++) {
            if(this.path[i] === urlParts[i])
                matchingParts++;
        }

        if(this.path.length === matchingParts) {
            if(this.redirect) {
                return { redirect: this.redirect };
            }
            if(!Array.isArray(matchesArr))
                matchesArr = [];
            matchesArr.push(this.controller);

            if(this.path.length < urlParts.length) {
                if(!Array.isArray(this.children))
                    return false;

                var wasFound = false;
                urlParts.splice(0, matchingParts);
                for(i = 0; i < this.children.length && !wasFound; i++) {
                    var childResults = this.children[i].checkUrl(urlParts, matchesArr);
                    if(childResults) {
                        if(childResults.redirect)
                            return childResults;
                        wasFound = matchesArr;
                    }
                }
                return wasFound ? { controllers: wasFound } : wasFound;
            // This is to handle 'path' && 'path/' to reach the same child.
            } else if(Array.isArray(this.children)) {
                var child = this.children.find(function(c) {
                    return c.path.length === 1 && c.path[0] === '';
                });
                if(child)
                    return child.checkUrl([''], matchesArr);
            }
            return {
                controllers: matchesArr
            };
        }

        return false;
    };

    global.Base = global.Base || {};
    global.Base.Route = Route;

})(Function('return this')());