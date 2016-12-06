'use strict';

/**
 * browseCache object structure
 * {
 *  browseFilter: {
 *    searchType : String,
 *    selectedCategories : Array,
 *    searchKeywords : Array
 *  },
 *  browseOrder: {
 *    orderType : String,
 *    selectedLocation : String
 *  },
 *  pageNum : Number
 */
class SkillSearchController {
  constructor($rootScope, Business, $location, $anchorScroll, $cacheFactory, ChatService, SkillSearchService, currentUser, RequestForQuote, Project, $state, itdbService, Toast ) {
    //injected Services
    this.$state = $state;
    this.profileIdsAssigned=[];
    this.chosenAssignees = [];
    this.Toast = Toast;

    if(this.$state.params.offerProquoteFlag){
      this.offerProquoteFlag = this.$state.params.offerProquoteFlag === "true";
      this.proquoteId = this.$state.params.proquoteId;
    } else if(this.$state.params.offerItdbFlag){
      this.offerItdbFlag = this.$state.params.offerItdbFlag === "true";
      this.itdbId = this.$state.params.itdbId;
    }

    this.totalAssigneesAllowed = 5;
    this.numAssigneesAllowed = this.totalAssigneesAllowed;
    this.numberAssigned = this.totalAssigneesAllowed;

    this._itdbService = itdbService;
    this._RequestForQuote = RequestForQuote;
    this._Project = Project;
    this._Business = Business;
    this._ChatService = ChatService;
    this._Location = $location;
    this._AnchorScroll = $anchorScroll;
    this._SkillSearchService = SkillSearchService;

    //local variables
    this.currentUser = currentUser;
    this.currentUserBusiness = undefined;
    this.categorySelectorOptions = undefined;
    this.cache = ($cacheFactory.get('villageAppCache') ? $cacheFactory.get('villageAppCache') : $cacheFactory('villageAppCache'));
    this.filteredResults = [];
    this.selectedCategories = [];
    this.showSearchOrderLocation = false;
    this.searchKeywords = [];
    this.searchType = this._Location.search()['searchType'] ? this._Location.search()['searchType'] : 'skillsOffered';
    this.searchOrder = this._Location.search()['searchOrder'] ? this._Location.search()['searchOrder'] : 'skills';
    this.reverseOrder = false; // default ordering is ascending; when ordering by rating we need descending
    this.selectedLocation = {};

    this.previousState = $rootScope.previousState;
    this.previousParams = $rootScope.previousParams;

    this.categorySelectorOptions = {
      searchView: "treecollapse",
      skilltype: this.searchType,
      selectLimit: 1,
      cacheEnabled: true
    };

    this.recordCount = 0;
    this.pageSize = 20;
    this.pageLimitPerSection = 5;

    //browse page search criteria cache
    this.browseCache = this.cache.get('browseCache');
    if (this.browseCache && this.previousState.name === 'profile') {
      this.initializeFromCache(this.browseCache);
    } else {
      this.browseCache = this.createNewCache();
      this.cache.put('browseCache', this.browseCache);
    }

    //skillSearchOptions cache is for category selector directive
    this.searchOptions = {
      selectedCategories: this.selectedCategories
    };
    this.cache.put('skillSearchOptions', this.searchOptions);

    //paginator directive config
    this.pagingOptions = {
      pageLimitPerSection: this.pageLimitPerSection,
      pageSize: this.pageSize,
      pageNum: this.pageNum,
      totalRecord: this.recordCount
    };
    this.loadCurrentUserBusiness();

    if(this.offerProquoteFlag){
      this.getProquote();
    }else if(this.offerItdbFlag){
      this.getItdb();
    }

  }

  /**
   *
   * @returns {{browseFilter: {}, browseOrder: {}}}
   */
  createNewCache() {
    let browseCache = {browseFilter: {}, browseOrder: {}};
    browseCache.browseFilter.searchType = this.searchType;
    browseCache.browseFilter.selectedCategories = this.selectedCategories;
    browseCache.browseFilter.searchText = this.searchText;
    browseCache.browseOrder.orderType = this.searchOrder;
    browseCache.browseOrder.reverseOrder = this.reverseOrder;
    browseCache.browseOrder.selectedLocation = {};
    this.pageNum = 1;
    browseCache.pageNum = this.pageNum;
    return browseCache;
  }

