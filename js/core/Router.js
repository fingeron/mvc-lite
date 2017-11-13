(function(global) {

    var TAG = "[Router]", routerInstance;

    var Router = function(routes) {
        // Singleton
        if(routerInstance)
            return routerInstance;

        if(Array.isArray(routes)) {
            // Initializing onhashchange:
            window.onhashchange = function() {
                if(!this.navigating) {
                    this.navigateTo(location.hash);
                }
                this.navigating = false;
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
            } else
                url = url.slice(2, url.length);
        }
        if(url !== this.currentPath) {
            this.lastPath = this.currentPath || url;
            this.currentPath = url;

            var resultsObj = this.parseUrl(url);
            if(resultsObj) {
                var results = resultsObj.results;
                if(results.redirect) {
                    this.navigateTo(results.redirect);
                } else {
                    if(typeof resultsObj.params === 'string' && resultsObj.params.length > 0) {
                        resultsObj.params = global.Utils.String.toDictionary(resultsObj.params, '&', '=');
                    }
                    history.replaceState(null, '', '#/' + url);
                    this.stateChange(resultsObj)
                }
            } else
                console.error("UNKNOWN ROUTE " + url);
        }
    };

    Router.prototype.parseUrl = function(url) {
        var urlParts = url.split('?'),
            paramsString = urlParts[1];

        // First handling the URL
        urlParts = urlParts[0].split('/').filter(function(p) {
            return p !== '#';
        });

        var results;
        for(var r = 0; r < this.routes.length && !results; r++) {
            results = this.routes[r].checkUrl(urlParts);
        }

        if(results) {
            return {
                results: results,
                params: paramsString
            }
        } else
            return false;
    };

    Router.prototype.stateChange = function(urlParseResults) {
        var results = urlParseResults.results;
        if(!this.state)
            this.state = {
                controllers: results.controllers,
                params: urlParseResults.params,
                nextController: results.controllers[0]
            };
        else {
            var affectedCompNode;
            for(var i = 0; i < results.controllers.length; i++) {
                if(results.controllers[i] !== this.state.controllers[i]) {

                    for(var j = i; j < results.controllers.length; j++) {
                        this.state.controllers[j] = results.controllers[j];
                    }

                    if(j < this.state.controllers.length)
                        this.state.controllers.splice(j, this.state.controllers.length);

                    this.state.nextController = results.controllers[i];
                    affectedCompNode = this.state.compNodes[i];
                    break;
                }
            }
            // Params check
            if(typeof urlParseResults.params === 'object') {
                for(var param in urlParseResults.params) if(urlParseResults.params.hasOwnProperty(param))
                    this.updateParam(param, urlParseResults.params[param]);
                for(param in this.state.params) if(this.state.params.hasOwnProperty(param))
                    if(!urlParseResults.params[param])
                        this.updateParam(param);
            } else {
                var stateParams = this.state.params;
                if(typeof stateParams === 'object')
                    for(param in stateParams) if(stateParams.hasOwnProperty(param))
                        this.updateParam(param);
            }
            if(affectedCompNode instanceof global.Base.CompNode) {
                var comp = affectedCompNode.comp,
                    newCompNode = affectedCompNode.viewNode.generate(comp);
                affectedCompNode.parent.replaceChild(newCompNode, affectedCompNode);
                newCompNode.bootstrap(comp.parent);
            }
        }
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

    Router.prototype.updateParam = function(key, value) {
        var params = this.params(), changes = 0;
        if(params[key] !== value) {
            if(!value || value.length === 0)
                delete params[key];
            else
                params[key] = value;
            changes++;

            // emit to subscriptions
            if(this.paramSubscriptions) {
                var subsObservable = this.paramSubscriptions[key];
                if(subsObservable instanceof global.Utils.Observable) {
                    subsObservable.next(value);
                }
            }
        }
        if(changes > 0) {
            this.navigating = true;
            var currUrl = location.hash;
            currUrl = currUrl.split('?')[0] + '?';
            for(var param in params) if(params.hasOwnProperty(param)) {
                currUrl += param + '=' + params[param] + '&'
            }
            location.hash = currUrl.substr(0, currUrl.length - 1);
            this.currentPath = location.hash.substr(2, location.hash.length);
        }
        if(this.state) this.state.params = params;
    };

    Router.prototype.subscribeToParam = function(param, listener) {
        if(typeof this.paramSubscriptions !== 'object')
            this.paramSubscriptions = {};
        var subs = this.paramSubscriptions;
        if(!(subs[param] instanceof global.Utils.Observable))
            subs[param] = new global.Utils.Observable();
        var subscription = subs[param].subscribe(listener);
        if(this.state && this.state.params) {
            listener(this.state.params[param]);
        }
        return subscription;
    };

    Router.prototype.isLandingPage = function() {
        return this.lastPath === this.currentPath;
    };

    Router.prototype.params = function() {
        return (this.state && typeof this.state.params === 'object') ?
                this.state.params :
                {};
    };

    global.Core = global.Core || {};
    global.Core.Router = Router;

})(Function('return this')());