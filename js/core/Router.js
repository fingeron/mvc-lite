(function(global) {

    var TAG = "[Router]", routerInstance;

    var Router = function(routes) {
        // Singleton
        if(routerInstance)
            return routerInstance;

        if(Array.isArray(routes)) {
            // Initializing onhashchange:
            window.onhashchange = function() {
                this.navigateTo(window.location.hash);
            }.bind(this);
            // Initializing Router
            try {
                this.routes = routes.map(function(r) {
                    return new global.Base.Route(r);
                });
            } catch(err) {
                throw err;
            }
            routerInstance = this;

            this.navigateTo(location.hash);
        } else
            throw { message: TAG + " 'routes' should be an array of routes." };
    };

    Router.prototype.navigateTo = function(url) {
        // First validate url
        if(url[0] === '#') {
            if(url[1] !== '/') {
                url = url.slice(1, url.length);
                history.pushState(null, '', '#/' + url);
            } else
                url = url.slice(2, url.length);
        } else {
            history.pushState(null, '', '#/' + url);
        }
        if(url !== this.currentPath) {
            this.currentPath = url;

            var urlResult = this.parseUrl(url);
            if(urlResult) {
                if(urlResult.params) {
                    var params = urlResult.params.split('&'),
                        paramsObject = {};
                    for(var i = 0; i < params.length; i++) {
                        params[i] = params[i].split('=');
                        paramsObject[params[i][0]] = params[i][1];
                    }
                    this.params = paramsObject;
                }
                this.stateChange(urlResult)
            }
        }
    };

    Router.prototype.stateChange = function(urlParseResults) {
        if(!this.state)
            this.state = {
                controllers: urlParseResults.controllers,
                nextController: urlParseResults.controllers[0]
            };
        else {
            var affectedCompNode;
            for(var i = 0; i < urlParseResults.controllers.length; i++) {
                if(urlParseResults.controllers[i] !== this.state.controllers[i]) {

                    for(var j = i; j < urlParseResults.controllers.length; j++) {
                        this.state.controllers[j] = urlParseResults.controllers[j];
                    }

                    if(j < this.state.controllers.length)
                        this.state.controllers.splice(j, this.state.controllers.length);

                    this.state.nextController = urlParseResults.controllers[i];
                    affectedCompNode = this.state.compNodes[i];
                    break;
                }
            }
            var comp = affectedCompNode.comp,
                newCompNode = affectedCompNode.viewNode.generate(comp.$scope);
            affectedCompNode.parent.replaceChild(newCompNode, affectedCompNode);
            newCompNode.bootstrap();
        }
    };

    Router.prototype.parseUrl = function(url) {
        var urlParts = url.split('?'),
            paramsString = urlParts[1];

        // First handling the URL
        urlParts = urlParts[0].split('/').filter(function(p) {
            return p !== '#';
        });

        var match;
        for(var r = 0; r < this.routes.length && !match; r++) {
            match = this.routes[r].checkUrl(urlParts);
        }

        if(match) {
            return {
                controllers: match,
                params: paramsString
            }
        } else
            return false;
    };

    Router.prototype.nextController = function(compNode) {
        if(this.state && this.state.nextController) {
            // Saving nextController and clearing it's data
            var nextController = this.state.nextController;
            this.state.nextController = undefined;

            // Searching for it's place in the stack
            for(var i = 0; i < this.state.controllers.length; i++) {
                if(nextController === this.state.controllers[i]) {
                    // Creating an array to save compNodes accordingly
                    if(!Array.isArray(this.state.compNodes)) this.state.compNodes = [];

                    // Assigning next controller on the stack to nextController
                    this.state.nextController = this.state.controllers[i+1];

                    // Placing the compNode in it's correct place
                    this.state.compNodes[i] = compNode;
                    break;
                }
            }
            return nextController;
        } else
            console.error(TAG, "Failed to load next controller, end of list.");
    };

    global.Core = global.Core || {};
    global.Core.Router = Router;

})(Function('return this')());