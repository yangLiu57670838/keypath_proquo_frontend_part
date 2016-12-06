'use strict';

angular.module('digitalVillageApp')
  .controller('VideoLoaderControllerCtrl', function ($rootScope,$scope, $window) {
    var player;

    $window.onYouTubeIframeAPIReady = function () {
      player = new YT.Player('player', {
        height: '315',
        width: '550',
        videoId: 'blY8Xs5KYo8',
        playerVars:{
          rel: 0,
          showinfo:0
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    };

    // autoplay video
    function onPlayerReady(event) {
      event.target.playVideo();
    }

    // when video ends
    function onPlayerStateChange(event) {
      if(event.data === 0) {
        $rootScope.$broadcast("closeVideo",{});
      }
    }

  });
