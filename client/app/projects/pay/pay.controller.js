'use strict';

class PayController {
  constructor ($document, $scope, $state, $stateParams, Auth, Project, paymentSession, ChatService, PP_SCRIPT_URL, $timeout) {
    this.projectId = $stateParams.projectId;
    this.processing = false;
    this.actionRef = $state.current.data.actionRef;
    this.user = Auth.getCurrentUser();
    this.ChatService = ChatService;
    this.projectStatus = undefined;

    if (paymentSession.token) {
      this.sessionId = paymentSession.token;
    }

    if (this.projectId) {
      Project.get({id: this.projectId}).$promise.then(project => {
        if (project) {
          this.project = project;
          this.paymentModel = project[$state.current.data.paymentModelName];

          this.projectStatus = project.status.substring(project.status.indexOf('.')+1);

          if (this.paymentModel.payerId == this.user._id) {
            this.isBuyer=true;
          } else {
            this.isSeller=true;
          }

          this.project.creditorName = this.project.debtorRole === 'buyer' ? this.project.brief.supplierName : this.project.buyerName;

          const [higherQuoteProject, lowerQuoteProject] = this.project.debtorRole === 'buyer' ? [this.project, this.project.swapProject] : [this.project.swapProject, this.project];

          if (higherQuoteProject) {
            this.project.higherQuoteUser = higherQuoteProject.brief.supplierName;
            this.project.higherQuoteAmount = higherQuoteProject.quote.fee + higherQuoteProject.quote.gst;
          }

          if (lowerQuoteProject) {
            this.project.lowerQuoteUser = lowerQuoteProject.brief.supplierName;
            this.project.lowerQuoteAmount = lowerQuoteProject.quote.fee + lowerQuoteProject.quote.gst;
          }
        }
      });
    }

    $scope.$on('pp-close-popup', (event, data) => {
      // Set a local var to temporarily hide the pay button until close event verifies state
      this.processing = true;

      $scope.$apply(); // Without this $apply the flag doesn't get applied visually properly

      const waitTime = 5000;

      // Wait in case user has clicked close before finishing payment processing, also extra guard against a race against
      // the PromisePay server's POST /api/payments/items/:uuid callback.
      $timeout(() => { // Initial 5 seconds wait before inoking action
        Project.invokeAction({ id: this.projectId, action: this.actionRef }).$promise.then(
          success => {
            this.project.status = success.status;
            $state.go('projects', {projectId: this.projectId});
          },
          failed => {
            if (failed && failed.status === 403) {
              // the failure occurred because the project has already been actioned via the PromisePay server-side callback: we don't need to do anything more
              $state.go('projects', {projectId: this.projectId});
            } else {
              // Wait a bit before reloading page to ensure all promise pay processing is out of the way before reloading page.
              $timeout(() => $state.reload(), waitTime); // If action fails we wait for 5 seconds again before reloading
            }
          }
        );
      }, waitTime);
    });

    const document = $document[0];
    let tag = document.createElement('script');
    tag.id = 'promisepay-integration';
    tag.src = PP_SCRIPT_URL;
    tag.type = 'text/javascript';
    let ppScript = angular.element(document.querySelector('#pp-script'));
    ppScript.replaceWith(tag);
  }

  showChatModal(ev){
    let otherUserId = _.find(this.project.collaborators, (collaboratorId) => {
      return this.user._id != collaboratorId;
    });
    if(!otherUserId){
      //for creating brief, get other user id from other party
      otherUserId = this.otherParty.userId;
    }
    this.ChatService.startChat(otherUserId);
  }
}

angular.module('digitalVillageApp')
  .controller('PayCtrl', PayController);
