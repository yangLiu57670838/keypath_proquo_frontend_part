/* ==========================================================================
 * HELPER UTILITIES
 * ========================================================================== */

(function(NAMESPACE) {

	'use strict';

	NAMESPACE.util = (function() {
		var helpers,
			scrollPageTo,
			scrollPage,
			placeholder,
			formatter,
			isDevice,
			print,
			noscroll,
			isNumber;

		/* Adds classes for IE to support pseudo elements */
		helpers = function() {
			if ($('.lt-ie10').length) {
				$('textarea[maxlength]').each(function() {
					var $textarea = $(this),
						maxlength = parseInt($textarea.attr('maxlength'), 10);

					if (isNaN(maxlength) === false) { //make sure it's a number
						$textarea.on('keyup.textareaMaxlength blur.textareaMaxlength', function() {
							var val = $(this).val();
							if (val.length > maxlength) {
								$(this).val(val.substr(0, maxlength));
							}
						});
					}
				});
			}



			if ($('.lt-ie9').length) {
				NAMESPACE.IS_RESPONSIVE = false;

				DD.bp.options({
					isResponsive: false
				});

				$('li:last-child, th:last-child, td:last-child, tr:last-child').addClass('last-child');
				$('tr:nth-child(2n)').addClass('odd');

				// checkbox polyfill for sibling selectors
				(function() {
					var checkValue = function($elem) {
						var $label = $('label[for="' + $elem.attr('id') + '"]');
						if ($elem.prop('checked')) {
							$elem.add($label).addClass('is-checked');
						} else {
							$elem.add($label).removeClass('is-checked');
						}

						// We modify the label as well as the input because authors may want to style the labels based on the state of the chebkox, and IE7 and IE8 don't fully support sibling selectors.
						return $elem;
					};

					$('input:radio, input:checkbox').each(function() {
						var $self = $(this);

						if ($self.prop('type') === 'radio') {
							$('input[name="' + $self.prop('name') + '"]').on('change.checkboxPolyfill', function() {
								checkValue($self);
							});
						} else if ($self.prop('type') === 'checkbox') {
							$self.change(function() {
								checkValue($self);
							});
						}

						// Check value when polyfill is first called, in case a value has already been set.
						checkValue($self);
					});
				}());
			}

			if (!Modernizr.input.placeholder) {
				$('input, textarea').placeholder();
			}

			$.fn.noScrollFocus = function() {
				var x = window.scrollX,
					y = window.scrollY;

				this.focus();

				if ($('.lt-ie10').length === 0) {
					window.scrollTo(x, y);
				}

				return this; //chainability
			};
		};

		/* Scrolls page */
		scrollPageTo = function(top, hash, _duration, callback) {
			var duration = _duration,
				isCallbackCalled = false;

			hash = (typeof (hash) === 'string') ? hash.substring(hash.indexOf('#') + 1) : null;

			if (duration === null) {
				var currentTop = $(document).scrollTop(),
					currentDistance = Math.abs(top - currentTop),
					maxDistance = 2000,
					maxDuration = 1000;

				if (currentDistance > maxDistance) {
					duration = maxDuration;
				} else {
					duration = (top > currentTop) ? (1 - currentTop / top) * maxDuration : (1 - top / currentTop) * maxDuration;
				}
			}

			$('html').velocity('stop').velocity('scroll', {
				offset: top,
				duration: duration,
				complete: function() {
					if (!isCallbackCalled) {
						isCallbackCalled = true;

						if (typeof (hash) === 'string') {
							if (window.History && window.History.pushState) {
								window.History.pushState(null, null, '#' + hash);
							} else {
								window.location.hash = hash;
							}
						}

						if (typeof (callback) === 'function') {
							callback();
						}
					}
				}
			});
		};


		/* Scrolls the page to a specified ID */
		scrollPage = function() {
			$('body').off('click.scrollto').on('click.scrollto', '.scrollto, .scrollup, .scrolldown', function(event) {
				var $btn = $(this),
					target = $btn.attr('href'),
					scrollOffset = parseInt($btn.attr('data-scroll-offset'), 10) || 0,
					tabTo = ($btn.attr('data-scroll-tabto') === 'true'),
					updateHash = ($btn.attr('data-scroll-hash') === 'false') ? false : true;

				target = target.substr(target.indexOf('#') + 1);

				var $target = $('#' + target),
					newHash = (updateHash) ? target : null;

				if ($target.length === 0) {
					$target = $('a[name="' + target + '"]');
				}

				if ($target.length === 0) {
					return;
				}

				event.preventDefault();

				if (tabTo) {
					scrollPageTo($target.offset().top + scrollOffset, newHash, null, function() {
						$target.eq(0).noScrollFocus();
					});
				} else {
					scrollPageTo($target.offset().top + scrollOffset, newHash);
				}
			});
		};




		/* Formatter for various numeric methods */
		formatter = {
			toCurrency: function(number, decimals, decimalSep, thousandsSep) {
				/* usage: NAMESPACE.util.formatter.toCurrency(1400, '.', ',') returns 1,400.00 */

				var c = isNaN(decimals) ? 2 : Math.abs(decimals), //if decimal is zero we must take it, it means user does not want to show any decimal
					d = decimalSep || '.', //if no decimal separator is passed we use the dot as default decimal separator (we MUST use a decimal separator)

					t = (typeof thousandsSep === 'undefined') ? ',' : thousandsSep, //if you don't want to use a thousands separator you can pass empty string as thousandsSep value

					sign = (number < 0) ? '-' : '',

					//extracting the absolute value of the integer part of the number and converting to string
					i = parseInt(number = Math.abs(number).toFixed(c), 10) + '',

					j = ((j = i.length) > 3) ? j % 3 : 0;
				return sign + (j ? i.substr(0, j) + t : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + t) + (c ? d + Math.abs(number - i).toFixed(c).slice(2) : '');
			},
			abbrNum: function(number, decimals) {
				// 2 decimal places => 100, 3 => 1000, etc
				decimals = Math.pow(10, decimals);

				// Enumerate number abbreviations
				var abbrev = ['k', 'm', 'b', 't'];

				// Go through the array backwards, so we do the largest first
				for (var i = abbrev.length - 1; i >= 0; i -= 1) {

					// Convert array index to "1000", "1000000", etc
					var size = Math.pow(10, (i + 1) * 3);

					// If the number is bigger or equal do the abbreviation
					if (size <= number) {
						// Here, we multiply by decimals, round, and then divide by decimals.
						// This gives us nice rounding to a particular decimal place.
						number = Math.round(number * decimals / size) / decimals;

						// Add the letter for the abbreviation
						number += abbrev[i];

						break;
					}
				}

				return number;
			},
			roundNum: function(number, decimals) {
				return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
			}
		};

		isDevice = {
			Android: function() {
				return navigator.userAgent.match(/Android/i);
			},
			AndroidChrome: function() {
				return window.chrome && navigator.userAgent.match(/Android/i);
			},
			BlackBerry: function() {
				return navigator.userAgent.match(/BlackBerry/i);
			},
			iOS: function() {
				return navigator.userAgent.match(/iPhone|iPad|iPod/i);
			},
			Opera: function() {
				return navigator.userAgent.match(/Opera Mini/i);
			},
			Windows: function() {
				return navigator.userAgent.match(/IEMobile/i);
			},
			any: function() {
				var isany = (isDevice.Android() || isDevice.BlackBerry() || isDevice.iOS() || isDevice.Opera() || isDevice.Windows());
				return (isany !== null);
			},
			touch: function() {
				return 'ontouchstart' in window || 'onmsgesturechange' in window;
			}
		};

		print = function() {
			$('.fn_print').on('click.print', function(e) {
				e.preventDefault();
				window.print();
			});
		};

		// automatically add classes to the HTML body for devices
		(function() {
			// uses isDevice in local scope, to add classes to the HTML tag
			// this means that we can use CSS to identify (handle) different user agents
			// assumes: jQuery dependancy + only one user-agent is possible

			if (isDevice.Android()) {
				$('html').addClass('d-android');
			} else if (isDevice.BlackBerry()) {
				$('html').addClass('d-blackberry');
			} else if (isDevice.iOS()) {
				$('html').addClass('d-ios');
			} else if (isDevice.Opera()) {
				$('html').addClass('d-opera');
			} else if (isDevice.Windows()) {
				$('html').addClass('d-windows');
			} else {
				$('html').addClass('d-other'); //something we're not checking, maybe desktop?
			}

			if (isDevice.any()) {
				$('html').addClass('d-any');
			}

			if (isDevice.touch()) {
				$('html').addClass('d-touch');
			}
		}());

		noscroll = (function() {
			var $body = $('body'),
				add,
				remove,
				refresh;

			add = function() {
				if ($body.hasClass('no-scroll') === false) {
					var scrollTop = $(window).scrollTop();

					$body.addClass('no-scroll').css({
						top: -scrollTop
					});
				}
			};

			remove = function() {
				var top = parseInt($body.css('top'), 10);

				$body.css({
					top: ''
				}).removeClass('no-scroll');

				$(window).scrollTop(-top);
			};

			refresh = function() {
				if ($body.hasClass('no-scroll')) {
					// If the page has gotten shorter, make sure we aren't scrolled past the footer
					if ($body.height() > $(window).height()) {
						if ($body.offset().top - $(window).height() < -$body.height()) {
							$body.css({
								top: -($body.height() - $(window).height())
							});
						}
					}
				}
			};

			return {
				add: add,
				remove: remove,
				refresh: refresh
			};
		}());

		isNumber = function(value) {
			var returnVal = !isNaN(value - 0) && value !== null && value !== '' && value !== false;
			return returnVal;
		};

		return {
			helpers: helpers,
			scrollPageTo: scrollPageTo,
			scrollPage: scrollPage,
			placeholder: placeholder,
			formatter: formatter,
			isDevice: isDevice,
			print: print,
			noscroll: noscroll,
			isNumber: isNumber
		};
	}());

}(DDIGITAL));
