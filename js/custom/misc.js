/**********************************************************
* Misc.js
*
* Various miscellanious JS helper functions for ArtCoco
*
* Table of Contents (rough):
	1. Detecting IE & Safari user agent
		- IEVersion() -- from Rodney's (?) old code
		- detectIE() -- more commonly used by Sam
		- detectSafari() - based on user agent.
	2. Fixing IE with various JS

	3. String processing
		- escapeHTML(html)
		- .capitalize
		- .trim
	4. IE Placeholder shim
	5. jQuery Animation Extensions
	6. htmlentities and html_entity_decode, like the PHP function for JS. -- Simple versions, Sam 2015-07-09
	8. remove_bad_images -- remove any images that throw 404 or have bad src.
	9. JSON to POST - convert json to postable data
	10. Cookies: fnSetCookie & createSiteCookie -- set cookies that are meant to expire only in a very long time.
	11. Fix IE8 (and others) indexOf functionality.
	12. Testing function - print the name of the current function
	13. IE8 file uploader (images) shim.
	14. clsDefaulter & mGetVar -- JS default arguments solutions

*************************************************************/

// 1. -- Detecting IE & Safari user agent
	// Between these 2, Sam recommends using detectIE, as it will catch the latest versions (10+11), which use "Trident" as their user agent.
	// As of 2014.09.17, one function in geoXML still relies on IEVersion, so it's still here for now.
		var IEversion = function() {
			// http://msdn.microsoft.com/workshop/author/dhtml/overview/browserdetection.asp
			// Returns the version of Internet Explorer or a -1
			// (indicating the use of another browser).
			var rv = -1; // Return value assumes failure
			if (navigator.appName == 'Microsoft Internet Explorer') {
				var ua = navigator.userAgent;
				var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
				if (re.exec(ua) != null) {
					rv = parseFloat( RegExp.$1 );
				}
			}
			return rv;
		};

	// Reliable function for detecting IE, tested and good as of 6/27/14
	// From http://stackoverflow.com/questions/19999388/jquery-check-if-user-is-using-ie
		function detectIE() {
			var ua = window.navigator.userAgent;
			var msie = ua.indexOf('MSIE ');
			var trident = ua.indexOf('Trident/');

			if (msie > 0) {
					// IE 10 or older => return version number
					return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
			}

			if (trident > 0) {
					// IE 11 (or newer) => return version number
					var rv = ua.indexOf('rv:');
					return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
			}

			// other browser
			return false;
		}

	// detectSafari() - based on user agent.
	// based on http://stackoverflow.com/questions/5899783/detect-safari-chrome-ie-firefox-opera-with-user-agent
		function detectSafari() {
			return detectBrowser('safari');
		}
		function detectBrowser(browser) {
			var is_this				= {};
			is_this['chrome']		= navigator.userAgent.indexOf('Chrome') > -1;
			is_this['ie']			= detectIE() != false;
			is_this['safari']		= navigator.userAgent.indexOf("Safari") > -1;
			is_this['firefox']		= navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
			is_this['opera']		= navigator.userAgent.toLowerCase().indexOf("op") > -1;
			if ((is_this['chrome'])&&(is_this['safari']))	{is_this['safari']=false;}
			if ((is_this['chrome'])&&(is_this['opera']))	{is_this['chrome']=false;}

			return is_this[browser];
		}

