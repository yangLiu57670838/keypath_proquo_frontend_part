'use strict';
class ItdbViewController {
  constructor($stateParams, itdbService, Business, Auth, $filter, $location, $state) {

    this.$state = $state;
    this.location = $location;
    this.$filter = $filter;
    this.$stateParams = $stateParams;
    this._itdbService = itdbService;
    this._Business = Business;
    this.offerToRecipient = false;
    Auth.getCurrentUser(usr => {
      this.currentUser = usr;
      this.getItdb();
    });

  }

  getItdb() {
    this._itdbService.get({ id: this.$stateParams.projectId }).$promise.then((itdb) => {
      this.itdb = itdb;
      this.budget = this.itdb.brief.budget;
      this.formatCurrency();
      this.duration = this.setDuration(this.itdb.estimatedDuration);
      if (this.currentUser._id != this.itdb.userId) {
        this.getInstigatorDetails();
        this.mybusiness = this._Business.mine();
      }
    })
  }

  gotoProjectsPage() {
    this.location.url("/projects/" + (this.itdb._id ? "#" + this.itdb._id : ''));
  }

  getInstigatorDetails() {
    this._Business.query({ filter: { userId: this.itdb.userId } }).$promise.then((business) => {
      this.business = business[0];
      this.offerToRecipient = true;
    });
  }

  setDuration(duration) {
    switch (duration) {
      case "< a week" :
        return "Less than a week";
        break;
      case "2 weeks":
        return "In 2 weeks";
        break;
      case "4 weeks":
        return "In 4 weeks";
        break;
      case "2 months":
        return "In 2 months";
        break;
      case "3 months":
        return "About 3 months";
        break;
      case "4 months":
        return "About 4 months";
        break;
      case "5 months":
        return "About 5 months";
        break;
      case "> 6 months":
        return "Greater than 6 months";
      default:
        return "No timespan specified";
    }
  }

  formatCurrency() {
    if (this.budget) {
      //Turn into a string and remove any commas added by our pattern checker and also remove whitespace for good measure
      this.budget = this.budget.toString().replace(/[, ]+/g, "").trim();
      // Ensure number is to 2 decimal places again - with zero ending if needed.
      this.budget = this.$filter('number')(this.budget, 2);
    }
  }

  respondToInvite() {
    if (this.respondInterested) {
      this._itdbService.convertITDB({ id: this.itdb._id, businessId: this.mybusiness._id }).then(()=> {
        this.location.url("/projects/" + (this.itdb._id ? "#" + this.itdb._id : ''));
      });
    } else {
      this._itdbService.removeBusiness({ id: this.itdb._id, businessId: this.mybusiness._id }).then(()=> {
        this.location.url("/projects/" + (this.itdb._id ? "#" + this.itdb._id : ''));
      });
    }
  }
}

angular.module('digitalVillageApp')
  .controller('ItdbViewCtrl', ItdbViewController);
