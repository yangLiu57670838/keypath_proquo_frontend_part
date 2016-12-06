'use strict';

/**
 * A promise-aware means of vetoing and redirecting state changes.
 */
class StateChangeApprovalService {
  constructor($rootScope, $state, $location) {
    this._approvers = [];

    $rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams, options) => {
      if (!this._approvers.length || options.stateChangeApprovalCompleted || toState.name === 'init') return;

      //invoking preventDefault on the urls with # will cause infinite digest
      if (!$location.hash()) {
        // prevent the ui-router state change until we're ready
        event.preventDefault();
      }

      Promise.all(this._approvers.map(approver => approver(toState, toParams, fromState, fromParams))).then(approvals => {
        let approvedState, approvedParams;

        const newState = approvals.find(approval => approval && approval !== true); // the first defined state or veto wins
        if (newState === undefined) {
          [approvedState, approvedParams] = [toState, toParams];  // no-one's vetoed the change so proceed as planned
        } else if (typeof newState === 'string') {
          approvedState = newState;
        } else {
          // newState is false: an approver vetoed the state change
          return;
        }
        $state.go(approvedState, approvedParams, Object.assign({ stateChangeApprovalCompleted: true }, options));
      });
    });
  }

  /**
   * Adds an approver callback to be evaluated before every state change. The approver should return the value (or promise)
   * of the new state to adopt (or false) if they don't want the planned state change to occur.
   *
   * Approvers are evaluated in the order they're added.
   */
  addApprover(approver) {
    if (!this._approvers.includes(approver)) {
      this._approvers.push(approver);
    }
  }

  /**
   * Removes an approver callback that was previously added using `addApprover()`.
   */
  removeApprover(approver) {
    const index = this._approvers.indexOf(approver);
    if (index >= 0) {
      this._approvers.splice(index, 1);
    }
  }
}

angular.module('digitalVillageApp')
  .service('StateChangeApprovalService', StateChangeApprovalService);