// 2. -- Fixing IE with various JS, for
	function fixIE(version) {
		if(!version || version == "undefined") { version = detectIE(); }

		$("noscript").remove();
		$("#map").css("margin-top",0);

		$("#header").css("position","static").css("top","auto");
		$("#header").css("background","#00aeef");

		fixIE_navbar_expand(); // helper is below

		$(".address-input").height('40px'); // Certain input areas must be the right height (splash espec)

		$(".ie_version_number").html(version);

		$("fieldset").css("display","block"); // Otherwise fieldsets will simply not display! Ugh! Should not use fieldsets anyway.

		// For specific versions....
		if(version <= 8) {
			$(".introductory-title").css("margin-top","80px");
			$(".midsection_inner").css("border","1px solid #999"); // bottom sections of the splash page should have borders.
			$("#map-canvas-container #map_overlay").css("background", '#FF9C31'); // On nhood pages, the change-neighbourhood box must be visible.
			$("#feedback_button").css("right","-1px");
			$("#infobox").css("border","1px solid gray");
			fixIE_linked_button_click(); // See helper func below.
		}
		if(version <= 9) {
		}

	}

	function fixIE_navbar_expand() {
		// Listener for window-resize, setting up the expanding navbar properly.
		$(window).resize(function() {
			if($(window).width() < 767) {
				$(".navbar-collapse").css("position","absolute").css("top","50px").css("zIndex",550);
			} else {
				$(".navbar-collapse").css("position","static").css("top","auto")
			}
		});

		// Another listener for after the hamburger-button is pressed, at some delay.
		$(document).on("click tap", ".navbar-toggle", function() {
			setTimeout(function() {
				$(".navbar-collapse").css("position","absolute").css("top","50px").css("zIndex",550);
			}, 500);
		});
	}

	// Fix: <button> elems within <a> will not actually go. Use JS listener for that.
	function fixIE_linked_button_click() {
		$(document).on("click tap", "a[href] button", function(e) {
			var target_link = $(e.target).parent();
			var target_href = target_link.attr("href");
			if(typeof target_href == 'string') {
				window.location = target_href;
			}
		});
		$(document).on("click tap",".infobox-go-now-btn", function() {
			var destination = $("#infobox-btn-link").attr("href");
			window.location = destination;
		});
	}

// 3. -- String processing
	// Function to escape HTML string
	function escapeHTML(s) {
		var x = String(s)
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
		return x;
	}

	// Capitalize prototype, capitalize a string via RegEx
	if(!String.prototype.capitalize) {
		String.prototype.capitalize = function() {
			return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
		};
	}

	// Remove leading and trailing whitespace.
	if (!String.prototype.trim) {
	// @augments String ;; @return {String}
		String.prototype.trim = function () {
			return this.replace(/^\s+|\s+$/g, '');
		};
	}

// 4. ****************************************************** Placeholder shim for IE *********************************************

	/*! http://mths.be/placeholder v2.0.8 by @mathias */
	(function(window, document, $) {

		// Opera Mini v7 doesn’t support placeholder although its DOM seems to indicate so
		var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
		var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
		var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
		var prototype = $.fn;
		var valHooks = $.valHooks;
		var propHooks = $.propHooks;
		var hooks;
		var placeholder;

		if (isInputSupported && isTextareaSupported) {

			placeholder = prototype.placeholder = function() {
				return this;
			};

			placeholder.input = placeholder.textarea = true;

		} else {

			placeholder = prototype.placeholder = function() {
				var $this = this;
				$this
					.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
					.not('.placeholder')
					.bind({
						'focus.placeholder': clearPlaceholder,
						'blur.placeholder': setPlaceholder
					})
					.data('placeholder-enabled', true)
					.trigger('blur.placeholder');
				return $this;
			};

			placeholder.input = isInputSupported;
			placeholder.textarea = isTextareaSupported;

			hooks = {
				'get': function(element) {
					var $element = $(element);

					var $passwordInput = $element.data('placeholder-password');
					if ($passwordInput) {
						return $passwordInput[0].value;
					}

					return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
				},
				'set': function(element, value) {
					var $element = $(element);

					var $passwordInput = $element.data('placeholder-password');
					if ($passwordInput) {
						return $passwordInput[0].value = value;
					}

					if (!$element.data('placeholder-enabled')) {
						return element.value = value;
					}
					if (value == '') {
						element.value = value;
						// Issue #56: Setting the placeholder causes problems if the element continues to have focus.
						if (element != safeActiveElement()) {
							// We can't use `triggerHandler` here because of dummy text/password inputs :(
							setPlaceholder.call(element);
						}
					} else if ($element.hasClass('placeholder')) {
						clearPlaceholder.call(element, true, value) || (element.value = value);
					} else {
						element.value = value;
					}
					// `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
					return $element;
				}
			};

			if (!isInputSupported) {
				valHooks.input = hooks;
				propHooks.value = hooks;
			}
			if (!isTextareaSupported) {
				valHooks.textarea = hooks;
				propHooks.value = hooks;
			}

			$(function() {
				// Look for forms
				$(document).delegate('form', 'submit.placeholder', function() {
					// Clear the placeholder values so they don't get submitted
					var $inputs = $('.placeholder', this).each(clearPlaceholder);
					setTimeout(function() {
						$inputs.each(setPlaceholder);
					}, 10);
				});
			});

			// Clear placeholder values upon page reload
			$(window).bind('beforeunload.placeholder', function() {
				$('.placeholder').each(function() {
					this.value = '';
				});
			});

		}

		function args(elem) {
			// Return an object of element attributes
			var newAttrs = {};
			var rinlinejQuery = /^jQuery\d+$/;
			$.each(elem.attributes, function(i, attr) {
				if (attr.specified && !rinlinejQuery.test(attr.name)) {
					newAttrs[attr.name] = attr.value;
				}
			});
			return newAttrs;
		}

		function clearPlaceholder(event, value) {
			var input = this;
			var $input = $(input);
			if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
				if ($input.data('placeholder-password')) {
					$input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
					// If `clearPlaceholder` was called from `$.valHooks.input.set`
					if (event === true) {
						return $input[0].value = value;
					}
					$input.focus();
				} else {
					input.value = '';
					$input.removeClass('placeholder');
					input == safeActiveElement() && input.select();
				}
			}
		}

		function setPlaceholder() {
			var $replacement;
			var input = this;
			var $input = $(input);
			var id = this.id;
			if (input.value == '') {
				if (input.type == 'password') {
					if (!$input.data('placeholder-textinput')) {
						try {
							$replacement = $input.clone().attr({ 'type': 'text' });
						} catch(e) {
							$replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
						}
						$replacement
							.removeAttr('name')
							.data({
								'placeholder-password': $input,
								'placeholder-id': id
							})
							.bind('focus.placeholder', clearPlaceholder);
						$input
							.data({
								'placeholder-textinput': $replacement,
								'placeholder-id': id
							})
							.before($replacement);
					}
					$input = $input.removeAttr('id').hide().prev().attr('id', id).show();
					// Note: `$input[0] != input` now!
				}
				$input.addClass('placeholder');
				$input[0].value = $input.attr('placeholder');
			} else {
				$input.removeClass('placeholder');
			}
		}

		function safeActiveElement() {
			// Avoid IE9 `document.activeElement` of death
			// https://github.com/mathiasbynens/jquery-placeholder/pull/99
			try {
				return document.activeElement;
			} catch (exception) {}
		}

	}(this, document, jQuery));

