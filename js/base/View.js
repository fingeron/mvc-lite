(function(global) {

    var viewOptions = global.Config.viewOptions;

    var View = function(name, relPath) {
        this.name = name;
        this.loadTemplate(relPath);
        this.buildNodeTree();
    };

    View.prototype.loadTemplate = function(relPath) {
        var path = viewOptions.templatesFolder + '/' + relPath + this.name + '.html';
        path = path.replace(/\/\//g, '/');

        this.templateSrc = getTemplate(path);

        function getTemplate(path) {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', path, false);
            xhr.send();
            return xhr.responseText;
        }
    };

    View.prototype.buildNodeTree = function() {
        var tempEl = document.createElement('temp'),
            nodeTree = [];

        tempEl.innerHTML = this.templateSrc;
        for(var i = 0; i < tempEl.childNodes.length; i++) {
            nodeTree.push(buildNodeObject(tempEl.childNodes[i]));
        }

        // NodeTree was created and saved in the view.
        this.nodeTree = nodeTree;

        function buildNodeObject(DOMNode) {
            var viewNode = new global.Base.ViewNode(DOMNode),
                childNode;
            for(var n = 0; n < DOMNode.childNodes.length; n++) {
                childNode = buildNodeObject(DOMNode.childNodes[n]);
                childNode.parent = viewNode;
                viewNode.children.push(childNode);
            }
            return viewNode;
        }
    };

    View.prototype.generate = function($scope) {
        var componentTree = new global.Base.CompNode(document.createElement(this.name)),
            compNode;
        for(var c = 0; c < this.nodeTree.length; c++) {
            compNode = this.nodeTree[c].generate($scope);
            componentTree.appendChild(compNode);
        }
        return componentTree;
    };

    global.Base = global.Base || {};
    global.Base.View = View;

})(Function('return this')());