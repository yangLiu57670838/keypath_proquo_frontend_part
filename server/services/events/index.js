/**
 * Created by cmckinnon on 16/02/16.
 */
import customer from 'node-customerio';

// Configure the module to your account
customer.init(process.env.CUSTOMER_IO_SITE, process.env.CUSTOMER_IO_KEY);


module.exports = {
  identifyUser: customer.identify,

  // Delete a user
  deleteUser: customer.delete,

  // Track an event for a user
  trackUserEvent: customer.track
};
