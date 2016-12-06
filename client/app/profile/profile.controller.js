'use strict';

class ProfileController {
  constructor($scope,
              $mdDialog,
              $state,
              $stateParams,
              appConfig,
              modalService,
              Business,
              Social,
              Review,
              Auth,
              Project,
              $window,
              ChatService,
              RequestForQuote,
              Toast) {
    //injected services
    this._Social = Social;
    this._$mdDialog = $mdDialog;
    this._Business = Business;
    this._Project = Project;
    this._Auth = Auth;
    this._$state = $state;
    this._$stateParams = $stateParams;
    this._Toast = Toast;
    this._ChatService = ChatService;
    this._$window = $window;
    this._modalService = modalService;
    this._RequestForQuote = RequestForQuote;
    this._$scope = $scope;

    //scope variables
    this.wpid = undefined;
    this.profileId = this._$stateParams.profileId;
    this.ratings = [];
    this.maximumNumberOfBusinessesPerRequestForQuote = appConfig.maximumNumberOfBusinessesPerRequestForQuote;
    this.myProquotes = [];

    this.isLoggedIn = this._Auth.isLoggedIn;

    this.currentPerson = this._Auth.getCurrentUser();
    this.numberOfReviews = 0;

    this.ratings = Review.query({
      filter: {reviewedBusinessId: this._$stateParams.profileId},
      sort: 'updatedAt:desc'
    }, (value, responseHeaders) => {
      this.numberOfReviews = (responseHeaders('record-count'));
    });

    this.myProfile = false;

    if (this._$stateParams.distance && isNaN(this._$stateParams.distance)) {
      this.distanceAway = Math.round(this._$stateParams.distance) + 'Kms away';
    }

    this.geo_options = {
      enableHighAccuracy: true
    };

    this.init();
  }

  init() {
    this._Business.get({id: this._$stateParams.profileId}).$promise.then((result) => {
      this.business = result;
      this.businessUrl = this.business.urls[0];
      this.displayExp = this.generateDisplayExp();
      this.calcDistance();
      // if date has been recorded
      if (this.business.businessEstablished && Date.parse(this.business.businessEstablished)) {
        this.businessEstablished = moment(this.business.businessEstablished).fromNow();
      }
      this.myProfile = this.business.userId === this.currentPerson._id;

      if (!this.myProfile) {
        this.getMyProquotes();
      }
    });
  };

  geo_success(position) {
    navigator.geolocation.clearWatch(this.wpid);
    this._Business.get({
      id: this.business._id,
      fields: 'distance',
      distanceFrom: position.coords.longitude + "|" + position.coords.latitude
    }).$promise.then((result) => {
      if (!isNaN(result.distance)) {
        this.distanceAway = Math.round(result.distance) + 'Kms away';
      } else {
        this.distanceAway = 'Distance not available';
      }
    }, (error) => {
      this.distanceAway = 'Distance not available';
    });
  }

  geo_error() {
    navigator.geolocation.clearWatch(this.wpid);
    this.distanceAway = 'Distance not available';
    this._$scope.$apply();
  }

  getMyProquotes() {
    // We now get all rfq's but only id and name/title of brief and only if in draft or in progress
    return this._RequestForQuote.query({
      filter: JSON.stringify({
        'status': {
          $in: ['draft', 'in-progress']
        }
      }),
      fields: ['status', '_id', 'brief.workTitle', 'projects'],
      populateWith: 'projects',
      populateWithFields: ['_id', 'brief.supplierId']
    }).$promise.then(myProquotes => {
      myProquotes.forEach(proquote => {
        proquote.alreadyAssigned = proquote.projects.find(project => project.brief.supplierId === this.profileId);
      });

      this.myProquotes = myProquotes.filter(proquote => proquote.alreadyAssigned || proquote.projects.length < this.maximumNumberOfBusinessesPerRequestForQuote);
      return this.myProquotes;
    });
  }

  openMenu($mdOpenMenu, ev) {
    $mdOpenMenu(ev);
  }

  assignProject(proquote) {
    proquote.$assignProject({id: proquote._id, sellerIds: this.profileId}).then(rfq => {
      const message = rfq.status === 'in-progress'
        ? 'Your project has been successfully submitted to this user.'
        : 'A draft project has been successfully created for this user.';
      this._Toast.show(message);
      this._$state.go('projects');
    });
  };

  // show the modal for chat
  showChatModal($event) {
    this._ChatService.startChat(this.business.userId);
  };

  calculateAverageRating(ratings) {
    var sumRating = 0;
    ratings.forEach((rating) => sumRating += rating.rating);
    return (sumRating / ratings.length);
  };

  showEnlargedImg($event, item) {
    this._modalService.showEnlargedImg($event, item);
  };


  openBusinessUrlIfLoggedIn($event) {
    if (this.isLoggedIn()) {
      if (this.businessUrl && this.businessUrl.url) {
        this._window.open(this.businessUrl.url);
      }
    } else {
      this._modalService.showLoginModal($event);
    }
  }

  openSocialUrlIfLoggedIn($event, socialUrl) {
    if (this.isLoggedIn()) {
      this._Social.openUrl(socialUrl);
    } else {
      this._modalService.showLoginModal($event);
    }
  }

  calcDistance() {
    if (!this.distanceAway) {

      if ("geolocation" in navigator && this.business && this.business.loc && this.business.loc.coordinates) {
        this.distanceAway = 'Retrieving distance...';
        this.wpid = navigator.geolocation.watchPosition((p) => this.geo_success(p), (p) => this.geo_error(p), this.geo_options);
      } else {
        /* geolocation IS NOT available */
        this.distanceAway = 'Distance not available';
      }
    }
  };

  generateDisplayExp() {
    if (isNaN(this.business.experienceYear)) {
      return 'Not provided';
    } else if (this.business.experienceYear == 1) {
      return this.business.experienceYear + " year";
    } else {
      return this.business.experienceYear + " years";
    }
  }

  editMyRating(rating) {
    // Get the project and load the dialog
    this._Project.get({id: rating.reviewedProjectId}).$promise.then(project => {
      this._modalService.showRatingModal(null, {project: project});

    });
  }
}


angular.module('digitalVillageApp')
  .controller('ProfileCtrl', ProfileController);
