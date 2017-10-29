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
                global.App.Router().navigateTo(this.redirect);
                return false;
            }
            if(!Array.isArray(matchesArr))
                matchesArr = [];
            matchesArr.push(this.controller);

            if(this.path.length < urlParts.length) {
                if(!Array.isArray(this.children))
                    return false;

                var wasFound = false;
                urlParts.splice(0, matchingParts);
                for(i = 0; i < this.children.length; i++) {
                    if(this.children[i].checkUrl(urlParts, matchesArr)) {
                        wasFound = matchesArr;
                        break;
                    }
                }
                return wasFound
            } else if(Array.isArray(this.children)) {
                var child = this.children.filter(function(c) {
                    return c.path.length === 1 && c.path[0] === '';
                });
                while(Array.isArray(child) && child.length > 0) {
                    child = child[0];
                    matchesArr.push(child.controller);
                    if(Array.isArray(child.children))
                        child = child.children.filter(function(c) {
                            return c.path.length === 0;
                        });
                }
            }
            return matchesArr;
        }

        return false;
    };

    global.Base = global.Base || {};
    global.Base.Route = Route;

})(Function('return this')());