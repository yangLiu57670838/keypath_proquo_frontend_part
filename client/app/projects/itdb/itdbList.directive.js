'use strict';

/**
 * angular directive for rendering ITDB list on projects page(or any other pages)
 */
class ITDBListCtrl {

  constructor(itdbService, Auth, $state, $location, $document, $timeout) {
    Auth.getCurrentUser(usr => { this.currentUser = usr; });
    this._itdbService = itdbService;
    this.$document = $document;
    this.$timeout = $timeout;
    this.$location = $location;
    this.$state = $state;

    this.pagingOptions = {
      pageLimitPerSection: 5,
      pageSize: 20,
      pageNum: 1,
      currentSectionNum: 1,
      totalRecord: 0
    };

    this.getHash = () => {return this.$location.$$hash};
    this.refresh();
  }

  scrollToPos(skillLabel) {
    const top = 0;
    const duration = 1000;
    this.$document.scrollToElementAnimated(angular.element(document.getElementById(skillLabel)), top, duration);
  }

  reposition(itdbList) {
    this.itdbIdToOpen = this.getHash();
    if (this.itdbIdToOpen) {
      itdbList.forEach((itdb) => {
        if (itdb._id === this.itdbIdToOpen) {
          this.$location.hash("");
          this.$timeout(() => {
            this.scrollToPos(("anchor" + itdb._id));
          });
        }
      });
    }
  }

  changePage(pageNum) {
    this.pagingOptions.pageNum = pageNum;
    this.itdbList = this.query();
  }

  query() {
    const query = {
      pageSize: this.pagingOptions.pageSize,
      pageNum: this.pagingOptions.pageNum,
      filter: JSON.stringify({ status: this.status }),
      fields: ['status', '_id', 'brief.workTitle', 'projects'],
      populateWith: 'projects',
      populateWithFields: ['_id', 'brief.supplierId', 'log', 'nameSpace', 'status', 'depositPayment'],
      sort: 'updatedAt:desc'
    };
    return this._itdbService.query(query, (itdbList, responseHeaders) => {
      this.recordCount = Number(responseHeaders('record-count'));
      this.pagingOptions.totalRecord = this.recordCount;
      this.reposition(itdbList);
    })
  }

  refresh() {
    this.itdbList = this.query();
  }
}

angular.module('digitalVillageApp').directive('itdbList', () => {
  return {
    restrict: 'E',
    templateUrl: 'app/projects/itdb/itdbList.html',
    controller: ITDBListCtrl,
    controllerAs: 'vm',
    bindToController: {},
    scope: {}
  };
});
