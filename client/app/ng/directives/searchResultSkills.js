'use strict';

/**
 * @ngdoc directive
 * @name digitalVillage.directive:searchResultSkills
 * @description
 * # searchResultSkills
 */
angular.module('digitalVillageApp').directive('searchResultSkills',
	['$timeout', '$window',
	function($timeout) {
		return {
			restrict : 'AE',
			replace: true,
			scope : {
				skills : '=',
				onClick : '&',
        skillsExpandLimit:"="
			},
			controller: ['$scope', '$element', '$window', function($scope, $element, $window){
        $scope.expandSkills = false;
				// check if overflown and add class
				$scope.checkOverflown = function(el){
					if ( angular.element(el)[0].scrollHeight > angular.element(el)[0].clientHeight ){
						$scope.isOverflown = true;
					}
				};

				// recheck overflown when windowd size changes
				$scope.$watch(function(){
					return $window.innerWidth;
				}, function(value) {
					$scope.checkOverflown($element);
				});
			}],
			link : function(scope, element, attrs) {
				// check overflown on render
				$timeout(function() {
					scope.checkOverflown(element);
				});
			},
			templateUrl: 'app/ng/templates/searchResultSkills.html'
		};

	}]);
