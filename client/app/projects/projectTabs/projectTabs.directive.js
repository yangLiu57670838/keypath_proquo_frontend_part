'use strict';

class TabCtrl{
  constructor($scope, $timeout, $filter, $state, $window, Auth, User, Business, modalService, Project, Toast) {
    this.project = $scope.theModel;
    this.stateNumber = null;
    this.tabModelTabs = $scope.tabModel.tabs;
    this.allStates = $scope.tabModel.allStates;
    this.$timeout = $timeout;
    this.$filter = $filter;
    this.$state = $state;
    this.Auth = Auth;
    this.User = User;
    this.Business = Business;
    this.modalService = modalService;
    this.Project = Project;
    this.Toast = Toast;
    this.buyer = User.get({id: this.project.userId});
    if(this.project.collaborators.length === 2){
      this.seller = User.get({id: this.project.collaborators[1]});
    }


    this.tabIconDescs =
    [//brief tab
      {//'na' represents new brief with no previous states
        fromStates:['na','common.draft'], toState:'common.draft', to:"buyer", tab:"brief",
        iconDesc:{
          desc:'Your brief is currently in draft and waiting to be submitted.',
          state:'brief', params:{'projectId':this.project._id}}
      },
      {
        fromStates:['common.draft'], toState:'cash.quote-pending', to:"buyer", tab:"brief",
        iconDesc:{
          desc:"You've sent %supplierFirstName% a new or updated brief.",
          state:'brief', params:{'projectId':this.project._id}}
      },
      {
        fromStates:['common.draft'], toState:'cash.quote-pending', to:"seller", tab:"brief",
        iconDesc:{
          desc:"%buyerFirstName% has sent you a new or updated brief. Please respond with a quote.",
          state:'quote', params:{'projectId':this.project._id}}
      },

      {
        fromStates:['common.draft'], toState:'swap.quote-pending', to:"buyer", tab:"brief",
        iconDesc:{
          desc:"You've sent %supplierFirstName% a new or updated brief.",
          state:'brief', params:{'projectId':this.project._id}}
      },
      {
        fromStates:['common.draft'], toState:'swap.quote-pending', to:"seller", tab:"brief",
        iconDesc:{
          desc:"%buyerFirstName% has sent you a new or updated brief. Please respond with a quote.",
          state:'quote', params:{'projectId':this.project._id}}
      },

      {
        fromStates:['cash.quote-pending', 'cash.quote-lodged', 'cash.deposit-pending', 'swap.quote-pending'],
        toState: 'common.draft', to:"buyer", tab:"brief", actionNames:["recallBrief"],
        iconDesc:{
          desc:"Your brief is currently in draft and waiting to be submitted.",
          state:'brief', params:{'projectId':$scope.theModel._id}}
      },
      {
        fromStates:['common.draft','cash.quote-pending', 'cash.quote-lodged', 'cash.quote-accepted', 'cash.deposit-pending',
                    'swap.quote-lodged', 'swap.swap-quote-lodged', 'swap.quote-pending'],
        toState: 'common.draft', to:"buyer", tab:"brief", actionNames:["removeSeller", "rejectBrief", "rejectQuote", "rejectSwapQuote","deleteQuote"],
        iconDesc:{
          desc:"You need to browse for a new supplier, then you can send them your brief. ",
          state:'skill-search', params:{}}
      },


      //quote tab
      {
        fromStates:['common.draft'], toState:'cash.quote-pending', to:"seller", tab:"quote",
        iconDesc:{
          desc:"%buyerFirstName% has sent you a new or updated brief. Please respond with a quote.",
          state:'quote', params:{'projectId':this.project._id}}
      },
      {
        fromStates:['common.draft'], toState:'swap.quote-pending', to:"seller", tab:"quote",
        iconDesc:{
          desc:"%buyerFirstName% has sent you a new or updated brief. Please respond with a quote.",
          state:'quote', params:{'projectId':this.project._id}}
      },

      {
        fromStates:['cash.quote-pending', 'cash.quote-lodged', 'cash.quote-accepted', 'swap.quote-pending'],
        toState:'cash.quote-pending', to:"seller", tab:"quote",
        iconDesc:{
          desc:"You've updated the quote.",
          state:'quote', params:{'projectId':this.project._id}}
      },
      {
       fromStates:['cash.quote-pending', 'swap.quote-pending', 'swap.quote-lodged', 'swap.swap-quote-lodged'],
        toState:'swap.quote-pending', to:"seller", tab:"quote",
       iconDesc:{
         desc:"You've updated the quote.",
           state:'quote', params:{'projectId':this.project._id}}
      },

      {
        fromStates:['cash.quote-pending'], toState:'cash.quote-lodged', to:"buyer", tab:"quote",
        iconDesc:{
          desc:'%supplierFirstName% has sent you a new or updated quote. Please review.',
          state:'quote', params:{'projectId':this.project._id}}
      },
      {
        fromStates:['cash.quote-pending'], toState:'cash.quote-lodged', to:"seller", tab:"quote",
        iconDesc:{
          desc:"You've sent %buyerFirstName% a quote.",
          state:'quote', params:{'projectId':this.project._id}}
      },

      {
        fromStates:['swap.quote-pending', 'swap.swap-quote-lodged'], toState:'swap.quote-lodged', to:"buyer", tab:"quote",
        iconDesc:{
          desc:'%supplierFirstName% has sent you a new or updated quote. Please review.',
          state:'quote', params:{'projectId':this.project._id}}
      },
      {
        fromStates:['swap.quote-lodged'], toState:'swap.quote-lodged', to:"buyer", tab:"quote",
        iconDesc:{
          desc:"You've updated the swap quote.",
          state:'quote', params:{'projectId':this.project._id}}
      },
      {
        fromStates:['swap.quote-pending', 'swap.swap-quote-lodged', 'swap.quote-lodged'], toState:'swap.quote-lodged', to:"seller", tab:"quote",
        iconDesc:{
          desc:"You've sent %buyerFirstName% a quote.",
          state:'quote', params:{'projectId':this.project._id}}
      },

      {
        fromStates:['swap.quote-lodged'], toState:'swap.swap-quote-lodged', to:"buyer", tab:"quote",
        iconDesc:{
          desc:"You've sent %supplierFirstName% a swap quote.",
          state:'quote', params:{'projectId':this.project._id}}
      },
      {
        fromStates:['swap.quote-lodged'], toState:'swap.swap-quote-lodged', to:"seller", tab:"quote",
        iconDesc:{
          desc:"%buyerFirstName% has sent you a new or updated swap quote. Please review.",
          state:'quote', params:{'projectId':this.project._id}}
      },

      //deposit/agreement
      {
        fromStates:['cash.quote-lodged'], toState:'cash.quote-accepted', to:"buyer", tab:"agreement",
        iconDesc:{
          desc:'You need to agree and pay the deposit for %supplierFirstName% to start work.',
          state:'agreement', params:{'projectId':this.project._id}}
      },
      {
        fromStates:['cash.quote-lodged'], toState:'cash.quote-accepted', to:"seller", tab:"agreement",
        iconDesc:{
          desc:"%buyerFirstName% needs to agree and pay the deposit before you should start the work.",
          state:'agreement', params:{'projectId':this.project._id}}
      },

      {
        fromStates:['swap.quote-lodged'], toState:'swap.swap-quote-lodged', to:"buyer", tab:"agreement",
        iconDesc:{
          desc:'%supplierFirstName% has to first agree the Swap Agreement before work should start.',
          state:'agreement', params:{'projectId':this.project._id}}
      },
      {
        fromStates:['swap.quote-lodged'], toState:'swap.swap-quote-lodged', to:"seller", tab:"agreement",
        iconDesc:{
          desc:"You need to accept the Swap Agreement to start work",
          state:'agreement', params:{'projectId':this.project._id}}
      },

      {
        fromStates:['cash.quote-accepted', 'swap.quote-lodged', 'cash.deposit-pending'],
        toState:'cash.deposit-pending', to:"buyer", tab:"agreement",
        iconDesc: {
            desc:"You need to pay the deposit for %supplierFirstName% to start work.",
            state:'pay', params:{'projectId': this.project._id}}
      },
      {
        fromStates:['cash.quote-accepted', 'swap.quote-lodged', 'cash.deposit-paid', 'cash.deposit-pending'],
        toState:'cash.deposit-pending', to:"seller", tab:"agreement",
        iconDesc:{
          desc:"%buyerFirstName% needs to pay the deposit before you should start the work.",
          state:'agreement', params:{'projectId':this.project._id}}
      },

      {
        fromStates:['swap.swap-quote-lodged'], toState:'swap.deposit-pending', to:"buyer", tab:"agreement",
        iconDesc: (user, project) => {
          const icon = {state:'agreement', params:{'projectId':project._id}};
          icon.desc = "%supplierFirstName% needs to accept the Swap Agreement and pay the deposit before you should start work.";
          if(project.depositPayment.payerRole === 'buyer'){
            icon.desc = "You need to accept the Swap Agreement and pay the deposit for %supplierFirstName% to start work.";
            icon.state = "pay";
          }
          return icon;
        }
      },
      {
        fromStates:['swap.swap-quote-lodged'], toState:'swap.deposit-pending', to:"seller", tab:"agreement",
        iconDesc: (user, project) => {
          const icon = {state:'agreement', params:{'projectId':project._id}};
          icon.desc = "%buyerFirstName% needs to accept the Swap Agreement and pay the deposit before you should start work.";
          if(project.depositPayment.payerRole === 'supplier'){
            icon.desc = "You need to accept the Swap Agreement and pay the deposit for %buyerFirstName% to start work.";
            icon.state = "pay";
          }
          return icon;
        }
      },

      {//cash deposit failure
        fromStates:['cash.deposit-paid'],
        toState:'cash.deposit-pending', to:"buyer", tab:"agreement",
        iconDesc: {
          desc: "There's been a problem with your deposit payment.",
          state: 'pay', params: {'projectId': this.project._id}}
      },







      {//swap deposit failure
        fromStates:['swap.deposit-paid'], toState:'swap.deposit-pending', to:"buyer", tab:"agreement",
        iconDesc: (user, project) => {
          const icon = {state:'agreement', params:{'projectId':project._id}};
          icon.desc = "%supplierFirstName% needs to accept the Swap Agreement and pay the deposit before you should start work.";
          if(project.depositPayment.payerRole === 'buyer'){
            icon.desc = "There's been a problem with your deposit payment.";
            icon.state = "pay";
          }
          return icon;
        }
      },
      {
        fromStates:['swap.deposit-paid'], toState:'swap.deposit-pending', to:"seller", tab:"agreement",
        iconDesc: (user, project) => {
          const icon = {state:'agreement', params:{'projectId':project._id}};
          icon.desc = "%buyerFirstName% needs to accept the Swap Agreement and pay the deposit before you should start work.";
          if(project.depositPayment.payerRole === 'supplier'){
            icon.desc = "There's been a problem with your deposit payment.";
            icon.state = "pay";
          }
          return icon;
        }
      },

      {
        fromStates:['cash.deposit-pending'], toState:'cash.deposit-paid', to:"buyer", tab:"agreement",
        iconDesc:{
          desc:"Your deposit of %depositPaymentAmount% is currently being processed.",
          state:'pay', params:{'projectId':this.project._id}}
      },
      {
        fromStates:['cash.deposit-pending'], toState:'cash.deposit-paid', to:"seller", tab:"agreement",
        iconDesc:{
          desc:"%buyerFirstName% has accepted the Pay Agreement and paid their deposit. " +
          "We are waiting for the confirmation of the payment.",
          handler: () => this.checkDepositPayment(this.project, 'agreement'),
          state:'agreement', params:{'projectId':this.project._id}}
      },

      {
        fromStates:['swap.deposit-pending'], toState:'swap.deposit-paid', to:"buyer", tab:"agreement",
        iconDesc: (user, project) => {
          const icon = {state:'pay', params:{'projectId':project._id}};
          icon.desc = "%supplierFirstName% has accepted the Pay Agreement and paid their deposit. " +
            "We are waiting for the confirmation of the payment.";
          if(project.depositPayment.payerRole === 'buyer'){
            icon.desc = "Your deposit of %depositPaymentAmount% is currently being processed.";
            icon.state='pay';
          } else {
            icon.handler = () => this.checkDepositPayment(project, 'agreement');
          }
          return icon;
        }
      },
      {
        fromStates:['swap.deposit-pending'], toState:'swap.deposit-paid', to:"seller", tab:"agreement",
        iconDesc: (user, project) => {
          const icon = {params:{'projectId':project._id}};
          icon.desc = "%buyerFirstName% has accepted the Pay Agreement and paid their deposit. " +
            "We are waiting for the confirmation of the payment.";
          if(project.depositPayment.payerRole === 'supplier'){
            icon.desc = "Your deposit of %depositPaymentAmount% is currently being processed.";
            icon.state='pay';
          } else {
            icon.handler = () => this.checkDepositPayment(project, 'agreement');
          }
          return icon;
        }
      },


      //payment tab
      {
        fromStates:['cash.deposit-pending', 'cash.deposit-paid', 'cash.in-progress'], toState:'cash.in-progress', to:"buyer", tab:"payment",
        iconDesc:{
          desc:"Work has started!",
          params:{'projectId':this.project._id}}
      },
      {//
        fromStates:['cash.deposit-pending', 'cash.deposit-paid', 'cash.in-progress'], toState:'cash.in-progress', to:"seller", tab:"payment",
        iconDesc:{
          desc:"When you've completed the work click here to let %buyerFirstName% know.",
          handler: this.confirmCompleteWork.bind(this), params:{'projectId':this.project._id}}
      },

      {//pure swap, deposit paid and one side work complete leading to in-progress buyer/seller
        fromStates:['swap.swap-quote-lodged', 'swap.deposit-pending', 'swap.deposit-paid', 'swap.in-progress'],
        toState:'swap.in-progress', to:"buyer", tab:"payment",
        iconDesc : (user, project) => {
          const icon = {
            desc:"When you've completed the work click here to let %supplierFirstName% know.",
            handler:()=>this.swapBuyerCompleteWork(project),
            params:{'projectId':project._id}};
          if(project.buyerCompletedWork){
            icon.desc = project.depositPayment && project.depositPayment.paymentAmount > 0 ?
              "You have completed your work on this project. %supplierFirstName% will need to complete their work before you can Rate & Review." :
              "Thanks for completing your work. %supplierFirstName% will need to complete their work before you can Rate & Review.";
            icon.handler = undefined;
          }else if (project.supplierCompletedWork){
            icon.desc = '%supplierFirstName% has completed their work. Once you are also done click here to let them know.';
          }
          return icon;
        }
      },
      {
        fromStates:['swap.swap-quote-lodged', 'swap.deposit-pending', 'swap.deposit-paid', 'swap.in-progress'],
        toState:'swap.in-progress', to:"seller", tab:"payment",
        iconDesc : (user, project) => {
          const icon = {
            desc:"When you've completed the work click here to let %buyerFirstName% know.",
            handler:()=>this.swapSellerCompleteWork(project),
            params:{'projectId':project._id}};
          if(project.supplierCompletedWork){
            icon.desc = project.depositPayment && project.depositPayment.paymentAmount > 0 ?
              "You have completed your work on this project.  %buyerFirstName% will need to complete their work before you can Rate & Review." :
              "Thanks for completing your work. %buyerFirstName% will need to complete their work before you can Rate & Review.";
            icon.handler = undefined;
          }else if (project.buyerCompletedWork){
            icon.desc = '%buyerFirstName% has completed their work. Once you are also done click here to let them know.';
          }
          return icon;
        }
      },

      {
        fromStates:['cash.in-progress', 'cash.final-payment-pending'], toState:'cash.final-payment-pending', to:'buyer', tab:'payment',
        iconDesc : {
          desc:'You need to pay the remaining amount to %supplierFirstName%.',
          state:'finalPayment', params:{'projectId':this.project._id}}
      },
      {
        fromStates:['cash.in-progress', 'cash.final-payment-pending', 'cash.final-payment-paid'], toState:'cash.final-payment-pending', to:'seller', tab:'payment',
        iconDesc : (user, project) => {
          if (user.billing.verificationState !== 'pending') {
            return {
              desc: '%buyerFirstName% needs to pay the final amount before you can receive the full payment.'
            }
          } else {
            return {
              desc: 'We need your account details so that you can get paid.',
              state: 'my.payments',
              params: { returnToProjectId: project._id }
            }
          }
        }
      },

      {//cash final payment failure
        fromStates:['cash.final-payment-paid'], toState:'cash.final-payment-pending', to:'buyer', tab:'payment',
        iconDesc : {
          desc:"There's been a problem with your final payment. Check your payment details and try again.",
          state:'finalPayment', params:{'projectId':this.project._id}}
      },

      {
        fromStates:['swap.in-progress', 'swap.final-payment-pending'], toState:'swap.final-payment-pending', to:'buyer', tab:'payment',
        iconDesc : (user, project) => {
          const icon = {desc:"Thanks for completing your work. %supplierFirstName% will need to complete their work before you can Rate & Review."};
          if(project.depositPayment.payerRole === 'buyer'){
            if(!project.buyerCompletedWork){
              return {desc:"%supplierFirstName% has completed their work. Once you are also done click here to let them know.",
                handler:()=>this.swapBuyerCompleteWork(project), params:{'projectId':project._id}};
            }
            icon.desc = "You need to pay the remaining amount to %supplierFirstName%.";
            icon.state = 'finalPayment';
            icon.params = {'projectId':project._id};
          }else if (user.billing.verificationState === 'pending'){
            icon.desc = 'We need your account details so that you can get paid.';
            icon.state = 'my.payments';
            icon.params = { returnToProjectId: project._id };
          }else if (user.billing.verificationState === 'approved'){
            icon.desc = 'Thanks for completing your work. %supplierFirstName% needs to pay the final amount before you can receive the full payment.';
          }
          return icon;
        }
      },
      {
        fromStates:['swap.in-progress', 'swap.final-payment-pending'], toState:'swap.final-payment-pending', to:'seller', tab:'payment',
        iconDesc : (user, project) =>{
          const icon = { desc:"Thanks for completing your work. %buyerFirstName% will need to complete their work before you can Rate & Review."};
          if(project.depositPayment.payerRole === 'supplier'){
            if(!project.supplierCompletedWork){
              return {desc:"%buyerFirstName% has completed their work. Once you are also done click here to let them know.",
                handler:()=>this.swapSellerCompleteWork(project), params:{'projectId':project._id}};
            }
            icon.desc = "You need to pay the remaining amount to %buyerFirstName%.";
            icon.state = 'finalPayment';
            icon.params = {'projectId':project._id};
          }else if (user.billing.verificationState === 'pending'){
            icon.desc = 'We need your account details so that you can get paid.';
            icon.state = 'my.payments';
            icon.params = { returnToProjectId: project._id };
          }else if (user.billing.verificationState === 'approved'){
            icon.desc = 'Thanks for completing your work. %buyerFirstName% needs to pay the final amount before you can receive the full payment.';
          }
          return icon;
        }
      },

      {//swap final payment failure
        fromStates:['swap.final-payment-paid'], toState:'swap.final-payment-pending', to:'buyer', tab:'payment',
        iconDesc : (user, project) => {
          const icon = {
            desc:"Thanks for completing your work. %supplierFirstName% will need to complete their work before you can Rate & Review.",
            state:'finalPayment', params:{'projectId':project._id}};
          if(project.depositPayment.payerRole === 'buyer'){
            if(!project.buyerCompletedWork){
              return {desc:"When you've completed the work click here to let %supplierFirstName% know",
                handler:()=>this.swapBuyerCompleteWork(project), params:{'projectId':project._id}};
            }
            icon.desc = "There's been a problem with your final payment. Check your payment details and try again.";
          }else if (user.billing.verificationState === 'pending'){
            icon.desc = 'We need your account details so that you can get paid.';
            icon.state = 'my.payments';
            icon.params = { returnToProjectId: project._id };
          }
          return icon;
        }
      },
      {
        fromStates:['swap.final-payment-paid'], toState:'swap.final-payment-pending', to:'seller', tab:'payment',
        iconDesc : (user, project) =>{
          const icon = {
            desc:"Thanks for completing your work. %buyerFirstName% will need to complete their work before you can Rate & Review.",
            state:'finalPayment', params:{'projectId':project._id}};
          if(project.depositPayment.payerRole === 'supplier'){
            if(!project.supplierCompletedWork){
              return {desc:"When you've completed the work click here to let %buyerFirstName% know",
                handler:()=>this.swapSellerCompleteWork(project), params:{'projectId':project._id}};
            }
            icon.desc = "There's been a problem with your final payment. Check your payment details and try again.";
          }else if (user.billing.verificationState === 'pending'){
            icon.desc = 'We need your account details so that you can get paid.';
            icon.state = 'my.payments';
            icon.params = { returnToProjectId: project._id };
          }
          return icon;
        }
      },

      {
        fromStates:['cash.final-payment-pending'], toState:'cash.final-payment-paid', to:"buyer", tab:"payment",
        iconDesc:{
          desc:"You paid the final amount of %finalPaymentAmount%. The payment is being processed.",
          state: 'finalPayment',
          params:{'projectId':this.project._id}}
      },
      {
        fromStates:['cash.final-payment-pending'], toState:'cash.final-payment-paid', to:"seller", tab:"payment",
        iconDesc:{
          desc:"%buyerFirstName% paid the final amount of %finalPaymentAmount%. The payment is being processed.",
          handler: () => this.checkFinalPayment(this.project),
          params:{'projectId':this.project._id}}
      },

      {
        fromStates:['swap.final-payment-pending'], toState:'swap.final-payment-paid', to:"buyer", tab:"payment",
        iconDesc: (user, project) => {
          if (project.depositPayment.payerRole === 'buyer') {
            return !project.buyerCompletedWork ? {
                desc: "When you've completed the work click here to let %supplierFirstName% know.",
                handler: () => this.swapBuyerCompleteWork(project),
                params: { 'projectId': project._id }
              } : {
                desc: "You paid the final amount of %finalPaymentAmount%. The payment is being processed.",
                state: 'finalPayment',
                params: { 'projectId': project._id }
              };
          } else {
            return {
              handler: () => this.checkFinalPayment(project),
              desc: "%supplierFirstName% paid the final amount of %finalPaymentAmount%. The payment is being processed."
            };
          }
        }
      },
      {
        fromStates:['swap.final-payment-pending'], toState:'swap.final-payment-paid', to:"seller", tab:"payment",
        iconDesc: (user, project) => {
          if (project.depositPayment.payerRole === 'supplier') {
            return !project.supplierCompletedWork ? {
                desc: "When you've completed the work click here to let %buyerFirstName% know",
                handler: () => this.swapSellerCompleteWork(project),
                params: { 'projectId': project._id }
              } : {
                desc: "You paid the final amount of %finalPaymentAmount%. The payment is being processed.",
                state: 'finalPayment',
                params: { 'projectId': project._id }
              };
          } else {
            return {
              handler: () => this.checkFinalPayment(project),
              desc: "%buyerFirstName% paid the final amount of %finalPaymentAmount%. The payment is being processed."
            };
          }
        }
      },

      {
        fromStates:['cash.in-progress', 'swap.in-progress'], toState:'common.complete', to:'buyer', tab:'payment',
        iconDesc: {
          desc:'This project has been cancelled. Please contact support for assistance.',
          params:{'project':this.project},
          handler: (thisScope) => $window.open("mailto:support@proquo.com.au?subject=Assistance with " + this.project.brief.workTitle, "_self")
        }
      },
      {
        fromStates:['cash.in-progress', 'swap.in-progress'], toState:'common.complete', to:'seller', tab:'payment',
        iconDesc: {
          desc:'This project has been cancelled. Please contact support for assistance.',
          handler: (thisScope) => $window.open("mailto:support@proquo.com.au?subject=Assistance with " + this.project.brief.workTitle, "_self")
        }
      },


      {//rate tab
        fromStates:['cash.final-payment-paid', 'cash.final-payment-pending', 'swap.final-payment-paid',
          'swap.final-payment-pending', 'common.rating-review-pending', 'swap.in-progress'],
        toState:'common.rating-review-pending', to:"buyer", tab:"rate",
        iconDesc : (user, project) => {
          const icon = {desc : "Thanks for your feedback"};
          if(!project.supplierReviewed){
            icon.desc = "Great work! Please tell us how your experience was working with %supplierFirstName%.";
            icon.handler = this.ratingsModal.bind(this);
            icon.params = {'project':this.project};
          }
          return icon;
        }
      },
      {
        fromStates:['cash.final-payment-paid', 'cash.final-payment-pending', 'swap.final-payment-paid',
          'swap.final-payment-pending', 'common.rating-review-pending', 'swap.in-progress'],
        toState:'common.rating-review-pending', to:"seller", tab:"rate",
        iconDesc : (user, project) => {
          const icon = {desc : "Thanks for your feedback"};
          if(!project.buyerReviewed){
            icon.desc = "Great work! Please tell us how your experience was working with %buyerFirstName%.";
            icon.handler = this.ratingsModal.bind(this);
            icon.params = {'project':this.project};
          }
          return icon;
        }
      },

      {
        fromStates:['common.rating-review-pending'], toState:'common.complete', to:"buyer", tab:"rate",
        iconDesc:{desc:"Thank you for your feedback!"}
      },
      {
        fromStates:['common.rating-review-pending'], toState:'common.complete', to:"seller", tab:"rate",
        iconDesc:{desc:"Thank you for your feedback!"}
      }

    ];

    this.tabIconDefaultDescs =
      [//brief tab
        {
          states:['cash.quote-pending', 'cash.quote-lodged', 'cash.quote-accepted', 'cash.deposit-pending', 'cash.deposit-paid',
            'cash.in-progress', 'cash.final-payment-pending', 'cash.final-payment-paid', 'cash.in-dispute', 'common.rating-review-pending', 'common.complete',
            'swap.quote-pending', 'swap.quote-lodged', 'swap.swap-quote-lodged', 'swap.deposit-pending', 'swap.deposit-paid', 'swap.in-progress',
            'swap.final-payment-paid', 'swap.final-payment-pending'], to:"buyer", tab:"brief",
          iconDesc:{
            desc:"You've sent %supplierFirstName% a new or updated brief.",
            state:'brief',
            params:{'projectId':this.project._id}
          }
        },
        {
          states:['cash.quote-pending', 'cash.quote-lodged', 'cash.quote-accepted', 'cash.deposit-pending', 'cash.deposit-paid',
            'cash.in-progress', 'cash.final-payment-pending', 'cash.final-payment-paid', 'cash.in-dispute', 'common.rating-review-pending', 'common.complete',
            'swap.quote-pending', 'swap.quote-lodged', 'swap.swap-quote-lodged', 'swap.deposit-pending', 'swap.deposit-paid', 'swap.in-progress',
            'swap.final-payment-paid', 'swap.final-payment-pending'], to:"seller", tab:"brief",
          iconDesc:{
            desc:"%buyerFirstName% has sent you a new or updated brief. Please respond with a quote.",
            state:'quote',
            params:{'projectId':this.project._id}
          }
        },
        {//quote tab
          states:['cash.deposit-pending', 'cash.deposit-paid', 'cash.quote-accepted', 'cash.in-progress', 'cash.final-payment-pending',
            'cash.final-payment-paid', 'cash.in-dispute', 'common.rating-review-pending', 'common.complete', 'swap.deposit-pending',
            'swap.deposit-paid', 'swap.in-progress', 'swap.final-payment-paid', 'swap.final-payment-pending'], to:"buyer", tab:"quote",
          iconDesc: (user, project) => {
            const icon = {state:'quote', params:{'projectId':project._id}};
            if (project && project.nameSpace === 'swap' && project.brief.considerSwap) {
              icon.desc = "You've sent %supplierFirstName% a swap quote.";
            } else {
              icon.desc = '%supplierFirstName% has sent you a new or updated quote. Please review.';
            }
            return icon;
          }
        },
        {
          states:['cash.deposit-pending', 'cash.deposit-paid', 'cash.quote-accepted', 'cash.in-progress', 'cash.final-payment-pending',
            'cash.final-payment-paid', 'cash.in-dispute', 'common.rating-review-pending', 'common.complete', 'swap.deposit-pending',
            'swap.deposit-paid', 'swap.in-progress', 'swap.final-payment-paid', 'swap.final-payment-pending'], to:"seller", tab:"quote",
          iconDesc: (user, project) => {
            const icon = {state:'quote', params:{'projectId':project._id}};
            if (project && project.nameSpace === 'swap' && project.brief.considerSwap) {
              icon.desc = "%buyerFirstName% has sent you a new or updated swap quote.";
            } else {
              icon.desc = "You've sent %buyerFirstName% a new or updated quote.";
            }
            return icon;
          }
        },
        {//agreement tab
          states:['cash.in-progress', 'cash.final-payment-pending', 'cash.final-payment-paid', 'cash.in-dispute', 'common.rating-review-pending',
            'common.complete', 'swap.in-progress', 'swap.final-payment-paid', 'swap.final-payment-pending'], to:"buyer", tab:"agreement",
          iconDesc: (user, project) => {
            const icon = {state:'agreement', params:{'projectId':project._id}};
            icon.desc = "Your payment of %depositPaymentAmount% has been processed. Now %supplierFirstName% can start work!";
            //when swap, desc varies based on payRole
            if (project.nameSpace === 'swap' && project.brief.considerSwap) {
              if(project.depositPayment && project.depositPayment.paymentAmount > 0){
                icon.desc = project.depositPayment.payerRole === 'buyer' ?
                    "Your payment of %depositPaymentAmount% has been processed. Now you can both start work!" :
                    "The deposit of %depositPaymentAmount% has been received by the escrow vault so you can both start work!";
              }else{
                icon.desc = "%supplierFirstName% has accepted the Agreement. You may now both start work. ";
              }
            }
            return icon;
          }
        },
        {
          states:['cash.in-progress', 'cash.final-payment-pending', 'cash.final-payment-paid', 'cash.in-dispute', 'common.rating-review-pending',
            'common.complete', 'swap.in-progress', 'swap.final-payment-paid' , 'swap.final-payment-pending'], to:"seller", tab:"agreement",
          iconDesc: (user, project) => {
            const icon = {state:'agreement', params:{'projectId':project._id}};
            icon.desc = 'The deposit of %depositPaymentAmount% has been received by the escrow vault so you can start work!';
            //when swap, desc varies based on payRole
            if (project.nameSpace === 'swap' && project.brief.considerSwap) {
              if(project.depositPayment && project.depositPayment.paymentAmount > 0){
                icon.desc = project.depositPayment.payerRole === 'supplier' ?
                  "Your payment of %depositPaymentAmount% has been processed.  Now you can both start work!" :
                  "The deposit of %depositPaymentAmount% has been received by the escrow vault so you can both start work!";
              }else{
                icon.desc = "%buyerFirstName% has accepted the Agreement. You may now both start work. ";
              }
            }
            return icon;
          }
        },
        {//payment tab
          states:['cash.final-payment-pending', 'cash.final-payment-paid', 'cash.in-dispute', 'common.rating-review-pending',
            'common.complete', 'swap.final-payment-paid', 'swap.final-payment-pending'],
          toState:'common.rating-review-pending', to:"buyer", tab:"payment",
          iconDesc: (user, project) => {
            let icon = {desc:"Final payment successfully processed."};
            // Pure swap has different desc for rating & revivew state
            if (!project.depositPayment || project.depositPayment.paymentAmount === 0) {
              icon.desc = "Work has completed.";
            } else if (user.billing.verificationState === 'pending' && project.finalPayment.payerRole === 'supplier') {
              // If this user is receiving money but is not kyc approved
              icon = {
                desc: 'We need your account details so that you can get paid.',
                state: 'my.payments',
                params: { returnToProjectId: project._id }
              }
            }
            return icon;
          }
        },
        {
          states:['cash.final-payment-pending', 'cash.final-payment-paid', 'cash.in-dispute', 'common.rating-review-pending',
            'common.complete', 'swap.final-payment-paid', 'swap.final-payment-pending'],
          toState:'common.rating-review-pending', to:"seller", tab:"payment",
          iconDesc: (user, project) => {
            let icon = {desc:"Final payment successfully processed."};
            // Pure swap has different desc for rating & revivew state
            if (!project.depositPayment || project.depositPayment.paymentAmount === 0) {
              icon.desc = "Work has completed.";
            } else if (user.billing.verificationState === 'pending' && project.finalPayment.payerRole === 'buyer') {
              // If this user is receiving money but is not kyc approved
              icon = {
                desc: 'We need your account details so that you can get paid.',
                state: 'my.payments',
                params: { returnToProjectId: project._id }
              }
            }

            return icon;
          }
        }
      ];

    this.getStateOn(this.project.status);
    //getStateOn("common.rating-review-pending");
    this.getActive();

  }

