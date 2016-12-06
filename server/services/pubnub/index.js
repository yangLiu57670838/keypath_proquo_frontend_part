/**
 * Created by cmckinnon on 23/03/16.
 */

'use strict';

import assert from 'assert';
import { retry } from './promise-util';
import { onEvent as onAuthEvent } from '../../auth/auth.service';
import _ from 'lodash';

/**
 * `true` enables pubnub grant diagnostic logging
 */
const pubnubGrantDebug = false;

const pubnubRetryDelay = 5000;  // ms
const pubnubMaxRetries = 10;
const serverAuthKey = process.env.PN_SERVER_AUTH_KEY;

const pubnub = require('pubnub')({
  ssl: true,                                    // <- enable TLS Tunneling over TCP
  publish_key: process.env.PN_PUBLISH_KEY,
  subscribe_key: process.env.PN_SUBSCRIBE_KEY,
  secret_key: process.env.PN_SECRET_KEY,        // required for grant management
  auth_key: serverAuthKey,                      // required to allow server to grant write permission to itself
});

const userSubchannels = ['not', 'msg'];         // notifications channel and messages channel respectively
const userChannelSuffixes = userSubchannels.map(sub => '-' + sub);

onAuthEvent('login', ({ user, token }) => {
  const userId = user._id.toString();
  const channels = userChannelSuffixes.map(suffix => userId + suffix).join();
  const userChannelGrant = retry(pubnubRetryDelay, pubnubMaxRetries, () => grantChannelReadOnly(channels, token), onRetry)
    .catch(err => console.error(`pubnub grant user ${user.email} read-only access to ${userId} permanently failed after ${pubnubMaxRetries} retries`));
  const serverChannelGrant = retry(pubnubRetryDelay, pubnubMaxRetries, () => grant({ channel: channels, auth_key: serverAuthKey, read: true, write: true, manage: true }), onRetry)
    .catch(err => console.error(`pubnub grant system read-write access to ${userId} permanently failed after ${pubnubMaxRetries} retries`));

  if (pubnubGrantDebug) {
    showCurrentGrants(userChannelGrant, serverChannelGrant);
  }

  function onRetry(err) {
    console.log(`pubnub grant ${userId} (${user.email}) failed (will retry):`, err);
  }
});

function grant(info) {
  return new Promise((resolve, reject) =>
    pubnub.grant(Object.assign({ ttl: 5 * 60 }, info, {
      callback: resolve,
      error: reject
    }))
  );
}

/**
 * Grant a user read-only permission to a channel.
 *
 * @param channel The channel to which to grant access.
 * @param auth_key The auth_key the client will use to access the channel. e.g. their current JWT.
 * @return Promise of grant result.
 */
function grantChannelReadOnly(channel, auth_key) {
  if (!channel) return Promise.reject({err: 'no channel specified'}); // ensure we don't ever accidentally grant global access to a user

  return grant({
    channel,
    auth_key,
    read: true,
    write: false,
    manage: false,
  });
}

/**
 * Print all pubnub grants to console for debugging purposes.
 */
function showCurrentGrants(userChannelGrant, serverChannelGrant) {
  Promise.all([userChannelGrant, serverChannelGrant]).then(() =>
    pubnub.audit({
      callback: res => {
        const channels = res.channels;
        for (let channel in channels) {
          console.log('pubnub audit for channel', channel);
          const auths = channels[channel].auths;
          for (let auth in auths) {
            const perms = auths[auth];
            console.log(`  ${_.truncate(auth)} ${perms.r ? 'r' : '-'}${perms.w ? 'w' : '-'}${perms.m ? 'm' : '-'} ${perms.ttl}`);
          }
        }
      }
    })
  ).catch(err => console.log('pubnub audit unavailable'));
}

/**
 * Setting to `true` enables here_now() debug messages that show the client UUIDs present on a channel.
 */
const here_now_debug = false;

function here_now(channel) {
  assert(isValidChannel(channel), 'invalid channel');

  return new Promise((resolve, reject) => {
    pubnub.here_now({
      channel,
      uuids: here_now_debug,
      callback: here_now_debug ? debugCallback : callback,
      error: reject
    });

    function debugCallback(msg) {
      console.log('here_now()', channel, msg);
      callback(msg);
    }

    function callback(msg) {
      resolve(msg.occupancy > 0);
    }
  });
}

function publish(channel, message) {
  assert(isValidChannel(channel), 'invalid channel');

  return new Promise((resolve, reject) => {
    pubnub.publish({
      channel,
      message,
      callback: resolve,
      error: reject
    });
  });
}

function isValidChannel(channel) {
  return userChannelSuffixes.some(suffix => channel.endsWith(suffix));
}

export default {
  here_now,
  publish,
};
