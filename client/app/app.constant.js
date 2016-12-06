(function(angular, undefined) {
'use strict';

angular.module('digitalVillageApp.constants', [])

.constant('appConfig', {gstPercentage:10,maximumNumberOfBusinessesPerRequestForQuote:5,maximumNumberOfBusinessesPerInvite:5,userRoles:['guest','user','admin']})

;
})(angular);