'use strict';

angular.module('digitalVillageApp')
  .controller('BriefSwapSkillsModalCtrl', function ($scope, $mdDialog, businessSwapItems, $timeout, $filter, project, business) {
    var self = this;
    self.businessSwapItems = businessSwapItems;
    self.project = project;
    self.business = business;
    self.$timeout = $timeout;

    self.showSwapComponent = true;
    self.$filter = $filter;

    self.cancel = function() {
      $mdDialog.cancel();
    };



    self.showSwapComponentFunc = function($timeout, self){
      self.$timeout(function(){
        self.showSwapComponent = true;
      }, 500);
    };

    self.hideSwapComponentFunc = function($timeout, self){
      self.$timeout(function(){
        self.showSwapComponent = false;
      });
    };


    self.toggleThingsIcanSwap = function(item){
      if(item.chosen){
        var index = self.checkDuplicateSwapItems(item);
        self.project.brief.thingsICanSwap.splice(index,1);
        item.chosen = false;
      }else{
        self.project.brief.thingsICanSwap.push(item.swapItem);
        item.chosen = true;
      }

    };

    self.searchSwapItems = function(searchText) {
      var obj = {swapItem:searchText, chosen:false};
      var searchArrayObj = [obj];
      if (searchText) {
        let result = self.$filter('filter')(self.businessSwapItems, searchText, '==');

        result.unshift(obj);
        if(result.length == 0){
          return searchArrayObj;
        }
        return result;
      } else {
        return self.businessSwapItems;
      }
    };

    self.searchTextChange = function(text) {
      self.searchAutocompleteIsActive = text.length > 0;
      self.searchText = text;
    };

    self.checkDuplicateSwapItems = function(item){
      for(var i=0;i<self.project.brief.thingsICanSwap.length; i++){
        if(item.swapItem.toLowerCase() === self.project.brief.thingsICanSwap[i].toLowerCase()){
          return i;
        }
      }
      return false;
    };


    self.selectAndAddSwapItem = function(item, autoCompleteScope) {

      if(item != undefined){
        self.swapItemLengthToLong = false;
        self.swapItemDuplicate = false;
        if(item && item.swapItem.length > 40){
          self.swapItemLengthToLong = true;
        }

        if(self.checkDuplicateSwapItems(item)){
          autoCompleteScope.searchText = "";
          autoCompleteScope.$parent.searchText = "";
          self.swapItemDuplicate = true;
        } else if(item && !self.swapItemLengthToLong){
          if(_.indexOf(self.project.brief.thingsICanSwap, item) === -1){
            self.project.brief.thingsICanSwap.push(item.swapItem);
          }

          for(var i=0; i<self.businessSwapItems.length; i++){
            if(item.swapItem.toLowerCase() === self.businessSwapItems[i].swapItem.toLowerCase()){
              self.businessSwapItems[i].chosen = true;
              autoCompleteScope.searchText = "";
              autoCompleteScope.$parent.searchText = "";
              self.swapError = false;
              return;
            }
          }

          //
          item.chosen = true;
          self.businessSwapItems.push(item);

          autoCompleteScope.searchText = "";
          autoCompleteScope.$parent.searchText = "";
          self.swapError = false;
        }else{
          autoCompleteScope.searchText = "";
          autoCompleteScope.$parent.searchText = "";
        }

        self.hideSwapComponentFunc(self.$timeout, self);
        self.showSwapComponentFunc(self.$timeout, self);
      }
    };


  });
