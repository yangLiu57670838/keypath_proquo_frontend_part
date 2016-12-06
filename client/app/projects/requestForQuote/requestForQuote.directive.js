(function () {
  'use strict';

  const notYetSelectedStatuses = new Set([
    'common.draft',
    'common.rejected-offer',
    'cash.quote-pending',
    'swap.quote-pending',
    'cash.quote-lodged',
    'swap.quote-lodged',
    'cash.quote-accepted',
    'swap.swap-quote-lodged'
  ]);

  const notYetSentStatus = new Set([
    'common.draft',
    'common.rejected-offer',
  ]);

  class RequestForQuoteCtrl {
    constructor($filter, $q, $scope, $state, Business, Project, RequestForQuote, appConfig, modalService) {
      this.$q = $q;
      this._$scope = $scope;
      this.currencyFilter = $filter('currency');
      this.brief = this.model.brief;
      this.myBusiness = Business.mine();
      this._Business = Business;
      this._Project = Project;
      this._RequestForQuote = RequestForQuote;
      this._modalService = modalService;
      this.maximumNumberOfBusinessesPerRequestForQuote = appConfig.maximumNumberOfBusinessesPerRequestForQuote;

      this.candidates = [];
      if (this.initialLoad) {
        this.getCandidateBusinesses();
      }

      $scope.$on('loadProject', (event, payload) => {
        if (payload.projectId == this.model._id) {
          this.getCandidateBusinesses();
        }
      });
      this._$state = $state;
    }

    getCandidateBusinesses() {
      const selectedProject = this.model.projects.find(({ status }) => !notYetSelectedStatuses.has(status));
      const activeProjects = selectedProject ? [selectedProject] : this.model.projects.filter(project => project.brief.supplierId); // ignore supplier-rejected projects
      this.allowedToAddSuppliers = activeProjects.length < this.maximumNumberOfBusinessesPerRequestForQuote && !selectedProject;
      this.nameSpace = selectedProject ? selectedProject.nameSpace : 'cash';

      const queryPromise = activeProjects.length
        ? this._Business.query({ filter: { _id: { $in: activeProjects.map(project => project.brief.supplierId) } } }).$promise
        : this.$q.resolve([]) /* avoid an unnecessary GET */;
      queryPromise.then(candidatesUnordered /* ordering isn't guaranteed to match that of activeProjects */ => {
        this.candidates = activeProjects.map(project => {
          const candidate = candidatesUnordered.find(candidate => candidate._id === project.brief.supplierId);
          candidate.status = project.status;
          candidate.log = project.log;
          candidate.projectId = project._id;
          candidate.depositPayment = project.depositPayment;
          return candidate;
        });

        this.statusDescs = this.candidates
          .map(candidate => {
            const { log: [mostRecentStatusChange], primaryContactAvatarUrl, businessLogoUrl } = candidate;
            return {
              txt: this.statusDescription(candidate),
              date: new Date(mostRecentStatusChange && mostRecentStatusChange.transitionDate || null),
              avatars: { primaryContactAvatarUrl, businessLogoUrl }
            };
          })
          .filter(candidate => candidate.txt)
          .sort((a, b) => b - a);

        this.supplierBusiness = selectedProject && this.candidates[0];  // we know there will only be one candidate in this case

        if (!this.candidates.length) {
          this.projectStatus = 'You need to browse for one supplier to get started.';
        } else {
          const quoteLodgedStatus = ['cash.quote-lodged', 'swap.quote-lodged'];
          const quoteLodged = this.candidates.some(candidate => quoteLodgedStatus.includes(candidate.status));
          this.projectStatus = quoteLodged ? 'Review your selection below.' : 'You are waiting for a response.';
        }
      });
    }

    statusDescription({ status, depositPayment, primaryContactFirstName }) {
      switch (status) {
        case 'cash.quote-lodged':
        case 'swap.quote-lodged':
          return `${primaryContactFirstName} has sent you a new or updated quote. Please review.`;
        case 'swap.swap-quote-lodged':
          return `${primaryContactFirstName} has sent you a new or updated quote. Please review.`;
        case 'swap.deposit-pending':
          if (depositPayment.payerRole === 'buyer') {
            return `You need to accept the Swap Agreement and pay the deposit before you should start work.`;
          } else {
            return `${primaryContactFirstName} needs to accept the Swap Agreement and pay the deposit before you should start work.`;
          }
        case 'cash.deposit-pending':
        case 'cash.quote-accepted':
          return `You need to pay the deposit for ${primaryContactFirstName} to start work.`;
        case 'swap.deposit-paid' :
        case 'cash.deposit-paid' :
          return `Deposit of ${this.currencyFilter(depositPayment.paymentAmount)} has been paid and is currently being processed.`;
        default:
          return null;
      }
    }

    modifyRequestForQuote() {
      this._$state.go('brief', { projectId: this.model._id, proquote: true });
    }

    deleteRequestForQuote() {
      const isSent = this.model.projects.some(({ status }) => !notYetSentStatus.has(status));
      const confirmationMessage = 'Are you sure you want to cancel the project and discard all details?<br>' +
        (isSent
          ? `We'll let the ${ pluralise('supplier', this.model.projects.length) } know you don't want to go ahead with the project.`
          : "Click 'Yes' if you are sure, otherwise 'No' to go back.");
      const modalItem = {
        title: 'Cancel project',
        confirmCallback: () => this._performDelete(),
        confirmationMessage
      };

      if (isSent) {
        this._modalService.showGenericConfirmWithReasonModal(null, modalItem);
      } else {
        this._modalService.showGenericConfirmModal(null, modalItem);
      }

      function pluralise(s, n) { return n === 1 ? s : s + 's'; }
    }

    _performDelete(_, reason) {
      this._RequestForQuote.delete({ id: this.model._id, reason })
        .then(() => this.onDelete && this.onDelete({ requestForQuote: this.model }));
    }

    addUsers(event) {
      if (this.myBusiness.abnVerified) {
        this._$state.go('proquote-search', { proquoteId: this.model._id, offerProquoteFlag: true });
      } else {
        this._modalService.showABNRegisterModal(event, { business: this.myBusiness })
          .then((result) => {

            if (result.abnVerified) {
              this.myBusiness = result;
              this._$state.go('proquote-search', { proquoteId: this.model._id, offerProquoteFlag: true });
            }
          });
      }

    }
  }

  angular.module('digitalVillageApp')
    .directive('requestForQuote', function () {
      return {
        templateUrl: 'app/projects/requestForQuote/requestForQuote.html',
        restrict: 'E',
        controller: RequestForQuoteCtrl,
        controllerAs: 'vm',
        bindToController: {
          model: '=',
          initialLoad: "=",
          onDelete: '&',
        },
        scope: {}
      };
    });
})();
