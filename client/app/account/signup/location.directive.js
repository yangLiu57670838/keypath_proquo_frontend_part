'use strict';

angular.module('digitalVillageApp').directive('location', function () {
  return {
    restrict: 'E',
    templateUrl: "app/account/signup/locationTemplate.html",
    scope: {
      result: "=",
      thisid: "=",
      titleLabel: "=",
      showEditButton: "=",
      saveLocation: "&saveLocation",
      cancelLocation: "=",
      activateWatch: "="
    },
    controller: function controller($scope, LoadGoogleMapAPI, $timeout) {

      $scope.location = {};
      $scope.setLocationToggle = function (data) {
        $scope.showLocationInput = !$scope.showLocationInput;
        if ($scope.showLocationInput) {
          $timeout(function () {
            var inputElem = document.getElementById($scope.thisid);
            if (inputElem) {
              inputElem.value = $scope.result.formattedAddress;
              inputElem.focus();
            }
            $scope.location.local = $scope.result.formattedAddress ? $scope.result.formattedAddress : "";
          });
        } else {
          if (!document.getElementById($scope.thisid).value) {
            $timeout(function () {
              if (document.getElementById($scope.thisid)) {
                document.getElementById($scope.thisid).value = "";
              }

              $scope.result.suburb = "";
              $scope.result.postCode = "";
              $scope.result.formattedAddress = "";
              if ($scope.result.loc && $scope.result.loc.coordinates) {
                $scope.result.loc.coordinates = [];
              }
              $scope.showLocationInput = false;
            });
          }
        }
      };

      $scope.saveEdit = function () {
        if ($scope.saveLocation) {
          $scope.saveLocation();
        }
      };
      $scope.cancelEdit = function () {
        $scope.cancelLocation();
      };

      if ($scope.activateWatch) {
        $scope.$watch('result.formattedAddress',  (newVal, oldVal) => {
          if (newVal != oldVal && $scope.saveLocation) {
            $scope.saveLocation();
          }
        });
      }


      var autocomplete;

      function initAutocomplete() {
        // Create the autocomplete object, restricting the search to geographical
        // location types.
        autocomplete = new google.maps.places.Autocomplete(
          (document.getElementById($scope.thisid)),
          {
            //types: ['(region)'],
            types: ['geocode'],
            componentRestrictions: {country: 'au'}

          });

        // When the user selects an address from the dropdown, populate the address
        // fields in the form.
        autocomplete.addListener('place_changed', $scope.fillInAddress);
      }

      function extractComponent(components, contains, field) {
        let comp = _.find(components, (component) => {
          return _.reduce(
            contains,
            (truthVal, typeToCheck) => {
              return truthVal && (component.types.indexOf(typeToCheck) > -1);
            },
            true
          );
        });

        return comp ? comp[field] : comp;
      }

      $scope.fillInAddress = function (data) {
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();

        if (place) {
          $scope.result.suburb = extractComponent(place.address_components, ['locality', 'political'], 'short_name');
          $scope.result.postCode = extractComponent(place.address_components, ['postal_code'], 'short_name');
          $scope.result.formattedAddress = place.formatted_address;
          if (place.geometry) {
            $scope.result.loc = {
              type: "Point",
              coordinates: [place.geometry.location.lng(), place.geometry.location.lat()]
            };
          }
        }
        $timeout(function () {
          $('#' + $scope.thisid).blur();
          $scope.showLocationInput = false;
          if ($scope.saveLocation) {
            $scope.saveLocation();
          }
        });
      };


      $scope.init = function () {

        LoadGoogleMapAPI.then(function () {
          // I know it's ugly but we need a timeout to make sure the angular-material input field is available
          $timeout(function () {
            initAutocomplete();
          });
        }, function () {
          // Promise rejected
        });
      };

    },
    link: function (scope, element, $location) {
      scope.setId = scope.thisid;
    }
  };
});
