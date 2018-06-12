(function(global) {

    var TAG = "[Router]", routerInstance;

    var Router = function(routes) {
        // Singleton
        if(routerInstance)
            return routerInstance;

        if(Array.isArray(routes)) {
            // Initializing onhashchange:
            window.onhashchange = function() {
                this.navigateTo(location.hash, true);
            }.bind(this);
            var defaultRoute;
            // Initializing Router
            try {
                this.routes = routes.map(function(r) {
                    if(r.setAsDefault)
                        defaultRoute = r;
                    return new global.Base.Route(r);
                });
            } catch(err) {
                throw err;
            }
            this.navigations = 0;
            this.onStateChange = new global.Utils.Observable();
            routerInstance = this;

            if(defaultRoute)
                this.defaultRoute = defaultRoute;

            this.navigateTo(location.hash);
        } else
            throw { message: TAG + " Router should accept an array of routes." };
    };

    Router.prototype.navigateTo = function(url, fromWindow) {
        //TODO: remove this.
        if(url.indexOf(';') >= 0) url = url.replace(/;/g, '?');
        if(url[0] === '/') url = url.slice(1, url.length);

        // First validate url
        if(url[0] === '#')
            url = url.slice((url[1] !== '/' ? 1 : 2), url.length);

        var pageEl;
        url = url.split('#');
        if(url.length > 1)
            pageEl = url[1];
        url = url[0];

        if(url !== this.currentPath) {
            // An identifier for Router state.
            this.navigating = true;

            var urlParams = url.split('?');

            // Checking if base route changed
            var baseRoute = urlParams[0],
                rawParams = (urlParams.length > 1) ? urlParams[1] : '',
                currentBaseRoute = (this.currentPath || '').split('?')[0],
                baseRouteChanged = baseRoute !== currentBaseRoute;

            // Updating Router variables
            this.navigations++;
            this.lastPath = this.currentPath || url;
            this.currentPath = url;

            var resultsObj = this.parseUrl(url);
            if(resultsObj) {
                var results = resultsObj.results;
                if(results.redirect) {
                    if(rawParams.length > 0) results.redirect += '?' + rawParams;
                    this.navigateTo(results.redirect);
                } else {
                    if(typeof resultsObj.params === 'string' && resultsObj.params.length > 0) {
                        resultsObj.params = global.Utils.String.toDictionary(resultsObj.params, '&', '=');
                    }
                    if(fromWindow)
                        history.replaceState(null, '', '#/' + url + (pageEl ? '#' + pageEl : ''));
                    else
                        history.pushState(null, '', '#/' + url + (pageEl ? '#' + pageEl : ''));
                    this.stateChange(resultsObj)
                }
            } else if(this.defaultRoute) {
                this.navigateTo(this.defaultRoute.path);
            } else
                console.error(TAG, "UNKNOWN ROUTE '" + url + "'. To avoid this error please 'setAsDefault' your main path.");

            this.navigating = false;
            this.onStateChange.next(this.currentPath, baseRouteChanged);
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
                    if(i+1 >= this.state.controllers.length)
                        this.state.nextController = this.state.controllers[0];
                    else
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
            var currUrl = location.hash;
            currUrl = currUrl.split('?')[0] + '?';
            for(var param in params) if(params.hasOwnProperty(param)) {
                currUrl += param + '=' + params[param] + '&'
            }
            currUrl = currUrl.substr(2, currUrl.length - 3);

            if(!this.navigating)
                history.pushState(null, '', '#/' + currUrl);
            else
                history.replaceState(null, '', '#/' + currUrl);

            this.onStateChange.next(currUrl);
            this.currentPath = currUrl;
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
        return this.lastPath === this.currentPath
                && this.navigations === 1;
    };

    Router.prototype.params = function() {
        return (this.state && typeof this.state.params === 'object') ?
                this.state.params :
                {};
    };

    global.Core = global.Core || {};
    global.Core.Router = Router;

})(Function('return this')());