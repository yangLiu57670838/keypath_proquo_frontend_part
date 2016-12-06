'use strict';

class PaginatorCtrl {
  constructor($scope) {
    $scope.$watchGroup(['pg.options.totalRecord', 'pg.options.pageNum'], () => this.init());
  }

  init() {
    this.compactView = false;
    this.totalPages = this.getTotalPages();
    //re-calculate following variables for every init
    this.totalSections = this.getTotalSections();
    this.currentSectionNum = this.getCurrentSectionNum();
    this.pagesInCurrentSection = this.getPagesInCurrentSection();
  }

  getTotalPages() {
    return Math.ceil(this.options.totalRecord / this.options.pageSize);
  }

  getTotalSections() {
    return Math.ceil(this.totalPages / this.options.pageLimitPerSection);
  }

  getCurrentSectionNum() {
    return 1 + Math.floor((this.options.pageNum - 1) / this.options.pageLimitPerSection);
  }

  getPagesInCurrentSection() {
    const firstPage = this.options.pageLimitPerSection * (this.currentSectionNum - 1)+1;
    const lastPage = Math.min(this.totalPages, this.options.pageLimitPerSection * this.currentSectionNum);
    return _.range(firstPage, lastPage+1);
  }

  gotoSection(sectionNum, pre) {
    this.currentSectionNum = sectionNum;
    this.pagesInCurrentSection = this.getPagesInCurrentSection();
    if (pre) {
      this.gotoPage(this.pagesInCurrentSection[this.pagesInCurrentSection.length - 1]);
    } else {
      this.gotoPage(this.pagesInCurrentSection[0]);
    }
  }

  gotoPage(pageNum) {
    this.options.pageNum = pageNum;
    this.gotoPageCallback({ pageNum });
  }
}

angular.module('digitalVillageApp')
  .directive('paginator', function () {
    return {
      templateUrl: 'components/paginator/paginator.html',
      restrict: 'EA',
      controller: PaginatorCtrl,
      controllerAs: 'pg',
      scope: true,
      bindToController: {
        gotoPageCallback: '&',
        options: '='
      }
    };
  });