  checkDepositPayment(project, toState) {
    this.Project.checkDeposit({id: project._id}).$promise.then(res =>
      this.$state.go(toState || 'projects', {projectId:project._id}, {reload: true})
    );
  }

  checkFinalPayment(project, toState) {
    this.Project.checkFinalPayment({id: project._id}).$promise.then(res =>
      this.$state.go(toState || 'projects', {projectId:project._id}, {reload: true})
    );
  }


  //seller complete work action
  confirmCompleteWork() {
    const item = {
      confirmCallback: this.completeWork,
      id:this.project._id,
      confirmationMessage: "Are you sure you want to complete work on the project?"
    };
    this.modalService.showGenericConfirmModal(undefined, item);
  }

  //seller complete work
  completeWork = () => {
    this.Project.completeWork({"id":this.project._id}, {}).$promise.then((result) => {
      this.Toast.show("We will let " + this.buyer.firstName +
        " know that work is complete from your end so that payment can be processed.");
      this.$state.go("projects", {projectId:this.project._id}, {reload: true});
    }, (error)=> {
      console.log(error);
    });
  };

  //swap buyer complete work
  swapBuyerCompleteWork(project){
    const item = {
      id:project._id,
      confirmationMessage: "Are you sure you want to complete work on the project?",
      confirmCallback: () => {
        this.Project.buyerCompleteWork({"id":project._id}, {}).$promise.then((result) => {
          if(project.depositPayment && project.depositPayment.payerRole === 'supplier'){
            this.Toast.show("We will let " + this.seller.firstName +
              " know that work is complete from your end so that payment can be processed.");
          }else{
            this.Toast.show("We will let them know that work is complete from your end. You can now rate and review their work.");
          }
          this.$state.go("projects", {projectId:project._id}, {reload: true});
        }, (error)=> {
          console.log(error);
        });
      }
    };
    this.modalService.showGenericConfirmModal(undefined, item);
  }


