'use strict';

/**
 * @ngdoc function
 * @name digitalVillage.controller:chatModal
 * @description
 * # chatModal
 * controller to pass into the chat modal
 */
angular.module('digitalVillageApp').controller('chatModalCtrl',
	function ($scope, $mdDialog, $state,$rootScope, userId, businessId, Business) {
      var self = this;
      //self.idToSearch = '123';
      //self.idToSearch = '6789';
      self.idToSearch = userId;

      $scope.currentPerson;
      $scope.chatMessages = [];

    $scope.userId = userId;
    $scope.businessId = businessId;
    $scope.missingABN = false;
    $scope.myABN="";
    $scope.myBusiness;
    $scope.briefCreate = function(businessId){
      Business.mine().$promise.then(function(result){
        if(result.abnVerified == true && result.abn){
          $state.go("briefCreate", {engageWith : businessId});
          $scope.close();
        }else{
          $scope.missingABN = true;
          $scope.myBusiness = result;
        }
      });
    };

      // Person.current().$promise.then(function(person) {
      //   $scope.currentPerson = person;
      //
      //   getOtherPerson(self.idToSearch);
      //
      // }, function(failure) {
      //   console.log(failure);
      // });

      // function getOtherPerson(idToSearch){
      //   Person.get({personId: idToSearch}).$promise.then(function(person) {
      //     $scope.otherUser = person;
      //     setDefaultChatMessages();
      //     console.log($scope.otherUser);
      //   }, function(failure) {
      //     console.log(failure);
      //   });
      // }



      function setDefaultChatMessages(){
        //todo: move chat messaging functionality into a directive
        // all chat messages
        // todo: these should be polled from a server
        console.log("id == "+self.idToSearch);
        if(self.idToSearch == '6789'){
          $scope.chatMessages = [
            {id: "6789", time:"3 hours",  "content": "Hi Megan, I'm a start up business and looking for some help with " +
            "creating some content for my website. Are you available in this week?"},
            {id: "1234", time:"2 hours", "content": "Hi Dave, great to here from you, I do have some availability this week, what " +
            "are you looking for exactly?"},
            {id: "6789",  time:"2 hours", "content": "Can we arrange a catch up or phone call to discuss?"}
         ];
        }else if(self.idToSearch == '123'){
          $scope.chatMessages = [
            {id: "1234", time:"1 day", "content": "Hi James, I’m looking for some help with building my new website" +
            "– are you available to help in the next couple of weeks?"},
            {id: "123", time:"1 day", "content": "Hi Megan, yes, that should work. Let me know what you’re looking for?"},
            {id: "system", time:"2 hours", "content": "When you're ready select 'Request work' button on the right to create a brief."},

            {id: "1234", time:"1 day", "content": "I’m really just looking for a basic WordPress site at the moment, do you still need help with copywriting?"}
          ];
        }

      }


			//var counter = 0;
			$scope.addMessage = function(message){
        var messageToPush = {id: "1234", "icon": "assets/images/logos/MeganAvatar.jpg", "content": message};
				$scope.chatMessages.push(messageToPush);
        $scope.currentMessage="";
        $("#chatBox").focus();
			};

      $scope.close = function() {
        $mdDialog.hide();
      };

      $scope.cancel = function() {
        $mdDialog.cancel();
      };

      $scope.requestWork = function() {
        $mdDialog.hide();
        $state.go('requestType');
      };


      var originatorEv;
      $scope.openMenu = function($mdOpenMenu, ev) {
        originatorEv = ev;
        $mdOpenMenu(ev);
      };

      $scope.submitABN = function(){
        if ($scope.ABNForm.$invalid) {
          $scope.ABNForm.abn.$touched = true;
          $scope.ABNForm.$setSubmitted();
        }else{
          Business.update({id: $scope.myBusiness._id}, $scope.myBusiness).$promise.then((result)=> {
            $state.go("briefCreate", {engageWith : $scope.businessId});
            $scope.close();
          }, (response) => {
            self.serverErrors = response.data.errors;
          });
        }
      };

});


