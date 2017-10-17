(function(global) {

    var Controllers = {};
    var Injectables = {};
    var Routers     = {};

    global.App = {
        // Getters
        getController: function(name) {
            return Controllers[name];
        },
        getInjectable: function(name) {
            return Injectables[name];
        },

        // Generators
        Bootstrap: bootstrapApp,
        Controller: generateController,
        Injectable: generateInjectable
    };

    function bootstrapApp(componentName) {
        var TAG = "[Bootstrap]";

        var compEl = document.querySelector('*[controller="' + componentName + '"]');
        if(compEl && compEl.nodeType === 1) {
            try {
                var result = global.Core.Bootstrap(compEl);
            } catch(err) {
                console.error(TAG, err.message);
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

})(Function('return this')());