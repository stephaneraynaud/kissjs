(function() {
	/** CONSTRUCTORS **/
	var Kiss = {
		singleton: (path) => {
			return new _$Component(path, {}, false, true);
		},

		component: (path, parameters) => {
			return new _$Component(path, parameters, false, false);
		}
	}

	/* v.1.0.0 */
	var TAG_MATCHER = /\{\{(.+?)\}\}/g;
	var LIST_TAG = 'list';
	var TEXT_TAG = 'text';
	var _$Component_TAG = 'kiss';
	var _$Component_ID = 'kiss:id';

	function toElement(rawHtml) {
	    var template = document.createElement('template');
	    template.innerHTML = rawHtml;
	    return template.content;
	}

	function isFunction(functionToCheck) {
	 var getType = {};
	 return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	}
	var _$Component = function(path, parameters, root, singleton) {
		var _$This = this;
		var domTemplate, rawScript;

		var name = path.split(/[/]+/).pop();

		var _$init = function() {
			if(root) {
				_$This.htmlElement = domTemplate = document.body;
			} else {
				_$This.htmlElement = document.createElement(name);
			}

			_$loadTemplate();
			_$loadController();
			_$defaultValues();
			_$parseTemplate();
			_$update();
			_$applyController();
			_$update();
		}

		var _$loadTemplate = function() {
			var fullTemplatePath = path + ".html";

			var request = new XMLHttpRequest();
			request.open("GET", fullTemplatePath, false);
			request.send(null);

			if (request.status === 200) {
				var rawTemplate = request.responseText.replace(TAG_MATCHER, '<'+_$Component_TAG+'>$1</'+_$Component_TAG+'>');
				if(root) {
					document.body.innerHTML = rawTemplate
				} else {
					domTemplate = toElement(rawTemplate);
				}
			}
		}

		var _$loadController = function() {
			var request = new XMLHttpRequest();
			request.open("GET", path + ".js", false);
			request.send(null);

			if (request.status === 200) {
				rawScript = request.responseText;
			}
		}

		var _$defaultValues = function() {
			if(typeof parameters == 'object') {
				Object.assign(_$This.htmlElement, parameters || {});
			}
		}

		var _$Thiss = {};

		var _$parseTemplate = function() {
			if(domTemplate) {
				Array.prototype.forEach.call(domTemplate.querySelectorAll(_$Component_TAG), (htmlElement) => {
					var objectPath = htmlElement.innerHTML;
					_$Thiss[objectPath] = _$Thiss[objectPath] || [];
					_$Thiss[objectPath].push(htmlElement);
				});

				Array.prototype.forEach.call(domTemplate.querySelectorAll('['+_$Component_ID.replace(':', '\\:')+']'), (htmlElement) => {
					_$This.htmlElement[htmlElement.getAttribute(_$Component_ID)] = htmlElement;
					htmlElement.removeAttribute(_$Component_ID);
				});
			}
		}

		var _$applyController = function() {
			if(rawScript) {
				_$This.htmlElement.executeScript(rawScript);
			}
		}

		var _$update = function() {
			if(domTemplate) {
				for(var objectPath in _$Thiss) {
					var htmlElements = _$Thiss[objectPath];
					var objectPathComps = objectPath.split('.');

					var value = _$This.htmlElement;
					var objectPathComp;
					while((objectPathComp = objectPathComps.shift()) && typeof value === 'object') {
						value = value[objectPathComp];
					}

					htmlElements.forEach((htmlElement, index) => {

						var nodify = function(value) {
							var node = value;

							if(!(value instanceof Node)) {
								var node = document.createElement(TEXT_TAG);
								node.innerText = value || '';
							}

							return node;
						}

						if(Array.isArray(value)) {
							var node = document.createElement(LIST_TAG);

							// TODO: improve

							value.forEach((valueItem) => {
								node.appendChild(nodify(valueItem));
							});

							htmlElement.parentNode.replaceChild(node, htmlElement);
							_$Thiss[objectPath][index] = node;
						} else {
							var node = nodify(value);
							htmlElement.parentNode.replaceChild(node, htmlElement);
							_$Thiss[objectPath][index] = node;
						}
					});
				}

				if(!root) {
					_$This.htmlElement.appendChild(domTemplate);
				}
			}

			return _$This.htmlElement;
		}

		if(singleton === true) {
			if(window[name] === undefined) {
				_$init();
				window[name] = _$This.htmlElement;
			} else {
				_$This.htmlElement = window[name];
			}
		} else {
			_$init();
		}

		_$This.htmlElement.update = _$update;
		return _$This.htmlElement;
	};

	Element.prototype.executeScript = DocumentFragment.prototype.executeScript = Document.prototype.executeScript = function(script) { eval(script); };

	new _$Component('./index', {}, true);
})();