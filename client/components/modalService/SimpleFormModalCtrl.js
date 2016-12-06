'use strict';

/**
 * this is used for the modal with a simple form;
 * caller needs to pass in a formObject that looks like the below
 * formObject : {
            title: "Add a new thing that you can swap",
            fields:[
              {
                fieldName: "serviceName",
                fieldLabel: "Service Name",
                fieldType: "text",
                fieldRequired: true
              }
            ],
            selfValidate: (newServiceName)=>{
              let duplicate = _.find(self.business.thingsICanSwap, (theThing) =>{
                return theThing.toLowerCase() === newServiceName.toLowerCase();
              });
              if(duplicate) return {error: duplicate + " exists already."};
              else return null;
            }
          }
 * "selfValidate" is used for adding additional validation in the parent controller,
 * which will be invoked after basic form validation and before invoking callback
 */
angular.module('digitalVillageApp')
  .controller('SimpleFormModalCtrl', function ($scope, $mdDialog, item) {

    var self = this;
    self.item = item;
    self.$scope = $scope;
    self.formObject = item.formObject;
    self.submitCallback = item.submitCallback;
    self.confirmationMessage =  item.confirmationMessage;
    self.validationError = "";

    self.changeFieldValue = function(){
      self.validationError = "";
    };

    self.cancel = function() {
      $mdDialog.cancel();
    };

    self.submit = function() {
        self.$scope.mySimpleForm.$setSubmitted();
        if(self.$scope.mySimpleForm.$valid){
          let validation = self.item.formObject.selfValidate(self.formObject.fields[0].value);
          if(validation && validation.error){
            self.validationError = validation.error;
          }else{
            self.submitCallback(self.formObject);
            $mdDialog.cancel();
          }
        }
    };

  });
