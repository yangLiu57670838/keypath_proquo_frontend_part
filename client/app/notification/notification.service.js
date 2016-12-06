'use strict';

angular.module('digitalVillageApp')
  .service('Notifications', function (Pubnub, Auth, Config, $cookies, $resource, $q) {
    const pubnubHeartbeat = 15; // seconds - ensures that disconnects are noticed quickly

    // AngularJS will instantiate a singleton by calling "new" on this function
    const service = $resource('/api/notifications/:id',
      {
        id: '@id'
      },
      {
        'update': { method:'PUT' },
        'bulk' : {
          method:'PUT',
          url : '/api/notifications'
        }
      }
    );

    const notificationCallbacks = new Map();
    const subscribedChannels = new Map();
    const channelStatus = new Map();  // used to deal with overlapping subscribe/unsubscribe
    let pubnubIsInitialised = false;

    /**
     * Subscribes to the user's notification channel if not already setup and adds messageCallback to the list of functions called when a new notification arrives.
     *
     * @param channelSuffix Only 'msg' and 'not' channels are supported.
     * @param notificationCallback The function to call each time a message or notification arrives.
     * @returns {boolean} `true` if successfully requested
     */
    service.subscribe = function(channelSuffix, notificationCallback) {
      const callbacks = addCallback();
      if (subscribedChannels.has(channelSuffix)) return;

      $q.all([Auth.getCurrentUser().$promise, Config.all()]).then(([user, conf]) => {
        initialisePubnubIfNecessary(user, conf);
        const channel =  user._id + '-' + channelSuffix;

        Pubnub.subscribe({
          channel,
          // handlers
          connect,
          message,
          error: err => error(err, channel)
        });
      })
        .catch(err => { console.log('subscribe failed', err); });

      function error(err, channel) {
        //In case channel expires, we need to un-subscribe channel to avoid heartbeat call error flood the console.
        if (err.status === 403 && channelStatus.get(channelSuffix) !== 'unsubscribing') {
          subscribedChannels.set(channelSuffix, channel);
          service.unsubscribe(channelSuffix);
        } else {
          console.log('error connecting to pubnub:', err);
        }
      }

      function connect(channel) {
        subscribedChannels.set(channelSuffix, channel);
        if (channelStatus.get(channelSuffix) === 'unsubscribing') {
          service.unsubscribe(channelSuffix);
        } else {
          channelStatus.set(channelSuffix, 'subscribed');
        }
      }

      function message(msg) {
        // manage callbacks directly for performance and simplicity rather than using Pubnub Angular's events feature
        callbacks.forEach(callback => callback(msg));
      }

      function addCallback() {
        if (!notificationCallbacks.has(channelSuffix)) {
          notificationCallbacks.set(channelSuffix, []);
        }
        const callbacks = notificationCallbacks.get(channelSuffix);
        callbacks.push(notificationCallback);
        return callbacks;
      }

      function initialisePubnubIfNecessary(user, conf) {
        if (pubnubIsInitialised) return;

        const subscribe_key = _.find(conf, {key: 'PN_SUBSCRIBE_KEY'}).val;
        const auth_key = $cookies.get('token');
        const uuid = PUBNUB.uuid();
        Pubnub.init({
          subscribe_key,
          auth_key,
          heartbeat: pubnubHeartbeat,
          heartbeat_interval: (pubnubHeartbeat - 1)/2,
          uuid,
          ssl: true,
          windowing: 2000,  // combine notifications occurring within a 2000ms window for efficiency
        });

        console.log("pubnub uuid", uuid);

        pubnubIsInitialised = true;
      }
    };

    service.unsubscribe = function(channelSuffix) {
      notificationCallbacks.delete(channelSuffix);
      const channel = subscribedChannels.get(channelSuffix);
      channelStatus.set(channelSuffix, 'unsubscribing');  // causes an unsubscribe to occur after any in-progress subscribe completes
      if (channel) {
        Pubnub.unsubscribe({
          channel,
          callback: msg => {
            subscribedChannels.delete(channelSuffix);
            channelStatus.set(channelSuffix, 'unsubscribed');
          }
        });
      }
    };

    return service;
  });
