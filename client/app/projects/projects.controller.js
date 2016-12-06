'use strict';

class ProjectsController {
  constructor($q, $scope, Project, RequestForQuote, currentUser, modalService, itdbService) {
    this.modalService = modalService;

    this.isPendingSectionNonEmpty = 2;  // rfqs non-empty + projects non-empty

    const initiatorPendingProjectStates = [
      'cash.quote-accepted'
      , 'cash.deposit-pending'
      , 'cash.deposit-paid'
      , 'swap.swap-quote-lodged'
      , 'swap.deposit-pending'
      , 'swap.deposit-paid'
    ];

    const reciprocatorPendingProjectStates = [
      'common.draft'
      , 'cash.quote-pending'
      , 'cash.quote-lodged'
      , 'cash.quote-accepted'
      , 'cash.deposit-pending'
      , 'cash.deposit-paid'
      , 'swap.quote-pending'
      , 'swap.quote-lodged'
      , 'swap.swap-quote-lodged'
      , 'swap.deposit-pending'
      , 'swap.deposit-paid'
    ];

    this.pendingProjectFilter = {
      $or: [
        {
          status: { $in: reciprocatorPendingProjectStates },
          userId: { $ne: currentUser._id } // buyer projects are shown in requestForQuotesList
        },
        {
          status: { $in: initiatorPendingProjectStates },
          userId: { $eq: currentUser._id }
        }
      ]
    };

    this.projectGuideSteps =
      [{
        phase: "Getting Started",
        steps: [
          { step: 1, description: "Search for someone that meets your requirements" },
          { step: 2, description: "Start a conversation" },
          { step: 3, description: "Decide to send a brief" }
        ]
      },
        {
          phase: "Pending Projects",
          steps: [
            { step: 4, description: "Work out your needs (Compose a brief)" },
            { step: 5, description: "Decide on Swapping or Paying" },
            { step: 6, description: "Quote" }
          ]
        },
        {
          phase: "Current Projects",
          steps: [
            { step: 7, description: "Arrive at agreement" },
            { step: 8, description: "Complete and pay" },
            { step: 9, description: "Rate and Review" }
          ]
        }
      ]
    ;

    const currentProjectStates = [
      'cash.in-progress'
      , 'swap.in-progress'
      , 'cash.final-payment-pending'
      , 'cash.final-payment-paid'
      , 'swap.final-payment-pending'
      , 'swap.final-payment-paid'
      , 'cash.in-dispute'
      , 'swap.final-payment-pending'
      , 'swap.final-payment-paid'
    ];
    this.currentProjectFilter = {
      $or: [
        { status: { $in: currentProjectStates } },
        { status: 'common.rating-review-pending', supplierReviewed: false, userId: currentUser._id },
        { status: 'common.rating-review-pending', buyerReviewed: false, userId: { $ne: currentUser._id } }
      ]
    };

    const completedProjectStates = [
      'common.complete',
    ];
    this.completedProjectFilter = {
      $or: [
        { status: { $in: completedProjectStates } },
        { status: 'common.rating-review-pending', supplierReviewed: true, userId: currentUser._id },
        { status: 'common.rating-review-pending', buyerReviewed: true, userId: { $ne: currentUser._id } }
      ]
    };

    $q.all([
      RequestForQuote.query().$promise,
      Project.query().$promise,
      itdbService.query().$promise
    ]).then(([rfqs, projects, invites]) => {
      this.noProjectsOrInvites = !rfqs.length && !projects.length && !invites.length;
    });

    $scope.$on('collapsibleCardChanged', (event, eventData) => {
      if (eventData.showDetails) {
        $scope.$broadcast('loadProject', { projectId: eventData.cardId });
      }
    });
  }

  pendingSectionEmpty(empty, entityName) {
    this.isPendingSectionNonEmpty -= empty; // count down to avoid the 'no projects' message while we're loading
  }

  showFeedbackModal() {
    this.modalService.showFeedbackModal();
  }
}

angular.module('digitalVillageApp')
  .controller('ProjectsCtrl', ProjectsController);
