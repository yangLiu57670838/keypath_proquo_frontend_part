/* ==========================================================================
 * MEDIA QUERY ATTACH/DETACH
 * ========================================================================== */

(function(NAMESPACE) {

	'use strict';

	NAMESPACE.mqad = (function() {
		var init,
			trigger;

		init = function(triggerOnly) {
			var isTriggerOnly = (typeof (triggerOnly) === 'boolean') ? triggerOnly : false;

			$('.fn_mqad').each(function(i, el) {
				var $el = $(el),
					mqAttach = $el.attr('data-mqad-attach') || false,
					mqDetach = $el.attr('data-mqad-detach') || false,
					mqStatic = $el.attr('data-mqad-static') || null,
					onAttach,
					onDetach;

				onAttach = function(init) {
					var isInit = (typeof (init) === 'boolean') ? init : false;
					$el.trigger('attach.mqad', [isInit]);
				};

				onDetach = function(init) {
					var isInit = (typeof (init) === 'boolean') ? init : false;
					$el.trigger('detach.mqad', [isInit]);
				};

				if (NAMESPACE.IS_RESPONSIVE === false) {
					if (mqStatic !== null) {
						if (mqStatic === 'true') {
							onAttach(true);
						} else if (mqStatic === 'false') {
							onDetach(true);
						}

						return;
					}

					// only trigger, don't bind the enquire
					// still run the rest because the DD.bp.is() code will return
					// appropriately even if it's a non-responsive page
					isTriggerOnly = true;
				}

				if (mqAttach === false && mqDetach === false) {
					// nothing valid
					return;
				} else if (mqAttach !== false && mqDetach !== false) {
					// both are valid
					if (isTriggerOnly !== true) {
						enquire.register(DD.bp.get(mqAttach), {
							match: onAttach
						}).register(DD.bp.get(mqDetach), {
							match: onDetach
						});
					}

					if (DD.bp.is(mqAttach)) {
						onAttach(true);
					}

					if (DD.bp.is(mqDetach)) {
						onDetach(true);
					}
				} else {
					// either mqAttach or mqDetach is valid
					if (isTriggerOnly !== true) {
						enquire.register(DD.bp.get(mqAttach ? mqAttach : mqDetach), {
							match: mqAttach ? onAttach : onDetach,
							unmatch: mqAttach ? onDetach : onAttach
						});
					}

					if (DD.bp.is(mqAttach)) {
						onAttach(true);
					} else {
						onDetach(true);
					}
				}

			});
		};

		trigger = function() {
			init(true);
		};

		return {
			init: init,
			trigger: trigger
		};

	}());

}(DDIGITAL));
