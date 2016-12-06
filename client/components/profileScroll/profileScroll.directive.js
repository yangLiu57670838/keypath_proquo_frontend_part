/**
 * Created by jzhang on 18/07/2016.
 */
'use strict';

/**
 * The on demand loading model as specified on https://material.angularjs.org/latest/api/directive/mdVirtualRepeat
 */
class ProfileScrollModel {
  constructor(options, loadPageFn) {
    this.options = options;
    this.loadPageFn = loadPageFn;
    this.cachedPages = [];
    this.placeHolder = {placeHolder: true};
  }

  setCachedPage(pageNumber, content) {
    this.cachedPages[pageNumber] = content;
  }

  getItemAtIndex(index) {
    if (index == 0 || index >= (this.getLength() - 1)) {
      return this.placeHolder;
    }

    const pageSize = this.options ? this.options.pageSize : 20;
    const pageNumber = Math.floor((index - 1) / pageSize);

    if (this.options && this.options.newSearch) {
      this.cachedPages = [];
      this.options.newSearch = false;
    }

    const page = this.cachedPages[pageNumber];
    if (page) {
      return page[(index - 1) % pageSize];
    } else if (page === null) {
      //Page is marked as loading.
      return null;
    }

    this.cachedPages[pageNumber] = null;
    this.loadPage(pageNumber);

  }

  loadPage(pageNum) {
    this.options.pageNum = pageNum + 1;
    this.loadPageFn().then(result => (this.setCachedPage(pageNum, result)));
  }

  getLength() {
    if (typeof this.options.totalRecord === 'string') {
      return new Number(this.options.totalRecord) + 2;
    }
    return this.options.totalRecord + 2;
  }
}

class profileScrollControl {

  constructor($scope, $mdMedia, ChatService) {
    this.topIndex = 0;
    this.windowSize = 4;
    this._ChatService = ChatService;
    this.selectedLocation = {};

    const mediaWindowSize = [{bp: 'xs', size: 1}, {bp: 'sm', size: 2}, {bp: 'md', size: 3}, {bp: 'gt-md', size: 4}];

    const getMediaWindowSize = () => {
      let result = 4;
      mediaWindowSize.forEach((m) => {
        if ($mdMedia(m.bp)) {
          result = m.size;
        }
      });
      return result;
    };

    $scope.$watch(getMediaWindowSize, (size) => {
      this.windowSize = size
    });

    this.decoratedProfiles = new ProfileScrollModel(this.options, this.loadPageFn);

  }

  lastVisualIndex() {
    return this.decoratedProfiles.getLength() - 1 - this.windowSize;
  }

  onProfileChange() {
    if (this.profiles) {
      this.decoratedProfiles.setCachedPage(this.options.pageNum - 1, this.profiles);
    }
  }

  nextPage() {
    this.topIndex = this.topIndex >= this.lastVisualIndex() ? this.decoratedProfiles.getLength() - 1 : ++this.topIndex;
  }

  prevPage() {
    const lastIndex = this.lastVisualIndex();
    if (this.topIndex > lastIndex) {
      this.topIndex = lastIndex;
    }
    this.topIndex = this.topIndex <= 0 ? 0 : --this.topIndex;
  }

  showChatModal(userId) {
    this._ChatService.startChat(userId);
  }

  range(n) {
    return new Array(n);
  }

  changeSearchOrder() {
    if (this.options.searchOrder && this.options.searchOrder !== 'closest') {
      this.decoratedProfiles = new ProfileScrollModel(this.options, this.decoratedProfiles.loadPageFn);
    }
  }

  changeSelectedLocation() {
    this.options.searchLoc = this.selectedLocation.loc;
    this.decoratedProfiles = new ProfileScrollModel(this.options, this.decoratedProfiles.loadPageFn);
  }
}

angular.module('digitalVillageApp')
  .directive('profileScroll', function () {
    return {
      templateUrl: 'components/profileScroll/profileScroll.html',
      controller: profileScrollControl,
      controllerAs: 'vm',
      restrict: 'EA',
      scope: true,
      bindToController: {
        profiles: '=',
        options: '=',
        loadPageFn: '&'
      }
    };
  });
