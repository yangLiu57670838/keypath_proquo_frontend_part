/* =============================================================================
   OFFSCREEN NAV
   ========================================================================== */

(function(NAMESPACE) {

	'use strict';

	NAMESPACE.navOffscreen = (function() {

		var OPTIONS,
			CONST,
			_isInit = false,
			_isNavOpen = false,
			_isTransitioning = false,
			_isEnabled = true,
			_newDuration = false,
			$innerWrap = $('#inner-wrap'),
			$navBg = $([]),
			$navContainer,
			$navInner,
			_getAnimatedItems,
			_animations,
			_containerHeightForNav,
			_touchInteraction,
			_closeOnCloseButtonClick,
			_bindEventsToCloseOpenNavigation,
			_unbindEventsToCloseOpenNavigation,
			isOpen,
			openOffscreenNav,
			closeOffscreenNav,
			toggleOffscreenNav,
			enableOffscreenNav,
			disableOffscreenNav,
			init;

		// options
		OPTIONS = {
			CONTAINER: '#nav',
			HAS_BACKGROUND: true,
			USE_CSS_TRANSLATE: true,
			OPEN_NAV_FROM_RIGHT: false, // the CSS variable $OPEN_NAV_FROM_RIGHT in _offscreen.scss should match this
			USE_NAV_DRAWER_PATTERN: true, // the CSS variable $USE_NAV_DRAWER_PATTERN in _offscreen.scss should match this
			USE_NAV_DRAWER_OVER_FIXED_HEADER: true, // the CSS variable $USE_NAV_DRAWER_OVER_FIXED_HEADER in _offscreen.scss should match this
			USE_FIXED_POSITIONING: true, // fixed positioning only works properly with the nav drawer pattern
			NAV_WIDTH: 270,
			BACKGROUND_OPACITY: 0.8, // the CSS variable $offscreen-bg-opacity in _offscreen.scss should match this
			DO_INLINE_SCROLL: true,
			TRANSITIONS: {
				ANIMATE_IN: 400,
				ANIMATE_OUT: 400
			}
		};

		// constants
		CONST = {
			CLASS: {
				NAV_READY: 'js-nav',
				NAV_USES_TRANSLATE: 'js-nav-translate',
				NAV_USES_FIXED_POSITIONING: 'js-nav-fixed',
				NAV_TRANSITIONING: 'js-nav-transitioning',
				NAV_OPEN: 'js-nav-open',
				OFFSCREEN_NAV_BG: 'offscreen-nav-bg'
			}
		};

		// find containers
		$navContainer = $(OPTIONS.CONTAINER);
		$navInner = $navContainer.find('.nav-inner');

		// shortcut for getting all the items that need to be animated
		_getAnimatedItems = function() {
			if (OPTIONS.USE_NAV_DRAWER_PATTERN) {
				return $navContainer.add($navBg);
			} else {
				return $innerWrap.add($navInner).add($navBg);
			}
		};

		// animations required for the open/close of the navigation
		_animations = {
			openNav: function(duration, callback) {
				callback = callback || function() {};

				_getAnimatedItems().velocity('stop', true);

				if (OPTIONS.USE_NAV_DRAWER_PATTERN) {
					var navContainerAnim = {};

					// the open position of the navigation
					if (OPTIONS.USE_CSS_TRANSLATE) {
						navContainerAnim.translateZ = 0;
						navContainerAnim.translateX = 0;

						//set the current position to stop initial transition bugs
						var matrixToArray = function(str) {
							return str.match(/(-?[0-9\.]+)/g);
						};
						
						$navContainer.velocity({
							translateX: matrixToArray($navContainer.css('transform'))[4]
						}, 0);

					} else {
						if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
							navContainerAnim.right = 0;
						} else {
							navContainerAnim.left = 0;
						}

						navContainerAnim.translateZ = 0;
					}

					$navContainer.velocity(navContainerAnim, {
						duration: duration,
						complete: callback,
						easing: 'ease-in-out'
					});
				} else {
					var innerWrapAnim = {},
						navInnerAnim = {};

					// the open position of the navigation
					if (OPTIONS.USE_CSS_TRANSLATE) {
						innerWrapAnim.translateZ = 0;
						innerWrapAnim.translateX = OPTIONS.NAV_WIDTH + 'px';

						if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
							innerWrapAnim.translateX = -OPTIONS.NAV_WIDTH + 'px';
						}

						navInnerAnim.translateZ = 0;
						navInnerAnim.translateX = 0;
					} else {
						innerWrapAnim.left = OPTIONS.NAV_WIDTH + 'px';

						if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
							innerWrapAnim.left = -OPTIONS.NAV_WIDTH + 'px';
						}

						navInnerAnim.left = 0;
						navInnerAnim.translateZ = 0;
					}

					$innerWrap.velocity(innerWrapAnim, {
						duration: duration,
						complete: callback,
						easing: 'ease-in'
					});

					$navInner.velocity(navInnerAnim, {
						duration: duration,
						easing: 'ease-in'
					});
				}

				$navBg.css('opacity', $navBg.css('opacity')).velocity({
					opacity: OPTIONS.BACKGROUND_OPACITY
				}, {
					duration: OPTIONS.TRANSITIONS.ANIMATE_IN
				});
			},
			closeNav: function(duration, callback) {
				callback = callback || function() {};

				_getAnimatedItems().velocity('stop', true);

				if (OPTIONS.USE_NAV_DRAWER_PATTERN) {
					var navContainerAnim = {};

					// the closed position of the navigation
					if (OPTIONS.USE_CSS_TRANSLATE) {
						navContainerAnim.translateZ = 0;

						if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
							navContainerAnim.translateX = OPTIONS.NAV_WIDTH + 'px';
						} else {
							navContainerAnim.translateX = '-' + OPTIONS.NAV_WIDTH + 'px';
						}
					} else {
						if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
							navContainerAnim.right = '-' + OPTIONS.NAV_WIDTH + 'px';
						} else {
							navContainerAnim.left = '-' + OPTIONS.NAV_WIDTH + 'px';
						}
					}

					$navContainer.velocity(navContainerAnim, {
						duration: duration,
						complete: callback,
						easing: 'ease-in-out'
					});
				} else {
					var innerWrapAnim = {},
						navInnerAnim = {};

					// the closed position of the navigation
					if (OPTIONS.USE_CSS_TRANSLATE) {
						innerWrapAnim.translateZ = 0;
						innerWrapAnim.translateX = 0;

						navInnerAnim.translateZ = 0;

						if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
							navInnerAnim.translateX = '-50%';
						} else {
							navInnerAnim.translateX = '50%';
						}
					} else {
						innerWrapAnim.left = 0;

						if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
							navInnerAnim.left = '-50%';
						} else {
							navInnerAnim.left = '50%';
						}
					}

					$innerWrap.velocity(innerWrapAnim, {
						duration: duration,
						complete: callback,
						easing: 'ease-in'
					});

					$navInner.velocity(navInnerAnim, {
						duration: duration,
						easing: 'ease-in'
					});
				}

				$navBg.velocity({ opacity: 0 }, duration);
			},
			resetInlineStyle: function() {
				_getAnimatedItems().velocity('stop', true).removeAttr('style');
			}
		};

		// set/unset the container for the navigation when it opens/close
		_containerHeightForNav = {};

		// set the height of the nav when opened or internal height is updated
		_containerHeightForNav.set = function() {
			// scroll the navigation inline - separate to the rest of the page
			// behaves more like an app
			if (OPTIONS.DO_INLINE_SCROLL || OPTIONS.USE_FIXED_POSITIONING) {
				if (OPTIONS.USE_FIXED_POSITIONING) {
					NAMESPACE.util.noscroll.add();
				} else {
					$innerWrap.css({
						height: $(window).height()
					});
				}

				$navContainer.css({
					'overflow-x': 'hidden',
					'overflow-y': 'auto',
					'-webkit-overflow-scrolling': 'touch'
				});

				setTimeout(function() {
					$navContainer.find('> nav').css({
						width: '100%',
						height: '100%',
						'overflow-x': 'hidden'
					});
				}, 100);

				if (typeof (event) === 'undefined') {
					$(window).off('resize.nav').on('resize.nav', $.debounce(100, _containerHeightForNav.set));
				}
			} else {
				// no fancy scrolling if it's a desktop browser
				var navOrDocHeight = $navContainer.find('> nav').height();
				navOrDocHeight = (navOrDocHeight > $(document).height()) ? navOrDocHeight : $(document).height();

				$innerWrap.css({
					height: navOrDocHeight
				});
			}
		};

		// resets all inline styles that are added in _containerHeightForNav.set
		// called when the navigation is closed
		_containerHeightForNav.unset = function() {
			// scroll the navigation inline - separate to the rest of the page
			// behaves more like an app
			if (OPTIONS.DO_INLINE_SCROLL || OPTIONS.USE_FIXED_POSITIONING) {
				if (OPTIONS.USE_FIXED_POSITIONING) {
					NAMESPACE.util.noscroll.remove();
				} else {
					$innerWrap.css({
						height: ''
					});
				}

				$navContainer.css({
					'overflow-x': '',
					'overflow-y': ''
				}).find('> nav').css({
					'overflow-x': '',
					width: ''
				});

				_getAnimatedItems().css('transform', '').css('transition-duration', '');

				// remove resize functionality
				$(window).off('resize.nav');
			} else {
				$innerWrap.css({
					height: ''
				});
			}
		};

		// touch interaction object used for all touch/swiping events, initialise vars object
		_touchInteraction = {
			vars: {}
		};

		// gets the xPosition of the first touch (or mouse position)
		_touchInteraction.getCurrentXPos = function(origEvent) {
			return (origEvent.touches && origEvent.touches.length > 0) ? origEvent.touches[0].pageX : origEvent.pageX;
		};

		// calculates the difference in pixels between the start position and current position
		_touchInteraction.getPxWidthMoved  = function(vars) {
			var diff = vars.startXPos - vars.currentXPos;

			if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
				diff = vars.currentXPos - vars.startXPos;
			}

			return diff;
		};

		// calculates the difference in percentage between the start position and the current position
		_touchInteraction.getPercentageWidthMoved = function(vars) {
			var diff = vars.startXPos - vars.currentXPos;

			return (diff / $(window).width()) * 100;
		};

		// on touch start interaction
		_touchInteraction.onStart = function(event) {
			event.stopPropagation();

			// need the JS event, not the jQuery event
			var origEvent = event.originalEvent;

			origEvent.stopPropagation();

			// only run if navigation is open and the interaction isn't inside the navigation
			if (_isNavOpen && $(event.target).closest(OPTIONS.CONTAINER).length === 0) {
				event.preventDefault();
				origEvent.preventDefault();

				// ie9 and below don't handle this well
				if ($('.lt-ie10').length > 0) {
					return;
				}

				// set default positions, speed and assume that the user will be closing it
				_touchInteraction.vars = {
					isMovingTowardsClose: true,
					speed: 0,
					startXPos: _touchInteraction.getCurrentXPos(origEvent),
					prevXPos: _touchInteraction.getCurrentXPos(origEvent)
				};

				// listen for move and end events
				$(document).on('touchmove.nav mousemove.nav', _touchInteraction.onMove);
				$(document).on('touchend.nav mouseup.nav', _touchInteraction.onEnd);
			}
		};

		// on touch move interaction (in between touchstart and touchend)
		_touchInteraction.onMove = function(event) {
			event.stopPropagation();
			event.preventDefault();

			var origEvent = event.originalEvent,
				vars = _touchInteraction.vars;

			vars.currentXPos = _touchInteraction.getCurrentXPos(origEvent);

			// only calculate new positions if it has moved (this stops unnecessary processing if the user is just holding their finger down)
			if (vars.currentXPos !== vars.prevXPos) {
				// determine the direction so we can either close or open if the user doesn't slide it enough
				vars.isMovingTowardsClose = (vars.currentXPos <= vars.prevXPos);

				if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
					vars.isMovingTowardsClose = !vars.isMovingTowardsClose;
				}

				vars.prevXPos = vars.currentXPos;

				// figure out how much the navigation should move, vs how much the parallax inner module should move
				var newInnerXPos = OPTIONS.NAV_WIDTH - _touchInteraction.getPxWidthMoved(vars),
					newNavXPos =  OPTIONS.NAV_WIDTH - (OPTIONS.NAV_WIDTH - _touchInteraction.getPxWidthMoved(vars));

				// this can sometimes go outside of the bounds. Ensure this doesn't happen
				if (newNavXPos > OPTIONS.NAV_WIDTH) {
					newNavXPos = OPTIONS.NAV_WIDTH;
				} else if (newNavXPos < 0) {
					newNavXPos = 0;
				}

				// reset all the items to start (this stops transitions stacking up)
				if (newInnerXPos <= 0) {
					_animations.closeNav(0);
				} else if (newInnerXPos >= OPTIONS.NAV_WIDTH) {
					_animations.openNav(0);
				} else {
					// calculate the percentage closed currently
					var percentageNavInner = ((newNavXPos / OPTIONS.NAV_WIDTH) * 100) / 2,
						percentageNavBg = OPTIONS.BACKGROUND_OPACITY - (OPTIONS.BACKGROUND_OPACITY * (newNavXPos / OPTIONS.NAV_WIDTH));

					if (OPTIONS.USE_NAV_DRAWER_PATTERN) {
						if (OPTIONS.USE_CSS_TRANSLATE) {
							if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
								$navContainer.velocity({ translateZ: 0, translateX: newNavXPos + 'px' }, 0);
							} else {
								$navContainer.velocity({ translateZ: 0, translateX: '-' + newNavXPos + 'px' }, 0);
							}
						} else {
							if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
								$navContainer.velocity({ right: '-' + newNavXPos + 'px' }, 0);
							} else {
								$navContainer.velocity({ left: '-' + newNavXPos + 'px' }, 0);
							}
						}
					} else {
						if (OPTIONS.USE_CSS_TRANSLATE) {
							if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
								$innerWrap.velocity({ translateZ: 0, translateX: '-' + newInnerXPos + 'px' }, 0);
								$navInner.velocity({ translateZ: 0, translateX: '-' + percentageNavInner + '%' }, 0);
							} else {
								$innerWrap.velocity({ translateZ: 0, translateX: newInnerXPos + 'px' }, 0);
								$navInner.velocity({ translateZ: 0, translateX: percentageNavInner + '%' }, 0);
							}
						} else {
							if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
								$innerWrap.velocity({ left: '-' + newInnerXPos + 'px' }, 0);
								$navInner.velocity({ left: '-' + percentageNavInner + '%' }, 0);
							} else {
								$innerWrap.velocity({ left: newInnerXPos + 'px' }, 0);
								$navInner.velocity({ left: percentageNavInner + '%' }, 0);
							}
						}
					}

					$navBg.velocity({ opacity: percentageNavBg }, 0);
				}
			}
		};

		// on touch end interaction
		_touchInteraction.onEnd = function(event) {
			event.stopPropagation();
			event.preventDefault();

			var vars = _touchInteraction.vars,
				validateNewDuration;

			validateNewDuration = function(newDuration) {
				if (isNaN(newDuration)) {
					newDuration = OPTIONS.TRANSITIONS.ANIMATE_OUT;
				} else if (newDuration < 0) {
					newDuration = 0;
				}

				return newDuration;
			};

			// remove the previous event listeners as they aren't needed anymore
			$(document).off('touchmove.nav mousemove.nav', _touchInteraction.onMove);
			$(document).off('touchend.nav mouseup.nav', _touchInteraction.onEnd);

			// calculate how much time is required for the rest of the animation
			// this is based on the original transition duration and the total x pos to move, vs the x pos remaining to move
			var durationDistance = vars.startXPos - vars.currentXPos;

			if (OPTIONS.OPEN_NAV_FROM_RIGHT) {
				durationDistance = vars.currentXPos - vars.startXPos;
			}

			_newDuration = validateNewDuration(OPTIONS.TRANSITIONS.ANIMATE_OUT - Math.round(OPTIONS.TRANSITIONS.ANIMATE_OUT * (durationDistance / OPTIONS.NAV_WIDTH)));

			// stop the current animation
			_getAnimatedItems().velocity('stop', true);

			// determine whether to close or open the navigation depending on the direction of movement
			if (vars.isMovingTowardsClose) {
				closeOffscreenNav();
			} else {
				_isNavOpen = false; //make sure that "openOffscreenNav()" runs

				// recalculate the duration because it's opening not closing
				_newDuration = validateNewDuration(OPTIONS.TRANSITIONS.ANIMATE_IN - _newDuration);

				openOffscreenNav();
			}
		};

		// on click outside of the navigation (also if the user taps with a finger)
		_touchInteraction.onClickOrTap = function(event) {
			// only do this if the interaction isn't inside the navigation
			if (_isNavOpen && $(event.target).closest(OPTIONS.CONTAINER).length === 0) {
				event.stopPropagation();
				event.preventDefault();
				closeOffscreenNav();
			}
		};

		// event for actually clicking a button to close the screen
		_closeOnCloseButtonClick = function(event) {
			event.stopPropagation();
			event.preventDefault();
			closeOffscreenNav();
		};

		// bind the events to close an open navigation
		_bindEventsToCloseOpenNavigation = function() {
			// ensure we don't double bind events
			_unbindEventsToCloseOpenNavigation();

			// bind event to the document to close on click of anywhere but the nav
			if (NAMESPACE.util.isDevice.touch()) {
				$(document).on('touchstart.nav mousedown.nav', _touchInteraction.onStart);
				$navContainer.find('.close').on('touchstart.nav mousedown.nav', _closeOnCloseButtonClick);
			} else {
				$(document).on('click.nav', _touchInteraction.onClickOrTap);
				$navContainer.find('.close').on('click.nav', _closeOnCloseButtonClick);
			}
		};

		// remove the event listeners that are no longer needed.
		_unbindEventsToCloseOpenNavigation = function() {
			$(document).off('touchstart.nav mousedown.nav', _touchInteraction.onStart);
			$(document).off('click.nav', _touchInteraction.onClickOrTap);
			$navContainer.find('.close').off('.nav');
		};

		isOpen = function() {
			return _isNavOpen;
		};

		// open nav
		openOffscreenNav = function() {
			if (!_isNavOpen && !_isTransitioning) {
				_isTransitioning = true;

				var openNavEnd,
					openNav;

				openNavEnd = function() {
					$('html').addClass(CONST.CLASS.NAV_OPEN).removeClass(CONST.CLASS.NAV_TRANSITIONING);

					$navContainer.eq(0).focus();

					// reset non-default duration
					_newDuration = false;
					_animations.resetInlineStyle();

					_containerHeightForNav.set();

					_isTransitioning = false;
				};

				openNav = function() {
					$('html').addClass(CONST.CLASS.NAV_TRANSITIONING);

					_isNavOpen = true;

					var openDuration = (_newDuration !== false) ? _newDuration : OPTIONS.TRANSITIONS.ANIMATE_IN;
					_animations.openNav(openDuration, openNavEnd);
				};

				// scroll to the top of the navigation if required
				if ($('#outer-wrap').scrollTop() > 0 && !OPTIONS.USE_FIXED_POSITIONING) {
					$('#outer-wrap').animate({ scrollTop: 0 }, 100, openNav);
				} else {
					openNav();
				}

				// set events to allow for close of the navigation
				_bindEventsToCloseOpenNavigation();
			}
		};

		// close nav
		closeOffscreenNav = function() {
			if (_isNavOpen && !_isTransitioning) {
				_isTransitioning = true;

				var closeNavEnd,
					closeNav;

				// after the animation ends, unbind the transition end event, and set the closed variable
				closeNavEnd = function() {
					$('html').removeClass(CONST.CLASS.NAV_OPEN);

					_isNavOpen = false;

					//inside set timeout to avoid some display issues that can occur
					setTimeout(_containerHeightForNav.unset, 10);

					// reset non-default duration
					_newDuration = false;
					_animations.resetInlineStyle();

					_isTransitioning = false;
				};

				// setup the animation to close the nav
				closeNav = function() {
					//reset the animations
					var closeDuration = (_newDuration !== false) ? _newDuration : OPTIONS.TRANSITIONS.ANIMATE_OUT;
					_animations.closeNav(closeDuration, closeNavEnd);

					// remove the bindings to close the navigation
					_unbindEventsToCloseOpenNavigation();
				};

				closeNav();
			}
		};

		// toggle open/close
		toggleOffscreenNav = function(event) {
			event.stopPropagation();
			event.preventDefault();

			if (_isNavOpen && $('html').hasClass(CONST.CLASS.NAV_OPEN)) {
				closeOffscreenNav();
			} else {
				openOffscreenNav();
			}
		};

		// enable the navigation (used by enquire to turn the navigation on/off)
		enableOffscreenNav = function() {
			_isEnabled = true;

			if (_isNavOpen) {
				_containerHeightForNav.set();
			}
		};

		// disable the navigation (used by enquire to turn the navigation on/off)
		disableOffscreenNav = function() {
			_isEnabled = false;

			if (_isNavOpen) {
				_containerHeightForNav.unset();
			}
		};

		// initialiser
		init = function() {
			if (_isInit) {
				// only run once
				return;
			}

			if ($(OPTIONS.CONTAINER).length === 0) {
				console.warn('The offscreen navigation element (' + OPTIONS.CONTAINER + ') isn\'t present on the page');
				return;
			}

			// bind click events
			$(document).on('click.nav', '.nav-toggle', toggleOffscreenNav);

			// listen for when the expand collapse items inside the navigation have changed
			$navContainer.on('closed.expandcollapse opened.expandcollapse', _containerHeightForNav.set);

			// apply some classes to help styling items that are open
			$navContainer.find('.nav-inner .expandcollapse').on('close.expandcollapse open.expandcollapse', function(event) {
				if (event.type === 'open') {
					$(this).closest('.has-children').addClass('is-open');
				} else if (event.type === 'close') {
					$(this).closest('.has-children').removeClass('is-open');
				}
			});

			// add the semi transparent black overlay
			if (OPTIONS.HAS_BACKGROUND) {
				var bg = '<div class="' + CONST.CLASS.OFFSCREEN_NAV_BG + '"><div class="bg">&nbsp;</div></div>';

				if ($innerWrap.length > 0) {
					$innerWrap.prepend(bg);
					$navBg = $innerWrap.find('.' + CONST.CLASS.OFFSCREEN_NAV_BG + ' .bg');
				} else {
					$('body').prepend(bg);
					$navBg = $('body').find('.' + CONST.CLASS.OFFSCREEN_NAV_BG + ' .bg');
				}
			}

			// if DO_INLINE_SCROLL is a function set it to a static variable instead
			if (typeof (OPTIONS.DO_INLINE_SCROLL) === 'function') {
				OPTIONS.DO_INLINE_SCROLL = OPTIONS.DO_INLINE_SCROLL();
			}

			// add ready class to setup the appropriate CSS transitions
			$('html').addClass(CONST.CLASS.NAV_READY);

			if (OPTIONS.USE_CSS_TRANSLATE) {
				if (typeof (Modernizr) === 'object' && (Modernizr.csstransforms3d && Modernizr.csstransforms)) {
					$('html').addClass(CONST.CLASS.NAV_USES_TRANSLATE);
				} else {
					OPTIONS.USE_CSS_TRANSLATE = false; // fallback to use position left
				}
			}

			if (OPTIONS.USE_FIXED_POSITIONING) {
				if (OPTIONS.USE_NAV_DRAWER_PATTERN) {
					$('html').addClass(CONST.CLASS.NAV_USES_FIXED_POSITIONING);

					if (!OPTIONS.USE_NAV_DRAWER_OVER_FIXED_HEADER) {
						$navContainer.css({
							'padding-top': $('#header').outerHeight()
						});
					}
				}
			}

			// fixed positioning and inline scrolling are only working with the nav drawer pattern
			if (!OPTIONS.USE_NAV_DRAWER_PATTERN) {
				OPTIONS.USE_FIXED_POSITIONING = false;
				OPTIONS.DO_INLINE_SCROLL = false;
			}

			_isInit = true;
		};

		return {
			init: init,
			isOpen: isOpen,
			isInit: _isInit,
			close: closeOffscreenNav,
			enable: enableOffscreenNav,
			disable: disableOffscreenNav,
			OPTIONS: OPTIONS
		};

	}());

}(DDIGITAL));
