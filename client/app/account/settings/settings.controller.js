'use strict';


class SettingsController {

  constructor(Auth, $state) {
    this.Auth = Auth;
    this.showPassword = false;
    this.changePasswordResult = {}
    this.Auth.getCurrentUser(usr=>{if(usr.provider == "local"){this.changePasswordEnabled = true}})
  }

  changePassword(form) {
    this.changePasswordResult = {}
    this.submitted = true;

    if (form.$valid) {
      this.Auth.changePassword(
        this.user.oldPassword,
        this.user.newPassword,
        (err) => {
          if(!err){
            this.changePasswordResult = {successful:true}
            return
          }
          //show message password is not changed due to failure
          if(err && err.status === 403){
            // password is not right// seems a problem for facebook user now
            //alert("failed due to " + err.status);
            this.changePasswordResult = {successful:false, errMsg : "The old password is not correct."}
            return;
          }
          this.changePasswordResult = {successful:false, errMsg : "Failed due to unknown reason: " + err.status}
        }
      )

    }
  }

}

angular.module('digitalVillageApp')
  .controller('SettingsController', SettingsController);
