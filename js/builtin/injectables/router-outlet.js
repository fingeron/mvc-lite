(function(global) {

    var TAG = "[Router-Outlet]";

    global.App.Injectable('router-outlet', {
        getter: function(statement, $scope) {
            return true;
        },
        modifier: function(compNode, value) {
            var Router = global.Core.Router(),
                controllerName = Router.nextController(compNode),
                controller = global.App.getController(controllerName);

            if(controller instanceof global.Base.Controller) {
                compNode.self.setAttribute('controller', controllerName);
            }
        }
    });

})(Function('return this')());