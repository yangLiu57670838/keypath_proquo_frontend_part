'use strict';

/**
 * angular directive for ITDB invitee list
 */
class ITDBInviteeListCtrl {

  constructor(itdbService, Business, modalService) {
    this._modalService = modalService;
    this._Business = Business;
    this._ITDB = itdbService;
  }

  removeInvitee(removedInvitee) {
    const confirmationMessage = "Are you sure you want to remove this person?";
    const modalItem = {
      title: 'Cancel Offer',
      confirmCallback: () => this._performDelete(removedInvitee),
      confirmationMessage
    };
    this._modalService.showGenericConfirmModal(null, modalItem);
  }

  _performDelete(removedInvitee) {
    this.invitees = this.invitees.filter(invitee => invitee._id !== removedInvitee._id);
    this._ITDB.removeBusiness({ id: this.itdbId, businessId: removedInvitee._id });
  }
}

angular.module('digitalVillageApp').directive('itdbInviteeList', () => {
  return {
    restrict: 'E',
    templateUrl: 'app/projects/itdb/itdbInviteeList.html',
    controller: ITDBInviteeListCtrl,
    controllerAs: 'vm',
    bindToController: {
      invitees: '=',
      itdbId: '='
    },
    scope: {}
  };
});
