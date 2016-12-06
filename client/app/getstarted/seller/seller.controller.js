'use strict';

class GetStartedSellerCtrl {

  constructor($scope, $document, Business, Auth, $state, SkillSearchService) {
    this.businessService = Business;
    this._SkillSearchService = SkillSearchService;
    this._$scope = $scope;
    this.$document = $document;

    this._$document = $document;
    this.hideSearchResults = true;
    this.offeredSkills = [];
    this.requiredSkills = [];
    this.$state = $state;

    const mapToCategoryModel = (entity) => ({
      _id: entity.refId,
      name: entity.name,
      parentCategory: entity.parentCategory
    });

    this.profileFormValid = false;
    this.saveInProgress = false;
    this.businessService.mine().$promise
      .then(myBusiness => {
        this.business = myBusiness;
        this.offeredSkills = this.business.offers.map(mapToCategoryModel);
        this.requiredSkills = this.business.needs.map(mapToCategoryModel);
      }, () => {
        $state.go('home');
      });

    Auth.getCurrentUser().$promise.then(({ _id, firstName }) => {
      this.currentUserId = _id;
    });

    this.searchOptions = {
      pageSize: 20,
      pageNum: 1,
      searchOrder: "skills",
      sortOptions: [{ name: 'Please select an order', value: 'skills' }, {
        name: 'Newest',
        value: 'newest'
      }, { name: 'Highest Rated', value: 'rating' }, { name: 'Closest to', value: 'closest' }]
    };

    this.bindGotoTopButtonBackgroundColorPainter();
  }

  scrollToPos(skillLabel) {
    const top = 0;
    const duration = 1000;
    this.$document.scrollToElementAnimated(angular.element(document.getElementById(skillLabel)), top, duration);
  }

  // Check the profile form from directive and skills selection valid
  shouldSaveButtonDisabled() {
    return this.offeredSkills.length == 0 || this.business.acceptsSwaps && this.requiredSkills.length == 0;
  }

  saveAll() {
    this.save(true);
  }

  save(redirect) {
    if (!this.business || !this.business.abn || !this.business.name) {
      this.scrollToPos("profile-service-selection");
      return;
    }
    this.saveInProgress = true;
    const mapToBusinessModel = (entity) => ({
      name: entity.name,
      refId: entity._id,
      parentCategory: entity.parentCategory
    });

    this.business.needs = this.requiredSkills.map(mapToBusinessModel);
    this.business.offers = this.offeredSkills.map(mapToBusinessModel);

    this.businessService.update(this.business._id, this.business).$promise.then((result) => {
      this.business = result;
      this.saveInProgress = false;
      if (redirect) {
        this.$state.go('profileEdit');
      }
    }, () => {
      //console.log("ERROR ERROR ERROR");
    });

  }

  findMatch() {
    if (!this.business || !this.business.abn || !this.business.name) {
      this.scrollToPos("profile-service-selection");
      return;
    }
    this.hideSearchResults = false;
    this.save(false);
    this.search(true);
  }

  search(newSearch) {
    this.searchOptions.searchType = "skillsRequired";
    this.searchOptions.newSearch = newSearch;
    this.searchOptions.requiredCategories = this.offeredSkills;
    this.searchOptions.requiredCategoryIds = this.offeredSkills.map((category) => category._id);
    this.searchOptions.offeredCategories = [];
    this.searchOptions.offeredCategoryIds = [];

    if (this.business.acceptsSwaps) {
      this.searchOptions.searchType = "skillsOfferedAndRequired";
      this.searchOptions.offeredCategories = this.requiredSkills;
      this.searchOptions.offeredCategoryIds = this.requiredSkills.map((category) => category._id);
    }

    this.searchOptions.excludeUserId = this.currentUserId;

    return this._SkillSearchService.searchBusiness(this.searchOptions, totalRecord => (this.searchOptions.totalRecord = totalRecord));
  }

  changePage() {
    return this.search(false);
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
  .controller('GetStartedSellerCtrl', GetStartedSellerCtrl);
