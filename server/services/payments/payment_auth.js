import request from 'request';

export const auth = {
  user: process.env.PP_API_USERNAME,
  pass: process.env.PP_API_PASSWORD
};

/**
 * Create a session for a user and item
 */
export function getEUISession(userId, itemId, paymentType) {
  const qs = {
    token_type: 'eui',
    user_id: userId,
    item_id: itemId
  };

  const options = {
    url: process.env.PP_API_HOSTNAME + '/token_auths',
    auth: auth,
    method: 'POST',
    qs: qs,
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error || !body) {
        reject(error);
      } else {
        resolve(body);
      }
    });
  });
}
