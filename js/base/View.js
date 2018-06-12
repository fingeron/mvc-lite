(function(global) {

    var viewOptions = global.Config.viewOptions;

    var View = function(name, relPath, template) {
        this.name = name;
        this.relPath = relPath;

        if(template)
            this.templateSrc = template;

        this.loadTemplate(relPath);
    };

    View.prototype.loadTemplate = function(relPath) {
        var _this = this,
            path = viewOptions.templatesFolder + '/' + relPath + this.name + '.html',
            cacheSuffix = global.ENV.Version,
            options = { plainText: true };

        path = path.replace(/\/\//g, '/');

        global.Utils.Http.get(path+'?v='+encodeURIComponent(cacheSuffix), {options: options}, function(response) {
            _this.templateSrc = response;
        }, function(err) {
            console.error(err);
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

        if(!this.templateSrc) {
            setTimeout(function() {
                this.generate(comp, callback);
            }.bind(this), 0);
        } else {
            if(!this.nodeTree)
                this.buildNodeTree();

            var componentTree = new global.Base.CompNode(this.nodeTree);
            for(var c = 0; c < this.nodeTree.children.length; c++) {
                componentTree.appendChild(this.nodeTree.children[c].generate(comp));
            }

            if(typeof callback === "function")
                callback(componentTree);
        }
    };

    global.Base = global.Base || {};
    global.Base.View = View;

})(Function('return this')());