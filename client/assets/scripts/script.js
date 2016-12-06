/* ==========================================================================
 * Deloitte Digital
 * ========================================================================== */

window.DDIGITAL = window.DDIGITAL || {};
DDIGITAL.IS_RESPONSIVE = true;
DDIGITAL.IS_EDIT = DDIGITAL.IS_EDIT || false;

/* Stop console.log errors */
if (typeof console === 'undefined') {
	window.console = {};
	console.log = console.error = console.info = console.debug = console.warn = console.trace = console.dir = console.dirxml = console.group = console.groupEnd = console.time = console.timeEnd = console.assert = console.profile = function() {};
}



(function(NAMESPACE) {

	'use strict';

	DD.bp.options({
		breakpoints: [
			{
				name: 'xxs',
				px: 0
			},
			{
				name: 'xs',
				px: 1
			},
			{
				name: 's',
				px: 600
			},
			{
				name: 'm',
				px: 960
			},
			{
				name: 'l',
				px: 1280
			},
			{
				name: 'xl',
				px: 1920
			},
			{
				name: 'xxl',
				px: 2500
			}
		]
	});

	NAMESPACE.INIT = {
		visual: function() {
			NAMESPACE.nav.init();
			NAMESPACE.util.helpers();
			 NAMESPACE.slickslider();
		},
		functional: function() {
			NAMESPACE.mqad.init();
		}
	};

	NAMESPACE.init = function() {
		NAMESPACE.INIT.visual();
		NAMESPACE.INIT.functional();
		NAMESPACE.triggerReady();
	};

	$(document).ready(function() {
		NAMESPACE.init();
	});

}(DDIGITAL));
