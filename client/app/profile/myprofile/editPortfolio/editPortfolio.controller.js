'use strict';

angular.module('digitalVillageApp')
  .controller('EditPortfolioCtrl', function ($scope, $mdDialog, $mdMedia, item, Document, Business, $http, $timeout) {
    var self = this;
    self.item = item;
    self.cancel = function() {
      $mdDialog.hide();
    };


    self.uploadImage = function () {
      Document.uploadImage().then(blob => {
          self.item.business.portfolio[self.item.portfolioIndex].fullImageUrl = blob[0].url;
          self.item.business.portfolio[self.item.portfolioIndex].thumbnailImageUrl = blob[0].url;
          var itemToSave = {id: self.item.business._id, portfolio: self.item.business.portfolio};
          Business.update(itemToSave);
      }, console.error);
    };

    self.saveBusinessItem = function(){
      //Todo - this timeout is a dirty dirty hack to fix an issue of the previous model being sent - that we can't fix right now
      $timeout(function(){
        Business.update({id: self.item.business._id, portfolio: self.item.business.portfolio});
      });
    };

    self.deletePortfolioEntry = function(){
      self.item.business.portfolio.splice(self.item.portfolioIndex, 1);
      self.saveBusinessItem();
      $mdDialog.hide();
    };

  });