// 5. -- jQuery animation extensions
	// Scroll to an element with an optional offset.
	function fnScrollTo(element, var_offset, millisecs) {
		if(!element || $(element).length < 0) { return false; } // Element doesn't exist!
		if(typeof var_offset === 'undefined') { var_offset = 0;}
		if(typeof millisecs === 'undefined') { millisecs = 600;}

		try {
			$('html,body').animate({
				scrollTop: ($(element).offset().top) + var_offset
			},millisecs);
		} catch(err) {
			try {
				var theoffset = 0;
				if(typeof $(element).offset().top == "undefined") {
					var elemid = $(element).attr("id");
					if(!typeof elemid == "undefined") {
						theoffset = document.getElementById(elemid).offsetTop; // Good ol vanilla JS solution! Sorry, verbose.
					}
				} else {
					theoffset = $(element).offset().top;
				}
				window.scrollTo(0, + var_offset);
			} catch (err) { console.log("Oops! Check fnScrollTo(), caller: " + arguments.callee.caller.name); }
		}
	}
	function fnScrollTop() {
		return fnScrollTo('#map', -200,800);
	}
	function fnScrollToBlock(obj_selector) {
		return fnScrollTo(obj_selector, (-1 * fnGetHeaderHeight() -20),500);
	}
	function fnGetHeaderHeight() {
		var intHeaderHeight = $('#header').height();
		return intHeaderHeight;
	}

// 6. -- htmlentities and html_entity_decode, like the PHP function for JS.
	function htmlEntities(str) {
		return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/®/g, '&reg;');
	}
	function html_entity_decode(str) {
		return String(str).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&reg;/g, '®');
	}

// 8. remove_bad_images -- remove any images that throw 404 or have bad src.
	// Remove bad images
	function remove_bad_images() {
		$("img").each(function() {
			$(this).verify_img(); // see pb_jq_extensions.js -- extensions of JS.
		});
	}

// 9. -------------------------------- JSON to Post ------------------------------------------------------
	function json_to_post(posting_data) {
		var response	= '';
		var count		= 0;
		for(var i in posting_data) {
			if(count != 0) {
				response += '&';
			}
			response += i + '=' + posting_data[i];
			count++;
		}
		return response;
	}

