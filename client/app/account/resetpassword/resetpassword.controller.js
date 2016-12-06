'use strict';


class ResetPasswordController{
  constructor(Auth, $location, modalService, $mdToast) {
    this.Auth = Auth;
    this.errors = {};
    this.resetPassword.token = $location.search().token;
    this.$location = $location;
    this.modalService = modalService;
    this.$mdToast = $mdToast;
  }

  resetPassword(form) {
    this.resetPasswordResult = {};
    this.submitted = true;

    if (form.$valid) {
      this.Auth.resetPassword(
        this.user.newPassword,
        this.resetPassword.token,
        (err) => {
          if(!err){
            this.resetPasswordResult = {successful:true};
            this.$location.path("home");
            this.modalService.showLoginModal();
            //notification
            var resetPwdSuccessMsgToastController = ['$scope', function ($scope) {
              $scope.toastContent = "Your password is set up successfully.";
              $scope.closeToast = function() {
                $mdToast.hide();
              };
            }];
            this.$mdToast.show({
              controller: resetPwdSuccessMsgToastController,
              templateUrl: 'app/ng/templates/notificationToast.html',
              position: 'top',
              hideDelay: 5000,
              highlightAction: true
            });
            return;
          }
          //show message password is not changed due to failure
            if(err && err.status === 401){
              this.resetPasswordResult = {successful:false, errMsg : "Token expired or user not found."};
              return;
          }
          this.resetPasswordResult = {successful:false, errMsg : "Failed due to unknown reason: " + err.status};
        }
      )

    }
  }
}


angular.module('digitalVillageApp')
  .controller('ResetPasswordController',ResetPasswordController);