  //swap seller complete work
  swapSellerCompleteWork(project){
    const item = {
      id:project._id,
      confirmationMessage: "Are you sure you want to complete work on the project?",
      confirmCallback: () =>{
        this.Project.sellerCompleteWork({"id":project._id}).$promise.then((result) => {
          if(project.depositPayment && project.depositPayment.payerRole === 'buyer'){
            this.Toast.show("We will let " + this.buyer.firstName +
              " know that work is complete from your end so that payment can be processed.");
          }else{
            this.Toast.show("We will let them know that work is complete from your end. You can now rate and review their work.");
          }
          this.$state.go("projects", {projectId:project._id}, {reload: true});
        }, (error) => {
          console.log(error);
        });
      }
    };
    this.modalService.showGenericConfirmModal(undefined, item);
  }

  ratingsModal(params) {
    this.modalService.showRatingModal(null, params);
  }

  setActve(idx){
    if(this.tabModelTabs[idx].stateOn === 0){
      // if state is zero we don't allow the tab to be clicked
      return;
    }
    for(var i=0; i<this.tabModelTabs.length; i++){
      this.tabModelTabs[i].active = false;
    }
    this.tabModelTabs[idx].active = true;
    //this.previdx = idx;
    this.initIconDesc(idx);
  };


   getStateOn(stateOn){
    for(var i=0; i<this.allStates.length; i++){
      if(stateOn === this.allStates[i]){
        this.stateNumber = i;
        break;
      }
    }

  }

