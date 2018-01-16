(function(global) {

    var Controllers = {},
        Models      = {},
        Injectables = {},
        Pipes       = {},
        routerInstance;

    global.App = {
        // Getters
        getController: function(name) {
            return Controllers[name];
        },
        getModel: function(name) {
            return Models[name];
        },
        getInjectable: function(name) {
            return Injectables[name];
        },
        getPipe: function(name) {
            return Pipes[name];
        },

        // Generators
        Bootstrap: bootstrapApp,
        Controller: generateController,
        Model: createModel,
        Injectable: generateInjectable,
        Pipe: generatePipe,
        Router: getRouter
    };

    function bootstrapApp(componentName, options) {
        var TAG = "[Bootstrap]";

        if(typeof options === 'object')
            global.Utils.Object.updateObject(global.Config, options);

        var compEl = document.querySelector('*[controller="' + componentName + '"]');
        if(compEl && compEl.nodeType === 1) {
            try {
                var result = global.Core.Bootstrap(compEl);
            } catch(err) {
                console.error(TAG, err.message || err);
            }
            return result;
        } else
            console.error(TAG, "Could not find placeholder for '" + componentName + "'.");
    }

    function generateController(name, relViewPath, constructor) {
        var TAG = "[Controller]";

        try {
            // Creating a View
            var view = new global.Base.View(name, relViewPath);

            // Returning a Controller with the generated View
            Controllers[name] = new global.Base.Controller(name, view, constructor);
        } catch(err) {
            console.error(TAG, err.message);
        }
    }

    function generateInjectable(name, options) {
        var TAG = "[Injectable]";
        try {
            Injectables[name] = new global.Base.Injectable(name, options);
        } catch(err) {
            console.error(TAG, err.message);
        }
    }

    function createModel(name, initFunc) {
        var TAG = "[Model]";
        try {
            Models[name] = new global.Base.Model(name, initFunc);
        } catch(err) {
            console.error(TAG, err.message);
        }
    }

    function generatePipe(name, func) {
        var TAG = "[Pipe]";
        try {
            Pipes[name] = new global.Base.Pipe(name, func);
        } catch(err) {
            console.error(TAG, err.message);
        }
    }

    function getRouter(routes) {
        if(!routerInstance)
            routerInstance = new global.Core.Router(routes);

        return routerInstance;
    }

})(Function('return this')());