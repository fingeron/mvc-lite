(function(global) {

    var CompNode = function(DOMNode, values) {
        this.self = DOMNode;
        if(Array.isArray(values))
            this.values = values;
        this.children = [];
    };

    CompNode.prototype.appendChild = function(child) {
        this.children.push(child);
        child.parent = this;
        if(child.self) {
            this.self.appendChild(child.self);
        }
    };

    CompNode.prototype.removeChild = function(child) {
        this.children.splice(this.children.indexOf(child), 1);
        child.children.forEach(function(child2) {
            child.removeChild(child2);
        });
        this.self.removeChild(child.self);
    };

    global.Base = global.Base || {};
    global.Base.CompNode = CompNode;

})(Function('return this')());