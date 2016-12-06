class SupplierCandidatesListCtrl {
  constructor($scope, ChatService, $state, Project, modalService) {
    this._Project = Project;
    this._modalService = modalService;
    this._ChatService = ChatService;
    this.$state = $state;
  }

  gotoToState(state, params){
    this.$state.go(state, params);
  }

  setProjectState(candidate){
    candidate.proQuote = {};
    if( [null, "common.draft"].includes(candidate.status)  ){
      candidate.proQuote = {
        stateIcon: "icon-quote",
        stateTitle:"Quote",
        stateParams:{'projectId':candidate.projectId},
        stateState:"brief",

        candidateIcon:"icon-exlaim",
        btnStateClass:"btn-exclaim",
        candidateTitle:"Action",
        candidateParams:{'projectId':candidate.projectId},
        candidateState:"brief"
      };
    } else if( ["cash.quote-pending", "swap.quote-pending"].includes(candidate.status) ) {
      candidate.proQuote = {
        stateIcon: "icon-quote",
        stateTitle:"Quote",
        stateParams:{'projectId':candidate.projectId},
        stateState:"brief",

        candidateIcon:"icon-clock",
        btnStateClass:"btn-pending",
        candidateTitle:"Pending",
        candidateParams:{'projectId':candidate.projectId},
        candidateState:"brief"
      };

    }else if( ["cash.quote-lodged"].includes(candidate.status) ) {
      candidate.proQuote = {
        stateIcon: "icon-icon_agreement",
        stateTitle: "Agree",
        stateParams: {'projectId': candidate.projectId},
        stateState: "brief",

        candidateIcon: "icon-done",
        btnStateClass: "btn-done",
        candidateTitle: "Review",
        candidateParams: {'projectId': candidate.projectId},
        candidateState: "quote"
      };
    }else if( ["swap.quote-lodged"].includes(candidate.status) ) {
      candidate.proQuote = {
        stateIcon: "icon-quote",
        stateTitle: "Quote",
        stateParams: {'projectId': candidate.projectId},
        stateState: "brief",

        candidateIcon: "icon-exlaim",
        btnStateClass: "btn-exclaim",
        candidateTitle: "Action",
        candidateParams: {'projectId': candidate.projectId},
        candidateState: "quote"
      };
    }else if( ["swap.swap-quote-lodged"].includes(candidate.status) ){
      if(candidate.depositPayment && candidate.depositPayment.payeeId != candidate.userId) {
        candidate.proQuote = {
          stateIcon: "icon-dollar",
          stateTitle: "Pay",
          stateParams: {'projectId': candidate.projectId},
          stateState: "agreement",

          candidateIcon: "icon-clock",
          btnStateClass: "btn-pending",
          candidateTitle: "Pending",
          candidateParams: {'projectId': candidate.projectId},
          candidateState: "quote"
        };
      }else{
        candidate.proQuote = {
          stateIcon: "icon-icon_agreement",
          stateTitle: "Agree",
          stateParams: {'projectId': candidate.projectId},
          stateState: "agreement",

          candidateIcon: "icon-clock",
          btnStateClass: "btn-pending",
          candidateTitle: "Pending",
          candidateParams: {'projectId': candidate.projectId},
          candidateState: "quote"
        };
      }

    }else if( ["swap.deposit-pending"].includes(candidate.status)  ){

      if(candidate.depositPayment && candidate.depositPayment.payeeId != candidate.userId) {
        candidate.proQuote = {
          stateIcon: "icon-dollar",
          stateTitle:"Pay",
          stateParams:{'projectId':candidate.projectId},
          stateState:"agreement",

          candidateIcon:"icon-clock",
          btnStateClass:"btn-pending",
          candidateTitle:"Pending",
          candidateParams:{'projectId':candidate.projectId},
          candidateState:"agreement",
          disableRejectBtn: true
        };
      }else{
        candidate.proQuote = {
          stateIcon: "icon-dollar",
          stateTitle:"Pay",
          stateParams:{'projectId':candidate.projectId},
          stateState:"agreement",

          candidateIcon:"icon-exlaim",
          btnStateClass:"btn-exclaim",
          candidateTitle:"Action",
          candidateParams:{'projectId':candidate.projectId},
          candidateState:"agreement",
          disableRejectBtn: true
        };
      }


    }else if( ["cash.quote-accepted"].includes(candidate.status) ) {
      candidate.proQuote = {
        stateIcon: "icon-dollar",
        stateTitle: "Pay",
        stateParams: {'projectId': candidate.projectId},
        stateState: "agreement",

        candidateIcon: "icon-exlaim",
        btnStateClass: "btn-exclaim",
        candidateTitle: "Action",
        candidateParams: {'projectId': candidate.projectId},
        candidateState: "agreement"
      };

    }else if( ["cash.quote-pending"].includes(candidate.status) ) {
      candidate.proQuote = {
        stateIcon: "icon-dollar",
        stateTitle: "Pay",
        stateParams: {'projectId': candidate.projectId},
        stateState: "agreement",

        candidateIcon: "icon-exlaim",
        btnStateClass: "btn-exclaim",
        candidateTitle: "Action",
        candidateParams: {'projectId': candidate.projectId},
        candidateState: "agreement",
        disableRejectBtn: true
      };
    }else if( ["cash.deposit-pending"].includes(candidate.status) ){
      candidate.proQuote = {
        stateIcon: "icon-dollar",
        stateTitle: "Pay",
        stateParams: {'projectId': candidate.projectId},
        stateState: "agreement",

        candidateIcon: "icon-exlaim",
        btnStateClass: "btn-exclaim",
        candidateTitle: "Action",
        candidateParams: {'projectId': candidate.projectId},
        candidateState: "pay",
        disableRejectBtn: true
      };

    }else if( ["cash.deposit-paid", "swap.deposit-paid"].includes(candidate.status)  ){
      candidate.proQuote = {
        stateIcon: "icon-dollar",
        stateTitle:"Pay",
        stateParams:{'projectId':candidate.projectId},
        stateState:"agreement",

        candidateIcon:"icon-clock",
        btnStateClass:"btn-pending",
        candidateTitle:"Pending",
        candidateParams:{'projectId':candidate.projectId},
        candidateState:"agreement",
        disableRejectBtn: true
      };
    }
  }

  deleteProject = (id, reason) => {
    this._Project.deleteProject(id, reason).then(response => {
      const candidates = this.candidates;
      candidates.forEach(function (elem, idx) {
        if (elem.projectId === id) {
          candidates.splice(idx, 1);
        }
      });
    });
  };

  rejectUser(candidate){
    if(!candidate.proQuote.disableRejectBtn ){
      if (candidate.status === 'common.draft') {
        let deleteProject = {
          title: 'Cancel project',
          confirmCallback: this.deleteProject,
          id:candidate.projectId,
          confirmationMessage: "Are you sure you want to reject this user?"
        };
        this._modalService.showGenericConfirmModal(this.$event, deleteProject);
      } else {
        // delete user
        let cancelProject = {
          title: 'Cancel project',
          confirmCallback: this.deleteProject,
          id:candidate.projectId,
          confirmationMessage: "Are you sure you want to reject this user?"
        };
        this._modalService.showGenericConfirmWithReasonModal(this.$event, cancelProject);
      }
    }
  }
  showChatModal(candidateBusiness) {
    this._ChatService.startChat(candidateBusiness.userId);
  }
}


angular.module('digitalVillageApp')
  .directive('supplierCandidatesList', () => ({
    templateUrl: 'components/supplierCandidatesList/supplierCandidatesList.html',
    restrict: 'E',
    scope: {
      projectId: "=",
      candidates: "="
    },
    bindToController: true,
    controller: SupplierCandidatesListCtrl,
    controllerAs: 'vm'
  }));
