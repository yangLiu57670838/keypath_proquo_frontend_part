'use strict';

angular.module('digitalVillageApp').animation('.ng-anim-slide-down', function() {
	return {
		enter: function($element, done) {
			var $inner = $element.find('> *').css('opacity', 0);

			console.log('entering');

			// Slide the element down
			$element.velocity('slideDown', { duration: 250 });

			// Fade the element in
			$inner.velocity({ opacity: 1 }, {
				duration: 250,
				delay: 125,
				complete: function() {
					done();
				}
			});
		},
		leave: function($element, done) {
			// Collapse the current element
			$element.velocity('slideUp', {
				duration: 250,
				complete: done
			});
		}
	};
});
