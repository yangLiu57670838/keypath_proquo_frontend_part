import request from 'request';
import {auth} from './payment_auth';

// Get the fee object
export function showFee(feeId) {
  const options = {
    url: process.env.PP_API_HOSTNAME + '/fees/' + feeId,
    auth: auth,
    method: 'GET',
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode != 200) {
        reject(body);
      } else {
        resolve(body.fees);
      }
    });
  });
}
