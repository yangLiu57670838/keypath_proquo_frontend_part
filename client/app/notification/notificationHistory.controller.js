'use strict';

class NotificationHistoryCtrl {
  createViewModelFromNotification(notification) {
    return {
      isNotification: true,
      id: notification._id,
      entity: notification.entity,      // N.B. this is the entity to which the notification relates (e.g. 'Chat' or 'Project')
      entityId: notification.entityId,
      checked: notification.notificationClicked,
      head: this.profileForOtherCollaborator(notification),
      content: {
        subject: notification.notificationSubject,
        body: notification.notificationBody,
        clickCB: () => {
          // work around an angular 1.4.x (or ui-router? still broken as of 1.0.0-alpha5) bug that occurs when this.notificationViewModels
          // is refreshed: ui-sref's generated href ends up on the wrong DOM element, resulting in mis-navigation
          this.$state.go(...parseStateRef(notification.state || 'notifications'));

          this._Notifications.update({id: notification._id}, {notificationClicked: true});
        }
      },
      tail: {
        date: notification.createdAt,
      }
    };

    // adapted from parseStateRef() in https://github.com/angular-ui/ui-router/blob/master/src/ng1/stateDirectives.ts
    function parseStateRef(ref) {
      const parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
      if (!parsed || parsed.length !== 4) throw new Error("Invalid state ref '" + ref + "'");
      const paramJSON = parsed[3] && parsed[3].replace(/([\w]+):/g, '"$1":');
      return [ parsed[1], paramJSON ? JSON.parse(paramJSON) : null ];
    }
  }

  createViewModelFromChat(chat) {
    const userUnseenMessageCount = chat.collaboratorUnseenMessageCounts.find(detail => detail.collaboratorId === this.user._id);
    const otherUserProfile = this.profileForOtherCollaborator(chat);
    return {
      isChat: true,
      id: chat._id,
      checked: userUnseenMessageCount && userUnseenMessageCount.unseenMessageCount == 0,
      head: otherUserProfile,
      content: {
        subject: otherUserProfile.firstName + " " + otherUserProfile.lastName,
        body: chat.lastMessage.message,
        clickCB: () => {
          this.$state.go('chats.chat', { chatId: chat._id });

          // set unseenMessageCount to 0 so the page can mark chat as read and remove unseen count,
          // the chat modal controller will call API to update backend model
          userUnseenMessageCount.unseenMessageCount = 0;
        }
      },
      tail: {
        date: chat.updatedAt,
        iconType: 'messageCount',
        iconValue: (userUnseenMessageCount && userUnseenMessageCount.unseenMessageCount) || 0
      }
    };
  }

  /**
   * Build a Business-like object for the other collaborator.
   *
   * @param obj Any object that contains a collaborators and collaboratorDetails properties.
   * @returns {{primaryContactAvatarUrl: *, businessLogoUrl: *, name: *, firstName: *, lastName: *, businessId: *}}
   */
  profileForOtherCollaborator(obj) {
    const otherCollaboratorIndex = obj.collaborators.findIndex(collaboratorId => collaboratorId !== this.user._id);
    const otherCollaboratorDetails = otherCollaboratorIndex >= 0 ? obj.collaboratorDetails[otherCollaboratorIndex] : {};
    // reconstitute into a Business-like object
    return {
      primaryContactAvatarUrl: otherCollaboratorDetails.avatarUrl,
      businessLogoUrl: otherCollaboratorDetails.businessLogoUrl,
      name: otherCollaboratorDetails.businessName,
      firstName: otherCollaboratorDetails.firstName,
      lastName: otherCollaboratorDetails.lastName,
      businessId: otherCollaboratorDetails.businessId
    };
  }

  getNotifications() {
    const query = {
      sort: 'createdAt:desc',
      pageSize: this.notificationsPagingOptions.pageSize,
      pageNum: this.notificationsPagingOptions.pageNum
    };
    this._Notifications.query(query, (notifications, responseHeaders) => {
      this.notificationsPagingOptions.totalRecord = responseHeaders('record-count');
      this.notificationViewModels = notifications.map(notification => this.createViewModelFromNotification(notification));

      if (this.chatIdToMarkAsSeenAndClicked) {
        this.markNotificationViewModelsAsSeenAndClickedForChat(this.chatIdToMarkAsSeenAndClicked);
        delete this.chatIdToMarkAsSeenAndClicked;
      }
    });
  }

  getChats() {
    const query = {
      sort: 'updatedAt:desc',
      pageSize: this.chatsPagingOptions.pageSize,
      pageNum: this.chatsPagingOptions.pageNum
    };
    this._Chat.query(query, (chats, responseHeaders) => {
      this.chatsPagingOptions.totalRecord = responseHeaders('record-count');
      this.chatViewModels = chats
        .filter(chat => chat.lastMessage != undefined)
        .map(chat => this.createViewModelFromChat(chat));

      // handle the case where state has transitioned from notifications to chats.chat and these chats are
      // loaded after the chat modal has already appeared
      if (this.chatDialogVisible) {
        this.clearChatCount(this.chatDialogVisible);
      }
    });
  }

