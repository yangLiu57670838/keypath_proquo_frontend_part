'use strict';

/**
 * @ngdoc directive
 * @name digitalVillage.directive:categorySkillSelector
 * @description
 * # categorySkillSelector
 * the category skill selector directive allows the user to pick skills, by category and add it to a model variable
 * the skills are fetched from a json file
 */

angular.module('digitalVillageApp').directive('categorySkillSelector',
	function () {
		return {
			restrict: 'AE',
			replace: true,
			scope: {
				categorySkills : '=',
				skillsModel : '=',
        skilltype: '='
			},
			controller: ['$scope', '$element', '$mdMenu', 'Business', function ($scope, $element, $mdMenu, Business) {



        $mdMenu.hide(null, { closeAll: true });
				// add/remove a skill keyword to a var in the model
				// assumes model var is an array

				$scope.updateModel = function($event, skill){
					$event.preventDefault();

          let existing = _.find( $scope.skillsModel, function( el ) {
            return el.refId == skill._id;
          } );

          if (!existing) {
            let newSkill = {
              name: skill.name,
              refId: skill._id,
              // Some UI stuff from dom - see if needed
              active: true
            };
            $scope.skillsModel.push(newSkill);
          }

				};

        $scope.checkActive = function(skillModel){
          return _.find($scope.skillsModel, (model => {return model.refId == skillModel._id})) !== undefined;
        };

        var originatorEv;
        $scope.openMenu = function($mdOpenMenu, ev) {
          originatorEv = ev;
          $mdOpenMenu(ev);
        };

        $scope.removeSkill = function(skillModel){
          for(var i=0; i<$scope.skillsModel.length; i++){
            if($scope.skillsModel[i].refId === skillModel._id){
              $scope.skillsModel.splice(i,1);
              return true;
            }
          }
        };
			}],
			link: function (scope, elem, attrs) {
				// directive link

			},
			templateUrl: 'app/ng/templates/categorySkillSelector.html'
		};

	});
