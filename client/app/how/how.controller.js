'use strict';

class HowController {
  constructor($stateParams, modalService, $document, Auth, $state) {
    this.$state = $state;
    this.email = undefined;
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
      var top = 0;
      var duration = 1000;
      var id = skillLabel;
      var elementToScrollTo = angular.element(document.getElementById(id));
      $document.scrollToElementAnimated(elementToScrollTo, top, duration);
    };
  }


  signUp(form) {
    if(form.$invalid) {
      return;
    }
    this.$state.go('getstarted', {email: this.email});
  }


}

angular.module('digitalVillageApp')
  .controller('HowCtrl', HowController);
