'use strict';

angular.module('digitalVillageApp')
  .service('LoadGoogleMapAPI', function ($window, $q, Config) {

    var deferred = $q.defer();
    // Load Google map API script
    function loadScript(google_API_Browser_Key) {
      var script = document.createElement('script');
      script.src = `//maps.googleapis.com/maps/api/js?key=${google_API_Browser_Key}&signed_in=true&libraries=places&callback=initMap`;
      document.body.appendChild(script);
    }

    // Script loaded callback, send resolve
    $window.initMap = function () {
      deferred.resolve();
    };

    Config.get('GOOGLE_API_BROWSER_KEY').then((key) =>{
      loadScript(key);
    });


    return deferred.promise;
  });

