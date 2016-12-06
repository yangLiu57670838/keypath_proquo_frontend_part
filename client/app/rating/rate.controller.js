'use strict';

class RateController {
  init($state, $stateParams, params, Review, $mdDialog, Project, currentUser) {
    //injected Services
    this._Review = Review;
    this._Project = Project;
    this._$mdDialog = $mdDialog;
    this._$state = $state;
    this._$stateParams = $stateParams;

    //local variables
    this.project = params.project;
    this.role = undefined;
    this.review = {rating: 0, reviewText: ''};

    if (currentUser) {
      if (currentUser._id == this.project.userId) {
        this.role = 'buyer';
        this.otherPartyName = this.project.brief.supplierName;
        if (this.project.supplierReviewed) {
          // Buyer has already reviewed the supplier. Get the previous review and edit it.
          this.loadMyReview(currentUser);
        }
      } else if (this.project.collaborators.indexOf(currentUser._id) != -1) {
        this.role = 'seller';
        this.otherPartyName = this.project.buyerName;
        if (this.project.buyerReviewed) {
          // Supplier has already reviewed the buyer. Get the previous review and edit it.
          this.loadMyReview(currentUser);
        }
      }
    }
  }

  constructor($state, $stateParams, params, Review, $mdDialog, Project, Auth) {
    Auth.getCurrentUser(user => this.init($state, $stateParams, params, Review, $mdDialog, Project, user));
  }

  loadMyReview(usr) {
    const filter = {
      reviewedProjectId: this.project._id,
      userId: usr._id
    };

    this._Review.query({filter: JSON.stringify(filter)}).$promise.then(reviews => {
      const review = reviews[0];
      this.review.rating = review.rating;
      this.review.reviewText = review.reviewText;
    });

  };

  cancel() {
    this._$mdDialog.hide();
  };

  submit(form) {
    this.submitted = true;
    form.$setSubmitted();
    if (!form.$valid) {
      form.comments.$setTouched();
      this.submitted = false;
    } else {
      if (this.role == 'buyer') {
        this._Project.rateSeller({
          id: this.project._id,
          rating: this.review.rating,
          reviewText: this.review.reviewText
        }).$promise.then(newProject => {
            this._$mdDialog.hide();
            this._$state.go(this._$state.current, this._$stateParams, {reload: true});
          }, err => {
            form.comments.$error = true;
            form.comments.$touched = true;
            this.submitted = false;
            console.log(err);
            console.log(form);
          }
        );
      } else if (this.role == 'seller') {
        this._Project.rateBuyer({
          id: this.project._id,
          rating: this.review.rating,
          reviewText: this.review.reviewText
        }).$promise.then(
          newProject => {
            this._$mdDialog.hide();
            this._$state.go(this._$state.current, this._$stateParams, {reload: true});
          }
        );
      } else {
        this._$mdDialog.hide();
      }
    }
  }
}

angular.module('digitalVillageApp')
  .controller('RateCtrl', RateController);