  /**
   * initialize browse page search criteria from cache object
   * @param browseCache
   */
  initializeFromCache(browseCache) {
    this.searchType = browseCache.browseFilter.searchType;
    this.selectedCategories = browseCache.browseFilter.selectedCategories;
    this.searchText = browseCache.browseFilter.searchText;
    this.searchOrder = browseCache.browseOrder.orderType;
    this.reverseOrder = browseCache.browseOrder.reverseOrder;
    this.selectedLocation = browseCache.browseOrder.selectedLocation;
    this.pageNum = browseCache.pageNum;
    if (this.searchOrder == "closest") {
      this.showSearchOrderLocation = true;
    }
  }

  searchByDistance() {
    if (this.selectedLocation && this.selectedLocation.loc) {
      this.browseCache.browseOrder.selectedLocation = this.selectedLocation;
      this.resetPage();
      this.searchBusiness();
    }
  };

  showChatModal(business) {
    this._ChatService.startChat(business.userId);
  }

  resetPage() {
    this.pagingOptions.pageNum = 1;
    this.browseCache.pageNum = 1;
  }

  //this is the paginator callback method
  changePage() {
    this.browseCache.pageNum = this.pagingOptions.pageNum;
    this.searchBusiness();
  }

  changeSearchOrder(searchOrder) {
    this.searchOrder = searchOrder;
    this.browseCache.browseOrder.orderType = this.searchOrder;

    if (this.searchOrder != "closest") {
      this.showSearchOrderLocation = false;
      this.selectedLocation = undefined;
      this.resetPage();
      this.searchBusiness();
    } else {
      this.showSearchOrderLocation = true;
      this.selectedLocation = {};
      if (navigator && navigator.geolocation) {
        this.showMyLocationTrigger = true;
      } else {
        this.showMyLocationTrigger = false;
      }
    }
  }

  changeSearchType() {
    this.resetPage();
    this.categorySelectorOptions.searchType = this.searchType;
    this.browseCache.browseFilter.searchType = this.searchType;
    this.searchText = "";
    this.searchBusiness();
  }

  searchTextChange(searchText) {
    this.resetPage();
    this.searchText = searchText;
    this.browseCache.browseFilter.searchText = this.searchText;
    this.searchBusiness();
  }

  selectCategories(categories) {
    this.selectedCategories = categories;
    this.browseCache.browseFilter.selectedCategories = this.selectedCategories;
    this.searchOptions.selectedCategories = this.selectedCategories;
    this.searchBusiness();
  }

  searchBusiness(initLoad) {
    const searchOptions = {
      searchOrder: this.searchOrder,
      searchType: this.searchType,
      searchLoc: this.selectedLocation ? this.selectedLocation.loc : undefined,
      offeredCategoryIds: this.searchType == 'skillsOffered' ? this.selectedCategories.map((category) => (category._id)) : [],
      requiredCategoryIds: this.searchType == 'skillsRequired' ? this.selectedCategories.map((category) => (category._id)) : [],
      searchText: this.searchText,
      pageLimitPerSection: this.pageLimitPerSection,
      pageSize: this.pagingOptions.pageSize,
      pageNum: this.pagingOptions.pageNum,
      totalRecord: this.pagingOptions.recordCount,
      excludeUserId: this.currentUser ? this.currentUser._id : null
    };

    this._SkillSearchService.searchBusiness(searchOptions, totalRecord => {
      this.recordCount = totalRecord;
      this.pagingOptions.totalRecord = totalRecord;
    }).then(result => {
      this.filteredResults = result;

      if (this.offerItdbFlag || this.offerProquoteFlag) {
        this.filteredResults.forEach((obj) => {
         obj.chosen = this.checkAssigned(obj._id);
        });
      }
      if (initLoad) {
        //if this was not a fresh load; do not reposition
        this.reposition();
      }
    });
  }

