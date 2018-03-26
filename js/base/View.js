(function(global) {

    var viewOptions = global.Config.viewOptions;

    var View = function(name, relPath, template) {
        this.name = name;
        this.relPath = relPath;

        if(template)
            this.templateSrc = template;
    };

    View.prototype.loadTemplate = function(relPath, callback) {
        var _this = this,
            path = viewOptions.templatesFolder + '/' + relPath + this.name + '.html',
            options = { plainText: true };

        path = path.replace(/\/\//g, '/');

        global.Utils.Http.get(path+'?v='+(+new Date()), {options: options}, function(response) {
            _this.templateSrc = response;
            callback(true);
        }, function(err) {
            console.error(err);
            callback(false);
        });
    };

    View.prototype.buildNodeTree = function() {
        var tempEl = document.createElement('temp');
        tempEl.innerHTML = this.templateSrc;

        // Creating node tree
        var viewNode = new global.Base.ViewNode(document.createElement(this.name));
        for(var i = 0; i < tempEl.childNodes.length; i++) {
            viewNode.children.push(buildNodeObject(tempEl.childNodes[i]));
        }

        // NodeTree was created and saved in the view.
        this.nodeTree = viewNode;

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

    View.prototype.generate = function(comp, callback) {
        var _this = this;

        if(!this.nodeTree) {
            this.loadTemplate(this.relPath, function(success) {
                if(success) {
                    _this.buildNodeTree();
                    _this.generate(comp, callback);
                } else
                    console.error("[View:" + _this.name + "] Error loading view file.");
            });
        } else {
            var componentTree = new global.Base.CompNode(this.nodeTree);
            for(var c = 0; c < this.nodeTree.children.length; c++) {
                componentTree.appendChild(this.nodeTree.children[c].generate(comp));
            }
            callback(componentTree);
        }
    };

    global.Base = global.Base || {};
    global.Base.View = View;

})(Function('return this')());