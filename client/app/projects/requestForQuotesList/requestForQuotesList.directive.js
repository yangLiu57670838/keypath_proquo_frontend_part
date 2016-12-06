'use strict';

class RequestForQuotesList {
  constructor(RequestForQuote, Business) {
    this._RequestForQuote = RequestForQuote;
    this._Business = Business;
    this.pagingOptions = {
      pageLimitPerSection: 5,
      pageSize: 20,
      pageNum: 1,
      currentSectionNum: 1,
      totalRecord: 0,
    };
    this.requestForQuotes = [];
    this.query().then(() => {
      this.listEmptyCallback && this.listEmptyCallback({ listEmpty: !this.recordCount });
    });
  }

  changePage(pageNum) {
    this.pagingOptions.pageNum = pageNum;
    this.query();
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
    return this._RequestForQuote.query(query, (requestForQuotes, responseHeaders) => {
      this.recordCount = Number(responseHeaders('record-count'));
      this.pagingOptions.totalRecord = this.recordCount;
      this.requestForQuotes = requestForQuotes || [];

      if (this.requestForQuotes.length) {
        this.requestForQuotes.forEach(rfq => {

          rfq.validProjects = rfq.projects.filter(project => project.brief.supplierId);
          const lastProject = _.last(rfq.validProjects);
          if (lastProject) {
            const lastSupplierId = lastProject.brief.supplierId;
            this._Business.get({ id: lastSupplierId }).$promise.then(supplier => rfq.lastSupplier = supplier);
          }
        });
      }
    }).$promise;
  }

  rfqDeleted() {
    this.query(); // refresh the list when an RFQ is deleted
  }
}

angular.module('digitalVillageApp')
  .directive('requestForQuotesList', function () {
    return {
      restrict: 'E',
      templateUrl: 'app/projects/requestForQuotesList/requestForQuotesList.html',
      controller: RequestForQuotesList,
      controllerAs: 'vm',
      bindToController: {
        status: '=',
        listEmptyCallback: '&', // called with `true` if the list is empty, `false` if not empty
      },
      scope: {}
    };
  });
