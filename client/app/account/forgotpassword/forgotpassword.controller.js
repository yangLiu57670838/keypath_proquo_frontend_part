'use strict';


class ForgotPasswordController{
  constructor( Auth) {
    this.Auth = Auth;
    this.errors = {};
  }

  forgotPassword(form){
    this.forgotPasswordResult = {}
    this.submitted = true;

    if (form.$valid) {
      this.Auth.forgotPassword(
        this.forgotPassword.email.toLowerCase(),
        (err) => {

          this.forgotPasswordResult = {successful:true};
          this.forgotPassword.email = "";
          return;

        }
      )

    }
  }
}


angular.module('digitalVillageApp')
  .controller('ForgotPasswordController', ForgotPasswordController);