  showChatModalForChat(chat) {
    const chatDialogPromise = this._ChatService.openChat(chat);
    if (chatDialogPromise) {
      this.chatDialogVisible = chat;

      const chatFinished = (result) => {
        delete this.chatDialogVisible;
        if (result) {
          this.$state.go(result.state, result.params);
        } else if (this.preChatStateAndParams) {
          this.$state.go(...this.preChatStateAndParams);
        }
      };
      chatDialogPromise.then(chatFinished, chatFinished);
    }
  }

  clearChatCount(chat) {
    // TODO: make the viewModel automatically update its iconValue based on the underlying chat
    const chatVM = this.chatViewModels.find(chatVM => chatVM.id === chat._id);
    if (chatVM) {
      chatVM.tail.iconValue = 0;
    }
  }

  showChatModalForChatId(chatId) {
    this._Chat.get({id: chatId}).$promise.then(chat => this.showChatModalForChat(chat));
  }

  changeNotificationsPage(index) {
    this.getNotifications();
  }

  changeChatsPage(index) {
    this.getChats();
  }

  markNotificationsAsSeen() {
    this._Notifications.bulk({}, {notificationSeen: true});
  }

  /**
   * Works around a potential race with chatFinished()'s marking of the chat's notifications as clicked and seen.
   *
   * @param chatId The ID of the chat whose notification view models will be marked as seen and clicked.
   */
  markNotificationViewModelsAsSeenAndClickedForChat(chatId) {
    this.notificationViewModels
      .filter(vm => vm.entity === 'Chat' && vm.entityId === chatId && !vm.checked)
      .forEach(vm => {
        vm.checked = true;
      });
  }

  refresh() {
    if (this.activeTab === 'notifications') {
      this.getNotifications();
    } else { // this.activeTab === 'chats'
      this.getChats();
    }
  }

  constructor(Auth, Business, Chat, Notifications, ChatService, $rootScope, $scope, $state) {
    this._Chat = Chat;
    this._ChatService = ChatService;
    this._Business = Business;
    this._Notifications = Notifications;
    this.$scope = $scope;
    this.$state = $state;

    this.activeTab = $state.current.data.activeTab;

    const paging = {
      pageLimitPerSection: 5,
      pageSize: 20,
      pageNum: 1,
      totalRecord: 0
    };

    let stateChangeSuccessHandler;
    switch (this.activeTab) {
      case 'chats':
        this.chatViewModels = []; // ensures clearChatCount() always has something to work with
        this.chatsPagingOptions = Object.assign({}, paging);          // new object used because totalRecord gets updated from time to time

        $scope.$on('$stateChangeStart', (event, to, toParams, from, fromParams) => {
          if (this.chatDialogVisible && from.name === 'chats.chat') {
            event.preventDefault(); // don't change state away from the chat dialog until the chat is finished: sticky state idiosyncrasy
          }
        });

        stateChangeSuccessHandler = (event, to, toParams, from, fromParams) => {
          if (to.name === 'chats.chat') {
            this.preChatStateAndParams = [from.name || 'chats', fromParams]; // so we can return after the chat finishes
            this.showChatModalForChatId(toParams.chatId);
          } else { // to.name === 'chats'
            this.preChatStateAndParams = undefined;
            $rootScope.$broadcast('refreshNotificationsCount');  // ensure the notifications bubble reflects the implicitly read chat notifications
          }
        };
        break;
      case 'notifications':
        this.notificationsPagingOptions = Object.assign({}, paging);  // new object used because totalRecord gets updated from time to time

        stateChangeSuccessHandler =  (event, to, toParams, from, fromParams) => {
          if (from.name === 'chats.chat') {
            if (this.notificationViewModels) {
              this.markNotificationViewModelsAsSeenAndClickedForChat(fromParams.chatId);
            } else {
              this.chatIdToMarkAsSeenAndClicked = fromParams.chatId; // defer until getNotifications() runs
            }
          }
        };
        break;
      default:
        console.log('NotificationHistoryCtrl: unexpected tab', this.activeTab);
    }

    $scope.$on('reloadNotifications', () => { this.refresh(); });
    $scope.$on('$stateChangeSuccess', stateChangeSuccessHandler);

    Auth.getCurrentUser().$promise.then(user => {
      const isLoggedIn = user && user.hasOwnProperty('roles');
      if (!isLoggedIn) return;

      this.user = user;
      if (this.activeTab === 'notifications') {
        $rootScope.$broadcast('reloadNotifications');  // load notifications and reset the notifications bubble
        this.markNotificationsAsSeen();
      } else { // this.activeTab === 'chats'
        this.refresh();
      }
    });
  }
}
angular.module('digitalVillageApp')
  .controller('NotificationHistoryCtrl', NotificationHistoryCtrl);