   getActive(){
    this.$timeout(()=>{
      var makeActive = null;
      for(var i=0; i<this.tabModelTabs.length; i++){
        this.tabModelTabs[i].active = false;
        if(this.tabModelTabs[i].stateOn >0){
          makeActive = i;
        }
      }
      if(makeActive != null){
        this.tabModelTabs[makeActive].active = true;
        this.initIconDesc(makeActive);
      }
    });
  }

  // @todo - ideally our modals would also be router states and this little hack would not be required.
  // however the other modals appear not to be so here we go.
  redirectTo(state, params, handler){
    // Handler function supplied
    if(handler) {
      handler(params);
    } else { // State transition defined
      if (!state) {
        return;
      }

      this.$state.go(state, params);
    }
  }

  //provide activity icon description based on the tab number
  initIconDesc(idx) {
    let tab = ['brief', 'quote', 'agreement', 'payment', 'rate'][idx];
    this.Auth.getCurrentUser(usr=> {
      if (usr) {
        let role = undefined;
        if (angular.equals(usr._id, this.project.userId)) {
          role = 'buyer';
        } else if (this.project.collaborators.indexOf(usr._id) != -1) {
          role = 'seller';
        }
        const excludeTransitionNames = ['sellerEditFile', 'buyerEditFile'];
        var logs = _.filter(this.project.log || [], e => !excludeTransitionNames.includes(e.transitionName));
        var result = this.getTabIconDesc(tab, role, this.project.status,
          logs && logs.length > 0 ? logs[0].fromState : 'na',
          logs && logs.length > 0 ? logs[0].transitionName : undefined,
          usr
        );

        this.iconDesc = undefined;
        //replace placeholder with value
        if (result && role) {
          let replacements = {
            "%finalPaymentAmount%": this.project.finalPayment ?
              this.$filter('currency')(this.project.finalPayment.paymentAmount) : undefined,
            "%depositPaymentAmount%": this.project.depositPayment ?
              this.$filter('currency')(this.project.depositPayment.paymentAmount) : undefined
          };

          if(angular.equals(role, 'buyer')){//get supplier info //todo refactor to get this code more clear
            if(this.project.brief.supplierId){
              this.Business.get({id:this.project.brief.supplierId}).$promise.then(
                  seller=>{
                    replacements["%supplierFirstName%"] = seller.primaryContactFirstName;
                    if(result.desc){
                      result.desc = result.desc.replace(/%\w+%/g, s=> {return replacements[s] || s;});
                    }
                    this.iconDesc = result;
                  }
              );
            }else{
              if(result.desc){
                result.desc = result.desc.replace(/%\w+%/g, s=> {return replacements[s] || s;});
              }
              this.iconDesc = result;
            }
          }else{
            this.User.get({id:this.project.userId}).$promise.then(
              buyer=>{
                replacements["%buyerFirstName%"] = buyer.firstName;
                if(result.desc){
                  result.desc = result.desc.replace(/%\w+%/g, s=> {return replacements[s] || s;});
                }
                this.iconDesc = result;
              }

            );
          }
        }
      }
    });
  }

