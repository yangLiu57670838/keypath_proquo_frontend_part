'use strict';

class GetStartedBuyerCtrl {
  constructor($scope, $document, Auth, Business, myBusiness, SkillSearchService) {
    this._Business = Business;
    this._myBusinessId = myBusiness._id;
    this._SkillSearchService = SkillSearchService;
    this._$document = $document;
    this._$scope = $scope;

    this.selectedSkills = myBusiness.needs.map(need => ({
      _id: need.refId,
      name: need.name,
      parentCategory: need.parentCategory
    }));
    this.hideSearchResults = true;
    this.saveInProgress = false;

    this.searchOptions = {
      pageSize: 20,
      pageNum: 1,
      searchType: "skillsOffered",
      searchOrder: "skills",
      sortOptions: [{name: 'Please select an order', value: 'skills'}, {
        name: 'Newest',
        value: 'newest'
      }, {name: 'Highest Rated', value: 'rating'}, {name: 'Closest to', value: 'closest'}]
    };

    Auth.getCurrentUser().$promise.then(({ _id, firstName }) => {
      this.firstName = firstName;
      this.currentUserId = _id;
    });

    $scope.$watchCollection('vm.selectedSkills', () => {
      this.hideSearchResults = true;
    });

    this.bindGotoTopButtonBackgroundColorPainter();
  }

  saveProfile() {
    this.saveInProgress = true;
    const needs = this.selectedSkills.map(category => ({
      name: category.name,
      refId: category._id,
      parentCategory: category.parentCategory
    }));
    this._Business.update({
      id: this._myBusinessId,
      needs
    }).$promise.then(()=>this.saveInProgress = false, () => this.saveInProgress = false);
  }

  saveProfileAndSearch() {
    this.searchOptions.newSearch = true;
    this.hideSearchResults = false;
    this.saveProfile();
    this.search();
  }

  search() {
    this.searchOptions.offeredCategories = this.selectedSkills;
    this.searchOptions.offeredCategoryIds = this.selectedSkills.map((category) => category._id);
    this.searchOptions.excludeUserId = this.currentUserId;
    return this._SkillSearchService.searchBusiness(this.searchOptions, totalRecord => (this.searchOptions.totalRecord = totalRecord));
  }

  changePage() {
    return this.search();
  }

  gotoTop() {
    const top = 100;
    const duration = 1000;
    const top_element = document.getElementById('getstarted');
    this._$document.scrollToElementAnimated(top_element, top, duration);
  }

  bindGotoTopButtonBackgroundColorPainter() {
    this.buttonWrapperElement = angular.element(('.back-to-top-wrapper'))[0];
    this.profileResultWrapperElement = this.buttonWrapperElement.previousElementSibling;
    this._$scope.$watch(
      () => {
        return $(this.profileResultWrapperElement).height();
      },
      (height) => {
        if (height > 0 && $(this.buttonWrapperElement).height() > 0) {
          const siblingsBackgroundColor = $(this.profileResultWrapperElement).css('background-color');
          $(this.buttonWrapperElement).css('background-color', siblingsBackgroundColor);
        }
      });
  }
}

angular.module('digitalVillageApp')
  .controller('GetStartedBuyerCtrl', GetStartedBuyerCtrl);
