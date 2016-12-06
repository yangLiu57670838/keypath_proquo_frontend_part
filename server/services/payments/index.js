import { onEvent as onAuthEvent } from '../../auth/auth.service';
import { getPaymentUser, createPaymentUser } from './payment_user';
import logger from '../../components/logger';

/**
 * Main module index to put all functions and API shite together
 */
export * from './payment_auth';
export * from './payment_accounts';
export * from './payment_user';
export * from './payment_item';
export * from './payment_companies';

export function verifyPaymentAccount(user) {
  // Check user has principal on promise pay
  return getPaymentUser(user._id.toString()).catch(error => {
    if (error && error.errors && error.errors.id && error.errors.id[0] === 'invalid') {
      // It appears the id does not exist on pp
      return createPaymentUser(user);
    } else {
      return error;
    }
  })
}

onAuthEvent('login', ({ user, token }) => {
  verifyPaymentAccount(user).catch(error => {
    // Something out of our control has occurred and worth logging this to error
    logger.error(error);
    return error;
  });
});
