'use strict';

class HomeController {

  constructor($stateParams, modalService, $document, $window, $timeout, $rootScope, $scope, Auth) {

    this.showVideo = false;
    this.$timeout = $timeout;
    this.$scope = $scope;
    this.$window = $window;
    this.$document = $document;
    this.isLoggedIn = Auth.isLoggedIn;

    this.appServices = [
      {
        'icon' : 'assets/images/icon_marketing_outline.svg',
        'heading' : 'Marketing'
      },
      {
        'icon' : 'assets/images/icon_design_outline.svg',
        'heading' : 'Design'
      },
      {
        'icon' : 'assets/images/icon_technology_outline.svg',
        'heading' : 'Technology'
      },
      {
        'icon' : 'assets/images/icon_accounting_outline.svg',
        'heading' : 'Accounting'
      },
      {
        'icon' : 'assets/images/icon_business_outline.svg',
        'heading' : 'Business'
      }
    ];

    if ($stateParams.popLoginModal) {
      modalService.showLoginModal();
    }

    this.scrollToPos = function(skillLabel) {
      let top = 0;
      let duration = 1000;
      let id = skillLabel;
      let doc = this.$document;
      let elementToScrollTo = angular.element(doc.context.getElementById(id));
      $document.scrollToElementAnimated(elementToScrollTo, top, duration);
    };


    $rootScope.$on('closeVideo', () => {
      this.closeVideo();
      this.$scope.$apply();
    });

  }

  closeVideo(){
    let doc = this.$document;
    angular.element(doc.context.querySelector('html')).css({"overflow-y":"scroll"});
    this.showVideo = false;
  }

  playVideo(){
    this.$window.scroll(0, 0);
    let doc = this.$document;
    // need a timeout to give enough time (1 cycle) for the page to scroll to the top
    this.$timeout(function(){
      angular.element(doc.context.querySelector('html')).css({"overflow-y":"hidden"});
    });
    this.showVideo = true;
  }



}

angular.module('digitalVillageApp')
  .controller('HomeController', HomeController);
