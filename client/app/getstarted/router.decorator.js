'use strict';

angular.module('digitalVillageApp')
  .run(function ($rootScope, $state, Auth, GetStartedStateService, StateChangeApprovalService) {
    StateChangeApprovalService.addApprover(approver); // for the case where the user returns to the app with a pre-existing auth token
    Auth.onLogin(() => StateChangeApprovalService.addApprover(approver));
    Auth.onLogout(() => StateChangeApprovalService.removeApprover(approver));

    function approver(toState, toParams) {
      return toState.name.startsWith('getstarted') /* navigation within 'getstarted*' is always fine */ ||
        GetStartedStateService.getStartedState().then(getStartedState => {
          if (!getStartedState) {
            StateChangeApprovalService.removeApprover(approver);  // getstarted is finished so no need to continue monitoring
          }
          return getStartedState && toState.name !== getStartedState ? getStartedState : true
        });
    }
  });
