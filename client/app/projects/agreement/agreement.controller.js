'use strict';

class AgreementController {
  constructor($state, $stateParams, Auth, Business, ChatService, Project, User, Toast) {
    this.$state = $state;
    this._Business = Business;
    this.ChatService = ChatService;
    this._Project = Project;
    this._User = User;
    this.Toast = Toast;
    this.projectId = $stateParams.projectId;
    this.project = undefined;

    this.myBusiness = this._Business.mine();
    this.swapService = false;
    this.processing = false;
    this.paymentStatus = undefined;
    this.isPayer = false;
    this.swapStatusHeading = undefined;
    this.sellerSwapAgreed = false;
    this.depositToBePaid = undefined;
    this.depositPaidDate = undefined;
    this.showPendingCashEditBtn = false;

    Auth.isLoggedIn(isLoggedIn => {
      if (!isLoggedIn || !this.projectId) return;

      this.me = Auth.getCurrentUser();
      this._Project.get({id: this.projectId}).$promise.then(project => {
        if (!project) throw 'no project';

        this.project = project;
        this.isSeller = this.project.userId !== this.me._id;
        if (this.isSeller) {
          this._Business.query({ filter: { userId: this.project.userId } }).$promise
            .then(([otherBusiness]) => { this.otherBusiness = otherBusiness; });
        } else {
          this.otherBusiness = this._Business.get({ id: this.project.brief.supplierId });
        }
        this.buyerSideDueDateHint = this.calculateDueDateHint(this.project.brief.dueDate);
        if(this.project.nameSpace === 'swap' && this.project.swapProject.brief.dueDate){
          this.sellerSideDueDateHint = this.calculateDueDateHint(this.project.swapProject.brief.dueDate);
        }

        const projectStatus = this.project.status;
        const pendingStates = ['cash.quote-accepted','cash.deposit-pending','swap.deposit-pending', 'swap.swap-quote-lodged'];
        const invalidStates = ['common.draft','cash.quote-lodged','cash.quote-pending'];
        if (this.project.status === 'swap.deposit-pending') {
          this.swapStatusHeading = "Accepted";
        } else if (['swap.deposit-paid', 'swap.in-progress', 'swap.final-payment-pending',
            'common.rating-review-pending', 'common.complete'].includes(this.project.status)) {
          this.swapStatusHeading = "Deposit paid";
        }
        if (invalidStates.includes(projectStatus)) {
          return this.$state.go('projects');
        }

        this.paymentStatus = pendingStates.includes(projectStatus) ? 'pending' : 'paid';
        this.showPendingCashEditBtn = this.paymentStatus === 'pending' && this.project.status !='cash.deposit-pending';
        const depositPayment = project.depositPayment;
        this.depositToBePaid = this.project.nameSpace === 'swap' ? depositPayment.paymentAmount : (this.project.quote.fee + this.project.quote.gst)/2;
        this.isPayer = depositPayment && depositPayment.paymentAmount > 0 && depositPayment.payerId == this.me._id;
        if (this.paymentStatus === 'paid') {
          const inProgressTransition = this.project.log.find(({ toState }) => ['cash.in-progress', 'swap.in-progress'].includes(toState));
          this.depositPaidDate = inProgressTransition && inProgressTransition.transitionDate;
        }
      }, (error) => {
        this.$state.go('projects');
      });
    });
  }

  /**
   * buyer accepts agreement for cash project
   */
  acceptPayAgreement() {
    // If cash or if requires payment it will call the relevant action. For swap it may require user to confirm then take to proejcts screen
    if (this.project.status==='cash.quote-accepted') {
      this.processing=true;
      this._Project.acceptAgreement({id: this.projectId}).$promise.then((result) => {
        this.$state.go('pay', {projectId: this.projectId});
      });
    }else{
      this.$state.go('pay', {projectId: this.projectId});
    }
  }

  /**
   * supplier accepts agreement for swap project
   */
  sellerAcceptSwapAgreement(){
    //ng-if="(vm.isSeller && vm.project.depositPayment.payerRole === 'supplier') || (!vm.isSeller && vm.project.depositPayment.payerRole === 'buyer') && vm.project.status === 'swap.swap-quote-lodged'"
    if (this.project.status==='swap.swap-quote-lodged') {
      this.processing=true;
      this._Project.supplierAcceptAgreement({id: this.projectId}).$promise
        .then(({ status }) => {
          if (status == 'swap.in-progress' || !this.isPayer) {
            this.$state.go('projects');
          } else {
            this.$state.go('pay', {projectId: this.projectId});
          }
        })
        .catch(error => {
          this.processing = false;
          this.Toast.show('An error occurred while accepting this agreement');
        });
    }
  }

  /**
   * buyer click pay and go to pay deposit page
   */
  buyerAcceptSwapAgreement() {
    this.$state.go('pay', {projectId: this.projectId});
  }

  calculateDueDateHint(dueDate) {
    const remaining = moment(dueDate).diff(moment().startOf('day'));
    return moment.duration(remaining).humanize() + ' ' + (remaining >= 0 ? 'remaining' : 'overdue');
  }

  showChatModal() {
    const otherUserId = _.find(this.project.collaborators, collaboratorId => this.me._id != collaboratorId);
    this.ChatService.startChat(otherUserId);
  }

  close() {
    this.$state.go('projects', {projectId: this.project._id});
  }

  viewBrief() {
    this.$state.go("brief",{"projectId":this.project._id});
  }

  viewQuote() {
    this.$state.go("quote",{"projectId":this.project._id});
  }
}

angular.module('digitalVillageApp')
  .controller('AgreementCtrl', AgreementController);
