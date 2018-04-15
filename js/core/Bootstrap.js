(function(global) {

    var Bootstrap = function(el, parent, inputs, cb) {
        if(el.nodeType === 1) {
            var controller = getControllerFromEl(el);
            if(controller instanceof global.Base.Controller) {
                return controller.generateComponent(el, parent, inputs, cb);
            } else
                throw { message: "Controller " + el.getAttribute('controller') + " not found." };
        } else
            throw { message: "Cannot bootstrap a non-element object." };
    };

    function getControllerFromEl(el) {
        var attrText = el.getAttribute('controller');
        if(typeof attrText === 'string') {
            var controller = global.App.getController(attrText);
            if(controller instanceof global.Base.Controller)
                return controller;
        }
    }

    global.Core = global.Core || {};
    global.Core.Bootstrap = Bootstrap;

})(Function('return this')());