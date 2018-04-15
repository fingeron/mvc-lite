(function(global) {

    var TAG = "[Router-Outlet]";

    global.App.Injectable('router-outlet', {
        getter: function(statement, comp) {
            return true;
        },
        modifier: function(compNode, value) {
            var Router = global.App.Router(),
                controllerName = Router.nextController(compNode),
                controller = global.App.getController(controllerName);

            if(controller instanceof global.Base.Controller)
                compNode.self.setAttribute('controller', controllerName);
            else
                throw TAG + ' could not find controller "' + controllerName + '".';
        }
    });

})(Function('return this')());