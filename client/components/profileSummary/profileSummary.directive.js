'use strict';

class ProfileSummaryCtrl {
  constructor($scope, $state, Auth) {
    this.$state = $state;
    const currentUser = Auth.getCurrentUser();
    this.currentUserId = currentUser && currentUser._id;
    $scope.$watch('vm.business', newVal => {
      this.isRemoveAllowed = this.showRemove && this.isAnotherBusiness();
    });
  }

  goProfile() {
    const profileState = this._profileState();
    if (profileState) {
      this.$state.go(...profileState);
    }
  }

  isAnotherBusiness() {
    return this.business && this.business.userId !== this.currentUserId;
  }

  /**
   * Returns the ui-router state and parameters for the current business.
   */
  _profileState() {
    if (this.business) {
      return this.isAnotherBusiness() ? ['profile', { profileId: this.business._id }] : ['profileEdit'];
    }
  }
}

angular.module('digitalVillageApp')
  .directive('profileSummary', function () {
    return {
      restrict: 'E',
      templateUrl: 'components/profileSummary/profileSummary.html',
      controller: ProfileSummaryCtrl,
      controllerAs: 'vm',
      bindToController: {
        business: '=',
        showRemove: '=',
        remove: '&',
      },
      scope: {}
    };
  });
