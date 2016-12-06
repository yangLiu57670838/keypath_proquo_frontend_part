'use strict';

const notYetSelectedStatuses = new Set([
  'common.draft',
  'common.rejected-offer',
  'cash.quote-pending',
  'swap.quote-pending',
  'cash.quote-lodged',
  'swap.quote-lodged',
  'cash.quote-accepted',
  'swap.swap-quote-lodged'
]);

const notYetSentStatus = new Set([
  'common.draft',
  'common.rejected-offer'
]);

/**
 * angular directive for rendering single ITDB content on projects page(or any other pages)
 */
class ITDBCtrl {

  constructor(itdbService, Business, appConfig, $state, modalService, Auth) {
    this._$state = $state;
    this._modalService = modalService;
    this.Business = Business;
    this._ITDB = itdbService;
    this.myBusiness = this.Business.mine();
    this.invitees = [];
    this.maximumNumberOfBusinessesPerInvite = appConfig.maximumNumberOfBusinessesPerInvite;
    this.allowedToAddSuppliers = true;
    this.displayItdbInvite = false;

    Auth.getCurrentUser((usr) => {
      if(!this.model){
        return;
      }
      if (usr._id === this.model.userId) {
        this.businessType = "Buyer:";
        this.allowedToAddSuppliers = this.model.currentInvitees.length < this.maximumNumberOfBusinessesPerInvite;
        this.getInviteeBusinesses();
      } else{
        this.businessType = "Supplier:";
        this.getSupplierBusiness();
        this.displayItdbInvite = true;
      }
    });

  }


  getSupplierBusiness() {
    return this.Business.query({ filter: { userId: this.model.userId } }).$promise.then((business) => {
      this.supplierBusiness = business[0];
    });

  }

  getInviteeBusinesses() {
    if (this.model && this.model.currentInvitees) {
      const filter = { _id: { $in: this.model.currentInvitees } };
      return this.Business.query({ filter: filter }).$promise.then((invited) => {
        this.invitees = invited;
      });
    }
  }

  addUsers() {
    this._$state.go("itdb-search", { itdbId: this.model._id, offerItdbFlag: true });
  }

  viewInvitation() {
    this._$state.go("itdbView", { projectId: this.model._id });
    //this._$state.go("createItdbEdit", { projectId: this.model._id, hashId: "0" });
  }

  deleteItdb() {
    const confirmationMessage = "Are you sure you want to cancel the offer and discard all details?";
    const modalItem = {
      title: 'Cancel Offer',
      confirmCallback: () => this._performDelete(),
      confirmationMessage
    };
    this._modalService.showGenericConfirmModal(null, modalItem);
  }

  _performDelete(_, reason) {
    return this._ITDB.delete({ id: this.model._id, reason }).then(() => {
      this.onDelete && this.onDelete({ itdb: this.model });
    });
  }

}

angular.module('digitalVillageApp').directive('invitationToDoBusiness', () => {
  return {
    restrict: 'E',
    templateUrl: 'app/projects/itdb/itdb.html',
    controller: ITDBCtrl,
    controllerAs: 'vm',
    bindToController: {
      model: '=',
      onDelete: '&'
    },
    scope: {}
  };
});
