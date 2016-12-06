'use strict';

angular.module('digitalVillageApp')
  .controller('EditCompanyNameCtrl', function ($scope, $mdDialog, $mdMedia, item, Document, Business) {
    var self = this;
    self.business =  item.business;
    self.businessName = self.business.name;
    self.url = self.business.urls[0] && self.business.urls[0].url;

    self.cancel = function() {
      $mdDialog.cancel();
    };

    self.saveCompanyName = function(companySaveForm){
      if (!companySaveForm || companySaveForm.$invalid) {
        return;
      }

      self.business.urls = [];
      self.url = self.url && self.url.trim();
      if (self.url) {
        self.business.urls.push({
          url: self.url,
          urlDescription: 'None',
          urlIconImage: 'custom'
        });
      }
      self.business.name = self.businessName;
      Business.update({id: self.business._id, urls: self.business.urls, name: self.business.name}).$promise.then(res => {
        $mdDialog.hide();
        companySaveForm.$setPristine();
        companySaveForm.$setUntouched();
      });
    };

  });