  getCurrentLocation(event) {
    this.locationSearching = true;
    if (navigator && navigator.geolocation) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (location) => {
            this.selectedLocation.loc = {
              type: "Point",
              coordinates: [location.coords.longitude, location.coords.latitude]
            };
            this.showSelectedLocation("Your current location")
          },
          (error) => {
            this.showSelectedLocation("", "cannot find current location information")
          },
          {timeout: 3000}
        );
      } else {
        this.showSelectedLocation("", "cannot find current location information")
      }
    }
  }

  getMyBusinessLocation() {
    this.selectedLocation.loc = this.myBusiness.loc;
    this.selectedLocation.formattedAddress = this.myBusiness.formattedAddress;
  }

  reposition() {
    if (this.browseCache && this.previousState.name === 'profile') {
      const profileId = this.previousParams.profileId;
      const newHash = 'anchor' + profileId;
      if (this._Location.hash() !== newHash) {
        this._Location.hash(newHash);
      } else {
        this._AnchorScroll();
      }
    }
  }

  loadCurrentUserBusiness() {
    if (this.currentUser && this.currentUser._id) {
      this._Business.mine().$promise.then((result) => {
          this.currentUserBusiness = result[0];
          this.searchBusiness(true);
        })
        .catch(err => {
          this.errors = err.message;
        });
    } else {
      this.searchBusiness(true);
    }
  }

  getItdb(){
    // get ITDB and retrieve list of ids
    const query = {
      filter: JSON.stringify({_id: this.itdbId}),
      fields: ['status','_id','projects'],
      populateWith: 'projects',
      populateWithFields: ['_id', 'collaborators']
    };

    this._itdbService.query(query).$promise.then( itdb => {
      this.profileIdsAssigned = itdb[0].currentInvitees;
      this.numAssigneesAllowed = this.numAssigneesAllowed - this.profileIdsAssigned.length;
      this.setAssignedNumber();
    }, (error) => {console.log("error");});
  }

  /* Find and add proquote users */
  getProquote() {
    const query = {
      filter: JSON.stringify({_id: this.proquoteId}),
      fields: ['status','_id','projects'],
      populateWith: 'projects',
      populateWithFields: ['_id', 'collaborators', 'brief.supplierId']
    };

    // retrieve list of ids from proquote projects and extract the ids of users, flatten, and remove null values
    this._RequestForQuote.query(query).$promise.then( proquote => {
      this.setAlreadyAssigned(proquote);
      this.numAssigneesAllowed = this.numAssigneesAllowed - this.profileIdsAssigned.length;
      this.setAssignedNumber();
    }, (error) => {
      // the user messed the URL, send them back to projects page
      this.$state.go("projects");
    });
  }

  setAlreadyAssigned(proquote) {
    const validProjects = proquote[0].projects.filter(project => project.brief.supplierId);
    this.profileIdsAssigned = validProjects.map(project => project.brief.supplierId);
  }

  assignToggle(obj) {
    if((this.offerProquoteFlag || this.offerItdbFlag)  && !this.checkPreviouslyAssigned(obj._id) ){
     (!obj.chosen && this.chosenAssignees.length < this.numAssigneesAllowed)
       ? (this.chosenAssignees.push(obj),obj.chosen = true)
       : this.removeAssigned(obj);
    }
    this.setAssignedNumber();
  }

  checkAssigned(id) {
    if(this.offerItdbFlag || this.offerProquoteFlag) {
      return this.profileIdsAssigned.includes(id) || (this.chosenAssignees.findIndex((obj) => {return obj._id === id}) >= 0);
    }
  }

  checkPreviouslyAssigned(id){
    return this.profileIdsAssigned.includes(id);
  }

  setAssignedNumber() {
    this.numberAssigned = this.numAssigneesAllowed - this.chosenAssignees.length;
  }

  removeAssigned(obj) {
    this.chosenAssignees = this.chosenAssignees.filter( (assigned) => {return assigned._id != obj._id });
    obj.chosen = false;
    this.setAssignedNumber();
  }

  saveAssigned() {
    let query = this.chosenAssignees.map((assigneed) => assigneed._id).join(",");
    if(this.offerItdbFlag){
      this._itdbService.addBusinesses({id: this.itdbId, businessIds: query }).then( (res) => {
        this.showConfirmation("Great. Your offer has been sent!");
        this.$state.go("projects");
      });
    } else {
      this._RequestForQuote.assignProject({id: this.proquoteId, sellerIds: query }).$promise.then( (res) => {
        this.showConfirmation("Great. Your brief has been sent!");
        this.$state.go("projects");
      });
    }

  }

  showConfirmation(message){
    this.Toast.show(message);
  }
}
angular.module('digitalVillageApp')
  .controller('SkillSearchController', SkillSearchController);
