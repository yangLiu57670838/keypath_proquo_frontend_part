class ChatController {
  constructor($mdDialog, $state, $scope, Auth, chat, Message, Notifications, Business, Chat, Project) {
    Auth.getCurrentUser((user => this.init($mdDialog, $state, $scope, chat, Message, Notifications, Business, Chat, Project, user)));
  }

  // Expect a chat id to be passed in here to the load the chat and messages

  init($mdDialog, $state, $scope, chat, Message, Notifications, Business, Chat, Project, user) {
    const messageChannelSuffix = 'msg';
    //injected Services
    this._Message = Message;
    this._Project = Project;
    this._Chat = Chat;
    this._Business = Business;
    this._$state = $state;
    this._$scope = $scope;
    this._$mdDialog = $mdDialog;
    this._Notifications = Notifications;

    //local variables
    this.today = moment();
    this.loadInProgress = false;
    this.user = user;
    this.chat = chat;
    this.pageNum = 1;
    this.pageSize = 10;
    this.sendingMessage = false;
    this.unassignedProjects = undefined;

    this._Project.query({
      filter: JSON.stringify({
        status: "common.draft",
        userId: this.user._id
      })
    }).$promise.then((projects) => {
      this.unassignedProjects = projects;
    });

    this.otherUserIndex = _.findIndex(chat.collaborators, (collaboratorId) => {
      return collaboratorId != this.user._id;
    });

    this.otherUserId = chat.collaborators[this.otherUserIndex];

    this.otherUserDetail = this.chat.collaboratorDetails[this.otherUserIndex];

    this.otherUserProfile = {
      primaryContactAvatarUrl: this.otherUserDetail.avatarUrl,
      businessLogoUrl: this.otherUserDetail.businessLogoUrl,
      name: this.otherUserDetail.businessName,
      firstName: this.otherUserDetail.firstName,
      lastName: this.otherUserDetail.lastName,
      businessId: this.otherUserDetail.businessId
    };

    //initial load
    this.loadMessages().$promise.then(messages => {
      this.loadInProgress = false;
      messages.map(message => this.generateDateAndTime(message));
      this.messages = this.reverseMessages(messages);
      this.loadInProgress = false;
      _.delay(function () {
        $('.chat-dialog-content').scrollTop(document.getElementById("chat-dialog-body").scrollHeight);
        $('#chat-input-area').focus();
      }, 500);
    });

    this._Notifications.subscribe(messageChannelSuffix, message => {
      this._$scope.$apply(() => {
        if (message.chatId && message.chatId === this.chat._id) {
          this.generateDateAndTime(message);
          this.messages.push(message);
          _.delay(function () {
            $('.chat-dialog-content').scrollTop(document.getElementById("chat-dialog-body").scrollHeight);
          }, 500);
        }
      });
    });

    this._$scope.$on('$destroy', event => {
      this._Notifications.unsubscribe(messageChannelSuffix);
      this.clearUnseenCountAndUpdateServer();
    });

    _.delay(() => {
      var contentContainer = angular.element(document.getElementsByClassName("chat-dialog-content"));
      contentContainer.on('scroll', () => {
        if (contentContainer[0].scrollTop <= 0 && this.loadInProgress == false) {
          //scroll reaches the top, load more messages
          if (this.messages.length % this.pageSize == 0 && this.messages.length != 0) {
            //previous load had 10 messages loaded back, load next page
            this.pageNum += 1;
            this.loadMessages().$promise.then((messages) => {
              messages.map(message => {
                this.generateDateAndTime(message);
                _(this.messages).unshift(message);
              });
            });
          }
          this.loadInProgress = false;
        }
      });
    }, 500);

    this.clearUnseenCount();
  }

  reverseMessages(messages) {
    return _(messages).reverse();
  }

  loadMessages() {
    this.loadInProgress = true;
    let query = {};
    query.filter = JSON.stringify({chatId: this.chat._id});
    query.pageSize = this.pageSize;
    query.pageNum = this.pageNum;
    query.sort = "createdAt:desc";
    return this._Message.query(query);
  }

  /**
   * send chat message and push message to local message array
   */
  sendMessage() {
    if (!_.isEmpty(this.newMessage) && !this.sendingMessage) {
      this.sendingMessage = true;
      this.newMessage = this.newMessage.replace(/\n/g, '<br/>');
      this._Message.save({id: this.chat._id}, {message: this.newMessage}).$promise.then((result) => {
        this.generateDateAndTime(result);
        this.messages.push(result);
        this.newMessage = "";
        this.sendingMessage = false;
        _.delay(function () {
          $('.chat-dialog-content').scrollTop(document.getElementById("chat-dialog-body").scrollHeight);
        }, 500);
      }, (error) => {
        this.sendingMessage = false;
      });
    }
  }

  generateDateAndTime(message) {
    const updatedDate = moment(message.updatedAt);
    message.displayTime = updatedDate.format("h:mmA");
    message.displayDate = updatedDate.format("ddd, D MMM YYYY");
  }


  cancel(result) {
    this._$mdDialog.cancel(result);
  }

  clearUnseenCount() {
    this.chat.collaboratorUnseenMessageCounts.map(detail => {
      if (detail.collaboratorId === this.user._id) {
        detail.unseenMessageCount = 0
      }
    });
  }

  clearUnseenCountAndUpdateServer() {
    this._Chat.read({id: this.chat._id});
  }

  openMenu($mdOpenMenu, ev) {
    $mdOpenMenu(ev);
  }

  sendExistingBrief(selectedProject) {
    selectedProject.brief.supplierId = this.otherUserDetail.businessId;

    this._Project.addSeller({id: selectedProject._id}, {
      userId: this.otherUserId,
      brief: {
        supplierId: this.otherUserDetail.businessId
      }
    }).$promise.then((result) => {
      this._$state.go("brief", {projectId: selectedProject._id});
      this.cancel({state: 'brief', params: {projectId: selectedProject._id}});
    });
  }
}

angular.module('digitalVillageApp')
  .controller('ChatCtrl', ChatController);
