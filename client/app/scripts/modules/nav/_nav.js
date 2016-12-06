/* =============================================================================
   OFFSCREEN NAV AND HEADER NAV
   ========================================================================== */

(function(NAMESPACE) {

	'use strict';

	NAMESPACE.nav = (function() {

		// options
		var OPTIONS = {
			HAS_ONSCREEN: true,
			HAS_OFFSCREEN: true,
			MQ: {
				ONSCREEN: DD.bp.get('xxl'),
				OFFSCREEN: DD.bp.get(0, 'xl')
			}
		};

		// reference to nav items to be declared after init so order of import doesn't matter
		var _offscreenNav,
			_onscreenNav;

		// dummy functions/vars to be called if the code isn't included - saves multiple if statements
		var _dummyNav = {
			OPTIONS: {
				CONTAINER: []
			},
			isInit: false,
			init: function() { },
			enable: function() { },
			disable: function() { },
		};

		var init = function() {
			if(!OPTIONS.HAS_ONSCREEN && !OPTIONS.HAS_OFFSCREEN) {
				return;
			}

			_onscreenNav = (OPTIONS.HAS_ONSCREEN) ? NAMESPACE.navOnscreen : _dummyNav;
			_offscreenNav = (OPTIONS.HAS_OFFSCREEN) ? NAMESPACE.navOffscreen : _dummyNav;

			this.dropdown = _onscreenNav;
			this.offscreen = _offscreenNav;

			// assuming both are enabled, if both containers aren't on the page - disable everything
			if ($(_onscreenNav.OPTIONS.CONTAINER).length === 0 && $(_offscreenNav.OPTIONS.CONTAINER).length === 0) {
				return;
			}

			// if the page isn't responsive (e.g. IE8) initialise the desktop view only
			if (!NAMESPACE.IS_RESPONSIVE) {
				if(OPTIONS.HAS_ONSCREEN) {
					// by default the desktop navigation is onscreen
					_onscreenNav.init();
				} else if(!OPTIONS.HAS_ONSCREEN && OPTIONS.HAS_OFFSCREEN) {
					// if onscreen isn't enabled, but offscreen still is, use it for all sizes
					_offscreenNav.init();
				}
				return;
			}

			// initialise (or reinit) the onscreen navigation
			var initOnscreenNav = function() {
				if(_onscreenNav.isInit) {
					_onscreenNav.enable();
					_offscreenNav.disable();
				}

				_onscreenNav.init();
			};

			// initialise (or reinit) the offscreen navigation
			var initOffscreenNav = function() {
				if(_offscreenNav.isInit) {
					_offscreenNav.enable();
					_onscreenNav.disable();
				}

				_offscreenNav.init();
			};

			// most common scenario - has both offscreen and onscreen navigation
			if(OPTIONS.HAS_OFFSCREEN && OPTIONS.HAS_ONSCREEN) {
				enquire.register(OPTIONS.MQ.ONSCREEN, {
					match: initOnscreenNav
				}).register(OPTIONS.MQ.OFFSCREEN, {
					match: initOffscreenNav
				});

				return;
			}

			// backup scenarios
			if(OPTIONS.HAS_OFFSCREEN && !OPTIONS.HAS_ONSCREEN) {
				// if we only have offscreen navigation
				initOffscreenNav();
			} else if(!OPTIONS.HAS_OFFSCREEN && OPTIONS.HAS_ONSCREEN) {
				// if we only have onscreen navigation
				initOnscreenNav();
			}
		};

		return {
			init: init,
			dropdown: _onscreenNav,
			offscreen: _offscreenNav
		};

	}());

}(DDIGITAL));
