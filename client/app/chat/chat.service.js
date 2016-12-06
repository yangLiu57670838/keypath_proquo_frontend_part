'use strict';

class ChatService {
  constructor($mdDialog, $q, modalService, Auth, Chat, Business, Notifications) {
    this._dialog = $mdDialog;
    this.$q = $q;
    this._modalService = modalService;
    this._Auth = Auth;
    this._Chat = Chat;
    this._Business = Business;
    this.chatModalOpened = false;
    this._Notifications = Notifications;
  }

  /**
   * Creates a new chat with the other party.
   *
   * For now we can limit to one chat per couple, so if I try to engage the same person again it opens the same chat.
   *
   * @return A promise of the chat dialog that is resolved or rejected when the dialog closed.
   */
  startChat(otherUserId) {
    if (!otherUserId) {
      console.error("otherUserId is not available");
      return;
    }

    return this._Auth.refresh().then(user => {
      // After we done what we need to we call openChat with the chat id
      if (!user || !user._id) {
        this._modalService.showLoginModal();
        return;
      }

      if (!user.emailValidated) {
        this._modalService.showEmailVerificationModal();
        return;
      }

      const query = { filter: JSON.stringify({ collaborators: [user._id, otherUserId] }) };
      return this._Chat.query(query).$promise.then(chats => {
        return chats.length > 0 ? this.openChat(chats[0]) : this.createNewChat(otherUserId)
      });
    });
  }

  // Opens an existing chat maybe from notifications screen
  openChat(chat) {
    return this._dialog.show({
      controller: 'ChatCtrl',
      controllerAs: 'vm',
      templateUrl: 'app/chat/chat.html',
      // parent: angular.element(document.body),
      // targetEvent: $event,
      clickOutsideToClose: true, // At least until we have a close button
      // hasBackdrop: true,
      onComplete: () =>{
        this._Notifications.bulk({ filter: JSON.stringify({ entity: 'Chat', entityId: chat._id }) }, { notificationClicked: true, notificationSeen: true });
      },
      locals: { chat: chat }
    });
  }

  createNewChat(otherUserId) {
    const otherBusinessQuery = { filter: JSON.stringify({ userId: otherUserId }) };
    const myBusinessP = this._Business.mine().$promise,
      otherBusinessP = this._Business.query(otherBusinessQuery).$promise;

    return this.$q.all([myBusinessP, otherBusinessP]).then(([myBusiness, otherBusinesses]) => {
      const otherBusiness = _.head(otherBusinesses);
      if (!myBusiness || !otherBusiness) return this.$q.reject();

      return this._Chat.save(newChatModel(myBusiness, otherBusiness)).$promise
        .then(chat => chat && this.openChat(chat));
    });

    function newChatModel(myBusiness, otherBusiness) {
      return {
        collaborators: [myBusiness.userId, otherBusiness.userId],
        // FIXME: everything below should be moved server-side instead for efficiency and security/robustness
        messageCount: 0,
        collaboratorUnseenMessageCounts: [
          {
            collaboratorId: myBusiness.userId,
            unseenMessageCount:0
          },
          {
            collaboratorId: otherBusiness.userId,
            unseenMessageCount:0
          }
        ],
        collaboratorDetails: [
          {
            firstName: myBusiness.primaryContactFirstName,
            lastName: myBusiness.primaryContactLastName,
            avatarUrl: myBusiness.primaryContactAvatarUrl,
            businessName: myBusiness.name,
            businessLogoUrl: myBusiness.businessLogoUrl,
            businessLocation:myBusiness.formattedAddress,
            businessId: myBusiness._id
          },
          {
            firstName: otherBusiness.primaryContactFirstName,
            lastName: otherBusiness.primaryContactLastName,
            avatarUrl: otherBusiness.primaryContactAvatarUrl,
            businessName: otherBusiness.name,
            businessLogoUrl: otherBusiness.businessLogoUrl,
            businessLocation:otherBusiness.formattedAddress,
            businessId: otherBusiness._id
          }
        ]
      };
    }
  }
}

angular.module('digitalVillageApp')
  .service('ChatService', ChatService);

angular.module('digitalVillageApp')
  .factory('Chat', function ($resource) {
    return $resource('/api/chats/:id',
      {
        id: '@id'
      },
      {
        update: {method: 'PUT'},
        read : {
          method: 'PUT',
          url: '/api/chats/:id/read'
        }
      }
    );
  });
