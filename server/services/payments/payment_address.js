import request from 'request';
import {auth} from './payment_auth';

export function getAddress(addressId) {
  const options = {
    url: process.env.PP_API_HOSTNAME + '/addresses/'+addressId,
    auth: auth,
    method: 'GET',
    json: true
  };

  return new Promise((resolve, reject) => {
    request(options, function(error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode != 200) {
        reject(body);
      } else {
        resolve(body.addresses);
      }
    });
  });
}

export function decorateAddress(entity) {
  if (!entity.related.addresses && !entity.related.address) {
    return Promise.resolve(entity);
  }

  const addressId = entity.related.addresses || entity.related.address;

  return getAddress(addressId).then(address => {
    delete address.links;
    const updatedEntity = Object.assign(entity, address);
    updatedEntity.address_line1 = address.addressline1;
    updatedEntity.zip = address.postcode;
    return updatedEntity;
  });
}
