'use strict';

angular.module('digitalVillageApp')
  .service('modalService', function ($mdDialog, Auth, $mdMedia) {
    var loginOpen = false;

    var service = {};

    service.showLoginModal = function ($event, toStateName, toStateParams) {
      if (!loginOpen) {
        loginOpen = true;
        return $mdDialog.show({
          controller: 'LoginModalController',
          controllerAs: 'vm',
          templateUrl: 'app/account/login/loginModal.html',
          parent: angular.element(document.body),
          targetEvent: $event,
          clickOutsideToClose: true,
          locals: { toStateName: toStateName, toStateParams: toStateParams }
        }).then(function (answer) {
          loginOpen = false;
        }, function () {
          loginOpen = false;
        });
      }
    };

    service.isLoginModalOpen = function () {
      return loginOpen;
    };

    service.showTermsModal = function ($event) {
      $mdDialog.show({
        controller: 'TermsController',
        controllerAs: 'tc',
        templateUrl: 'app/account/signup/termsModal.html',
        parent: angular.element(document.body),
        targetEvent: $event,
        clickOutsideToClose: true
      }).then(function (answer) {
        // accepted
      }, function () {
        // cancelled
      });
    };

    // DEPRECATED NO LONGER USE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    service.showChatModal = function ($event, userId, businessId) {
      Auth.isLoggedIn(_.noop).then(is => {
        if (is) {
          $mdDialog.show({
            controller: 'chatModalCtrl',
            templateUrl: 'app/ng/templates/chatModal.html',
            parent: angular.element(document.body),
            targetEvent: $event,
            clickOutsideToClose: false,
            hasBackdrop: true,
            locals: { userId: userId, businessId: businessId }
          }).then(function (answer) {
            // accepted
          }, function () {
            // cancelled
          });
        } else {
          service.showLoginModal();
        }
      });
    };

    service.showEnlargedImg = function (ev, item) {
      $mdDialog.show({
        controller: 'PortfolioCtrl',
        templateUrl: 'app/profile/portfolio/portfolio.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          item: item
        }
      });
    };

    service.showSuperEnlargedImgEditableModal = function (ev, item) {
      $mdDialog.show({
        controller: 'EditPortfolioCtrl',
        controllerAs: 'vm',
        templateUrl: 'app/profile/myprofile/editPortfolio/editPortfolio.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          item: item
        }
      });
    };

    service.showForgotPwdModal = function (ev) {

      $mdDialog.show({
        controller: 'ForgotPasswordController',
        controllerAs: 'vm',
        templateUrl: 'app/account/forgotpassword/forgotpassword.html',
        targetEvent: ev,
        clickOutsideToClose: true
      });

    };

    service.showRatingModal = function (ev, params) {
      $mdDialog.show({
        controller: 'RateCtrl',
        controllerAs: 'vm',
        templateUrl: 'app/rating/rate.html',
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          params: params
        }
      });
    };

    service.showFeedbackModal = function (ev, params) {
      $mdDialog.show({
        templateUrl: 'app/feedback/feedback.html',
        targetEvent: ev,
        clickOutsideToClose: true,
        controller: function ($scope, $mdDialog) {
          $scope.closeDialog = function () {
            $mdDialog.hide();
          };
        }
      });
    };

    service.showQualificationsModal = function (ev, item) {
      $mdDialog.show({
        controller: 'EditQualificationsCtrl',
        controllerAs: 'vm',
        templateUrl: 'app/profile/myprofile/editQualifications/editQualifications.html',
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          item: item
        }
      });
    };

    service.showUrlModal = function (ev, item) {
      $mdDialog.show({
        controller: 'EditUrlCtrl',
        controllerAs: 'vm',
        templateUrl: 'app/profile/myprofile/editUrl/editUrl.html',
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          item: item
        }
      });
    };

    service.showCompanyNameModal = function (ev, item) {
      $mdDialog.show({
        controller: 'EditCompanyNameCtrl',
        controllerAs: 'vm',
        templateUrl: 'app/profile/myprofile/editCompanyName/editCompanyName.html',
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          item: item
        }
      });
    };

    service.showABNRegisterModal = function (ev, item) {
      return $mdDialog.show({
        controller: 'ABNRegisterModalCtrl',
        controllerAs: 'vm',
        templateUrl: 'components/modalService/abnRegisterModal.html',
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          item: item
        }
      });
    };

    service.showGenericConfirmModal = function (ev, item) {
      $mdDialog.show({
        controller: 'GenericConfirmationModalCtrl',
        controllerAs: 'vm',
        templateUrl: 'components/modalService/genericConfirmationModal.html',
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          item: item
        }
      });
    };

    service.showRejectBriefConfirmModal = function (ev, item) {
      $mdDialog.show({
        controller: 'RejectBriefConfirmCtrl',
        controllerAs: 'vm',
        templateUrl: 'app/projects/quote/rejectBrief.html',
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          item: item
        }
      });
    };

    service.showDeleteQuoteConfirmModal = function (ev, item) {
      $mdDialog.show({
        controller: 'DeleteQuoteConfirmCtrl',
        controllerAs: 'vm',
        templateUrl: 'app/projects/quote/deleteQuote.html',
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          item: item
        }
      });
    };

    service.showRejectQuoteConfirmModal = function (ev, item) {
      $mdDialog.show({
        controller: 'RejectQuoteConfirmCtrl',
        controllerAs: 'vm',
        templateUrl: 'app/projects/quote/rejectQuote.html',
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          item: item
        }
      });
    };

    service.showCancelInProgressProjectConfirmModal = function (ev, item) {
      $mdDialog.show({
        controller: 'CancelInProgressConfirmCtrl',
        controllerAs: 'vm',
        templateUrl: 'app/projects/projectsList/cancelInProgressConfirmModal.html',
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          item: item
        }
      });
    };

    service.showSimpleFormModal = function (ev, item) {
      $mdDialog.show({
        controller: 'SimpleFormModalCtrl',
        controllerAs: 'vm',
        templateUrl: 'components/modalService/simpleFormModal.html',
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          item: item
        }
      });
    };

    service.showGenericConfirmWithReasonModal = function (ev, item) {
      $mdDialog.show({
        controller: 'GenericConfirmWithReasonModalCtrl',
        controllerAs: 'vm',
        templateUrl: 'components/modalService/genericConfirmWithReasonModal.html',
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          item: item
        }
      });
    };

    service.showBriefSwapSkillsModal = function (ev, businessSwapItems, project, business) {
      $mdDialog.show({
        controller: 'BriefSwapSkillsModalCtrl',
        controllerAs: 'vm',
        templateUrl: 'app/projects/brief/briefSwapSkillsModal/briefSwapSkillsModal.html',
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          businessSwapItems: businessSwapItems,
          project: project,
          business: business
        }
      });
    };

    service.showEmailVerificationModal = function (ev) {
      $mdDialog.show({
        controller: 'EmailVerificationModalCtrl',
        controllerAs: 'vm',
        templateUrl: 'app/email/verificationModal/emailVerificationModal.html',
        targetEvent: ev,
        clickOutsideToClose: false
      });
    };

    service.showStartBusinessOptionsModal = (ev) => {
      $mdDialog.show({
        controller: 'StartBusinessModalCtrl',
        controllerAs:'vm',
        templateUrl: 'components/modalService/startBusinessOptionsModal.html',
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };

    return service;
  });
