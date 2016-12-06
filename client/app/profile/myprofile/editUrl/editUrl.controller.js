'use strict';

angular.module('digitalVillageApp')
  .controller('EditUrlCtrl', function ($scope, $mdDialog, $mdMedia, item, Document, Business, Social) {

    var self = this;
    self.newLink = "";
    self.newDescription =  "";
    self.chosenType = "";
    self.business =  item.business;
    self.socialTypeDefaults = Social.getSocialTypes();

    self.cancel = function() {
      $mdDialog.cancel();
    };


    self.chosen = function(){
      self.dropDownError=false;
      for(var i=0; i<self.socialTypeDefaults.length; i++){
        if(self.socialTypeDefaults[i].value === self.chosenType){
          self.chosenUrl = self.socialTypeDefaults[i].url;
        }
      }
    };


    self.socialUrls = angular.copy(self.business.socialUrls);


    self.spliceTypes = function(){
      self.socialTypes = angular.copy(self.socialTypeDefaults);
      for(var i=0;i<self.socialUrls.length; i++){
        for(var n=0;n<self.socialTypes.length; n++){
          if(self.socialTypes[n].value === self.socialUrls[i].urlIconImage){
            self.socialTypes.splice(n, 1);
          }
        }
      }
    };
    self.spliceTypes();


    self.addLink = function(urlForm){


      if (urlForm) {

          if(self.newLink.includes('http') || self.newLink.includes('www') || self.newLink.includes(self.chosenUrl) || self.newLink.indexOf('/') === 0 ){
            urlForm.$invalid = true;
            urlForm.linkName.$error.linkInvalid = true;
          }else if(self.newLink === ''){
            urlForm.linkName.$error.required = true;
          }
          if(urlForm.socialType.$error.required){
            self.dropDownError = true;
          }else{
            self.dropDownError = false;
          }
        if(urlForm.$invalid){
          return;
        }
        var objToAdd = {
          url: self.newLink,
          urlDescription: self.newDescription,
          urlIconImage: self.chosenType
        };

        self.socialUrls.unshift(objToAdd);

        self.spliceTypes();
        self.newLink = "";
        self.newDescription =  "";
        self.chosenType = "";
        self.chosenUrl = "";
        self.dropDownError=false;
        urlForm.$setPristine();
        urlForm.$setUntouched();
      }
    };

    self.deleteLink = function(index){
        for(var i=0; i<self.socialUrls.length; i++ ){
          if(self.socialUrls[index].urlIconImage === self.socialUrls[i].urlIconImage){
            self.socialUrls.splice(i, 1);
            break;
          }
        }
      self.socialUrls.splice(index, 1);
      self.spliceTypes();
    };


    self.saveLinks = function(urlSaveForm){

      if (urlSaveForm) {

        if(urlSaveForm.$invalid){
          return;
        }

        self.business.socialUrls = self.socialUrls;
        Business.update({id: self.business._id, socialUrls: self.business.socialUrls});
        self.cancel();
        urlSaveForm.$setPristine();
        urlSaveForm.$setUntouched();
      }
    };



  });
