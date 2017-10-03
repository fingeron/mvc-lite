(function(global) {

    var Bootstrap = function(el) {
        if(el.nodeType === 1) {

        } else
            throw { message: "Cannot bootstrap a non-element object." };
    };

    function getControllerFromEl(el) {
        var attrText = el.getAttribute('controller');
        if(typeof attrText === 'string') {
            var component = global.App.getController(attrText);
            if(component instanceof global.Base.Component)
                return component;
        }
    }

    global.Core = global.Core || {};
    global.Core.Bootstrap = Bootstrap;

})(Function('return this')());