// 10. Cookies: fnSetCookie & createSiteCookie -- set cookies that are meant to expire only in a very long time. ---------------
	function fnSetCookie(what, val) {
		$.cookie(what, val, { expires: 9999});
	}
	// Set a site cookie, good across the whole site.
	function createSiteCookie(what,val) {
		// Set this to expire in 30 minutes.	
		var date = new Date();
		date.setTime(date.getTime()+(30*60*1000));
		var expires = "; expires="+date.toGMTString();

		// Delete if it already exists.
		document.cookie = what + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
		
		// Set it as we actually want it
		document.cookie = what+"="+val+expires+"; path=/";
	}

// 11. ----------------------------- Fix IndexOf lacking ----------------------------------------------

	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
			"use strict";
			if (this == null) {
				throw new TypeError();
			}
			var t = Object(this);
			var len = t.length >>> 0;
			if (len === 0) {
				return -1;
			}
			var n = 0;
			if (arguments.length > 1) {
				n = Number(arguments[1]);
				if (n != n) { // shortcut for verifying if it's NaN
					n = 0;
				} else if (n != 0 && n != Infinity && n != -Infinity) {
					n = (n > 0 || -1) * Math.floor(Math.abs(n));
				}
			}
			if (n >= len) {
				return -1;
			}
			var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
			for (; k < len; k++) {
				if (k in t && t[k] === searchElement) {
					return k;
				}
			}
			return -1;
		}
	}

// 12. --------------------- Testing function - print the name of the current function -------------
	// Testing function to track which function is running right now.
	// Pass in arguments from caller function
	function print_func_name(func_arguments) {
		var myName = func_arguments.callee.toString();
		myName = myName.substr('function '.length);
		myName = myName.substr(0, myName.indexOf('('));

		var func_args_string	= '';
		for(var i in func_arguments) {
			func_args_string += func_arguments[i] + ', ';
		}

		console.log("Running func: " + myName + ", args: " + func_args_string + ";; called by: " + func_arguments.callee.caller.name);
	}

// 13. --------------------- IE8 file uploader shim ------------------------------------------------
	// Shim the file uploader for IE8
	function fixIEFileUploader(overrides) {
		var IEV = detectIE();
		if(!IEV || IEV > 8) { return false; }

		// Defaults
			this.selector_btn		= "#listing_add_image";
			this.selector_input		= "#image";
		// Override defaults if passed
		if (overrides) {
			for (var prop in overrides) {
				if (overrides.hasOwnProperty(prop)) this[prop] = overrides[prop];
			}
		}

		// Is selector_input inside of selector_btn? If so, let's move it....
		if($(this.selector_btn).find(this.selector_input)) {
			$(this.selector_btn).after($(this.selector_input));
			$(this.selector_input).show();
		}

		// Now the bulk of the function itself.
		var helptext = $(this.selector_btn).addClass("hidden").html();
		$(this.selector_input).show().before("<label class='ie8-file-helptext'>" + helptext + "</label>");
	}

// 14. --------------------- clsDefaulter and mGetVar, JS default arguments class - Default optional arguments --------------------------------------------
	function clsDefaulter(defaults, overrides) {
		defaults	= typeof defaults 	=== 'object' ? defaults		: {};
		overrides	= typeof overrides	=== 'object' ? overrides	: {};

		// Set defaults always.
		for(var prop in defaults) {
			this[prop] = defaults[prop];
		}

		// Override defaults if possible.
		for (var prop in overrides) {
			if (overrides.hasOwnProperty(prop)) this[prop] = overrides[prop];
		}
		return this;
	}

	function mGetVar(arr, key, default_value) {
		if(typeof arr	!== 'object' || typeof key == 'undefined') { return false; } // arr should be list or JSON object: both typeof object.
		default_value	= typeof default_value !== 'undefined' ? default_value : '';

		var $val = (typeof arr[key] !== 'undefined')? arr[key] : default_value;
		return $val;
	}

// 15. mStrPosArr as from PHP - imperfect porting, Sam 2015-07-09 
	function mStrPosArr(haystack, needleslist) {		
		for(var i = 0; i < needleslist.length; i++) {
			$res = haystack.indexOf(needleslist[i]) != -1;
			if ($res) {
				return $res;
			}
		}
		return false;
	}