/* ==========================================================================
 * slickslider
 * ========================================================================== */

(function(NAMESPACE) {

	'use strict';

	NAMESPACE.slickslider = function() {

		//$('.multiple-items').slick({
		//	infinite: true,
		//	slidesToShow: 3,
		//	slidesToScroll: 1
		//});

		// Initialise flexslider
		$('.fn-slickslider').each(function() {
			var $slickslider = $(this);

			$slickslider.removeClass('fn-loading');
			//// base config
			//var config = {
            //
			//};
            //
			//// get custom config
			//if (( typeof $slickslider.data('slicksliderOptions') != 'undefined') && ( $slickslider.data('slicksliderOptions').length != 0)) {
			//	var customConfig = $slickslider.data('slickslider-options');
            //
			//	// merge config
			//	if (typeof customConfig == 'object'){
			//		$.extend( config, customConfig );
			//	}
			//}
            //
			//console.log(config)
            //
			//$slickslider.slick(config);

			$slickslider.slick();


		});
	};

}(DDIGITAL));