  //look up for the right description from tabIconDescs
   getTabIconDesc(tab, toUserRole, currentState, fromState, actionName, user){
    let result = undefined;
    if(!toUserRole || !tab || !currentState){
      return result;
    }

    let previousState = fromState ? fromState : 'na';
     let descs = _.filter(this.tabIconDescs, e =>{
       if(actionName && e.actionNames && !e.actionNames.includes(actionName)){
         return false;
       }
       return angular.equals(tab, e.tab) &&
         angular.equals(toUserRole, e.to) &&
         angular.equals(currentState, e.toState) && e.fromStates.includes(previousState);
     });

    if(descs.length > 1){
      descs = _.filter(descs, e => e.actionNames && e.actionNames.includes(actionName));
    }

     if(descs.length == 0){
       descs = _.filter(
         this.tabIconDefaultDescs,
           e=>angular.equals(tab, e.tab) &&
         angular.equals(toUserRole, e.to) &&
         e.states.includes(currentState));
     }

     if(descs.length > 0) {
       // If a function has been specified use that to return the static content
       if(typeof descs[0].iconDesc === 'function') {
         result = descs[0].iconDesc(user, this.project);
       } else {
         result = descs[0].iconDesc;
       }
     }

    return result;
  }
}

angular.module('digitalVillageApp')
  .directive('projectTabs',  () =>{
    return {
      controller: TabCtrl,
      controllerAs: 'vm',
      templateUrl: 'app/projects/projectTabs/projectTabs.html',
      restrict: 'EA',
      scope:{
        tabModel:'=',
        theModel:'='
      },
      link:  (scope, element, attrs) =>{

      }
    };
  });
