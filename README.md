## What is this repository for? ##

Pure Ecmascript 5 library for writing updatable components and use them in your HTML code, using a personal interpretation of the 'MVC' coding pattern.

## How do I get set up? ##

All you need for this to work is to get one of the final builds ('mvc-lite.js' / 'mvc-lite.min.js') on your webpage.

## Basic usage: ##

A simple controller will look like this:

### my-controller.js: ###
```js 
(function(global) {
	global.App.Controller('my-controller', './', function($scope, _update) {
		$scope.title = "Hello World!";
	});	
})(Function('return this')());
```

* 'my-controller' - The name you will use to refer to that controller in the HTML.
* './' - The relative path for the HTML file (must be named like the controller!).
* 'function($scope, _update)' - A function that will be used to construct component instances.

### my-controller.html: ###
```html
<div class="my-controller-container">
	<h1 bind-value="title"></h1>
</div>
```

* 'bind-value' - One of the builtin injectables which will inject the value of "title" from the $scope to the element's HTML.