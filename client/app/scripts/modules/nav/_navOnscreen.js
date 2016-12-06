/* =============================================================================
   HEADER NAV
   ========================================================================== */

(function(NAMESPACE) {

	'use strict';

	NAMESPACE.navOnscreen = (function() {

		var OPTIONS,
			CONST,
			_isInit = false,
			_dropdowns = [],
			$navBg,
			enableDropdowns,
			disableDropdowns,
			init;

		// options
		OPTIONS = {
			DROPDOWNS: [
				'.navbar .nav',
				'.other-sites'
			],
			HAS_BACKGROUND: true,
			TIMEOUT_DURATION: 250,
			TRANSITION_DURATION: 300,
			DEBUG_MODE: false
		};

		// constants
		CONST = {
			CLASS: {
				HOVER: 'is-hover', // Used to show the dropdown
				HOVERING: 'is-hovering', // Used to apply style to the link
				NAV_BG: 'dropdown-nav-bg'
			},
			IS_LT_IE9: ($('.lt-ie9').length > 0)
		};

		// enable the navigation (used by enquire to turn the navigation on/off)
		enableDropdowns = function() {
			for (var i = 0, len = _dropdowns.length; i < len; i += 1) {
				var dd = _dropdowns[i];
				dd.isEnabled = true;
			}
		};

		// disable the navigation (used by enquire to turn the navigation on/off)
		disableDropdowns = function() {
			for (var i = 0, len = _dropdowns.length; i < len; i += 1) {
				var dd = _dropdowns[i];

				if (dd.alwaysEnabled === false) {
					dd.isEnabled = false;
				}
			}
		};

		// initialiser
		init = function() {
			if (_isInit) {
				return;
			}

			if ($(OPTIONS.DROPDOWNS).length === 0) {
				console.warn('The onscreen navigation (' + OPTIONS.DROPDOWNS + ') isn\'t present on the page');
				return;
			}

			$(OPTIONS.DROPDOWNS).each(function(i, el) {
				var $nav = $(el),
					navid = 'dropdown-nav-' + i,
					$items = $nav.find('> li, > div'),
					alwaysEnabled = ($nav.attr('data-dropdown-enabled') === 'always'),
					disableBg = ($nav.attr('data-dropdown-bg') === 'false'),
					options = {
						isEnabled: true,
						alwaysEnabled: alwaysEnabled,
						disableBackground: disableBg
					},
					navBlurTimeout,
					resetNavBlurTimeout,
					openDropdown,
					closeDropdown,
					closeCurrentlyOpen,
					closeNavOnDocumentClick;

				_dropdowns.push(options);

				// open the dropdown
				openDropdown = function(id, instantly, currentItemHasDropdown) {
					var $link = $('#' + id),
						$dropdown = $link.find('.dropdown');

					$dropdown.find('.dropdown-close')
						.off('click.dropdown-close')
						.on('click.dropdown-close', function() {
							closeDropdown(id);
						});

					// by default the item selected currently doesn't have a dropdown
					currentItemHasDropdown = currentItemHasDropdown || false;

					// only show if the dropdown is enabled and if it hasn't already got a hover class on it
					if (options.isEnabled) {
						if (!$link.hasClass(CONST.CLASS.HOVER)) {

							// display the background only if there is a menu item with a dropdown selected
							if (!options.disableBackground && OPTIONS.HAS_BACKGROUND && $dropdown.length > 0) {
								$('html').addClass('dropdown-nav-transitioning');

								setTimeout(function() {
									$('html').addClass('dropdown-nav-open');
								}, 1);
							}

							// give the static animation only if it's IE8 and below, or if the currently opened item has a dropdown
							if (CONST.IS_LT_IE9 || (instantly && currentItemHasDropdown)) {
								$dropdown.attr('style', '');
								$link.addClass(CONST.CLASS.HOVER);
							} else {
								$dropdown.css({
									opacity: 0,
									'margin-left': 0
								});

								$dropdown.velocity({
									opacity: 1
								}, {
									duration: OPTIONS.TRANSITION_DURATION,
									complete: function() {
										$link.addClass(CONST.CLASS.HOVER);
										$dropdown.attr('style', '');
									}
								});
							}
						}
					}
				};

				// close the dropdown item
				closeDropdown = function(id, instantly, newItemHasDropdown) {
					var $link = $('#' + id),
						$dropdown = $link.find('.dropdown');

					if (!OPTIONS.DEBUG_MODE) {

						// by default the new item doesn't have a dropdown
						newItemHasDropdown = newItemHasDropdown || false;

						// give the static animation only if it's IE8 and below, or if requested (occurs when the dropdown is already open)
						if (CONST.IS_LT_IE9 || instantly) {
							$dropdown.attr('style', '');
							$link.removeClass(CONST.CLASS.HOVER).removeClass(CONST.CLASS.HOVERING);
						} else {
							$dropdown.css({
								opacity: 1,
								'margin-left': 0
							});

							$link.removeClass(CONST.CLASS.HOVER).removeClass(CONST.CLASS.HOVERING);

							$dropdown.velocity({
								opacity: 0
							}, OPTIONS.TRANSITION_DURATION, function() {
								$dropdown.attr('style', '');
							});
						}

						// handles the dropdown navigation background fadeout
						if (OPTIONS.HAS_BACKGROUND && (!instantly || !newItemHasDropdown)) {
							$('html').removeClass('dropdown-nav-open');

							setTimeout(function() {
								$('html').removeClass('dropdown-nav-transitioning');
							}, OPTIONS.TRANSITION_DURATION);
						}

						// so touch devices can close the navigation easily
						$('body').off('touchstart', closeNavOnDocumentClick);
					}
				};

				// close the dropdown that's currently open
				closeCurrentlyOpen = function(callback, instantly, newItemHasDropdown) {
					newItemHasDropdown = newItemHasDropdown || false;

					$nav.find('> .' + CONST.CLASS.HOVER).each(function() {
						closeDropdown($(this).attr('id'), instantly, newItemHasDropdown);
					});

					if (typeof (callback) === 'function') {
						callback();
					}
				};

				// close on click outside of a navigation item
				closeNavOnDocumentClick = function(e) {
					if ($nav.find('> .' + CONST.CLASS.HOVER).find(e.target).length === 0) {
						e.preventDefault();
						closeCurrentlyOpen(null, false);
					}
				};

				resetNavBlurTimeout = function() {
					if (navBlurTimeout) {
						clearTimeout(navBlurTimeout);
						navBlurTimeout = null;
					}
				};

				$items.each(function(i, el) {
					var $item = $(el),
						id = navid + '-item-' + i;

					// assign a unique ID to the navigation
					$item.attr('id', id);

					if (Modernizr.touch) {
						// touch screens should be able to click to open the navigation, then click again to be taken to the navigation link
						$item.find('> a').on('touchstart.navdropdown', function(e) {
							// only allow if the navigation is enabled
							if (options.isEnabled) {
								if ($item.hasClass(CONST.CLASS.HOVER)) {
									// click through to the link
									return true;
								} else {
									e.preventDefault();

									// check if the previous and next items have a dropdown (used for the background blockout transition)
									var fromAnotherNavItem = ($nav.find('> .' + CONST.CLASS.HOVER).length > 0),
										currentItemHasDropdown = ($nav.find('> .' + CONST.CLASS.HOVER).find('.dropdown').length > 0),
										newItemHasDropdown = ($item.find('.dropdown').length > 0);

									$item.addClass(CONST.CLASS.HOVERING);

									// close the currently open item
									closeCurrentlyOpen(function() {
										openDropdown(id, fromAnotherNavItem, currentItemHasDropdown);
										$('body').on('touchstart.navdropdown', closeNavOnDocumentClick);
									}, fromAnotherNavItem, newItemHasDropdown);
								}
							}
						});

					} else {
						// Show hover state on menu item instantly on hover
						$item.on('mouseenter.navdropdown', function() {
							if (options.isEnabled) {
								$item.addClass(CONST.CLASS.HOVERING);
							}
						});

						// Remove hover state on menu item instantly when rolled off
						$item.on('mouseout.navdropdown', function(e) {
							$item.removeClass(CONST.CLASS.HOVERING);

							if (options.isEnabled) {
								if (!$item.hasClass(CONST.CLASS.HOVER)) {
									// check if the user has moved from one to another navigation item
									var toAnotherNavItem = ($nav.find(e.relatedTarget).length > 0);
									if (!toAnotherNavItem) {
										closeCurrentlyOpen(null, false);
									}
								}
							}
						});

						// Only show the dropdown when they really mean to hover on the menu item
						$item.hoverIntent({
							timeout: OPTIONS.TIMEOUT_DURATION,
							over: function(e) {
								if (options.isEnabled) {
									// check if the previous and next items have a dropdown (used for the background blockout transition)
									var fromAnotherNavItem = ($nav.find(e.relatedTarget).length > 0),
										currentItemHasDropdown = ($nav.find('> .' + CONST.CLASS.HOVER).find('.dropdown').length > 0),
										newItemHasDropdown = ($item.find('.dropdown').length > 0);

									if (fromAnotherNavItem) {
										closeCurrentlyOpen(function() {
											openDropdown(id, true, currentItemHasDropdown);
										}, true, newItemHasDropdown);
									} else {
										openDropdown(id, false);
									}
								}
							},
							out: function(e) {
								var toAnotherNavItem = ($nav.find(e.relatedTarget).length > 0);
								if (!toAnotherNavItem) {
									closeCurrentlyOpen(null, false);
								}
							}
						});

						// Show the dropdown on focus of links inside nav and dropdown - allows for keyboard navigation
						$item.find('a').on('focus.navdropdown', function() {
							resetNavBlurTimeout();

							if (options.isEnabled) {
								var currentItemHasDropdown = ($nav.find('> .' + CONST.CLASS.HOVER).find('.dropdown').length > 0),
									newItemHasDropdown = ($item.find('.dropdown').length > 0);

								closeCurrentlyOpen(function() {
									openDropdown(id, true, currentItemHasDropdown);
								}, true, newItemHasDropdown);
							}
						}).on('blur.navdropdown', function() {
							resetNavBlurTimeout();

							navBlurTimeout = setTimeout(function() {
								closeDropdown(id, false);
							}, OPTIONS.TIMEOUT_DURATION);
						});

						// Clear the blur timeout on click to prevent the dropdown from closing if a link inside the dropdown has focus and then loses focus because the user clicks inside the dropdown
						$item.on('click.navdropdown', function() {
							resetNavBlurTimeout();
						});
					}
				});
			});

			// navigation background
			if (OPTIONS.HAS_BACKGROUND) {
				$('#inner-wrap').prepend('<div class="' + CONST.CLASS.NAV_BG + '"><div class="bg">&nbsp;</div></div>');
				$navBg = $('#inner-wrap').find('.' + CONST.CLASS.NAV_BG + ' .bg');
			}

			_isInit = true;
		};

		return {
			init: init,
			isInit: _isInit,
			enable: enableDropdowns,
			disable: disableDropdowns,
			OPTIONS: OPTIONS
		};

	}());

}(DDIGITAL));
