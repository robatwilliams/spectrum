# PR #1 File Mapping for Split PRs

This document provides the exact file lists for each proposed split PR.

## PR 1.1: Infrastructure & Configuration Updates (3 files)

```
.github/agents-support/next-tooling-port.txt
.github/instructions/dev-server.instructions.md
package.json
```

## PR 1.2: Admin Panel Components (19 files)

```
admin/src/components/formElements/index.js
admin/src/components/icons/index.js
admin/src/components/titlebar/index.js
admin/src/utils/routeAuth.js
admin/src/views/communities/components/communityList/index.js
admin/src/views/communities/components/communitySettings/index.js
admin/src/views/communities/components/search/index.js
admin/src/views/communities/containers/community.js
admin/src/views/communities/index.js
admin/src/views/dashboard/components/coreMetrics.js
admin/src/views/dashboard/index.js
admin/src/views/navbar/index.js
admin/src/views/threads/components/threadListItem.js
admin/src/views/threads/components/topThreads.js
admin/src/views/threads/index.js
admin/src/views/users/components/search/index.js
admin/src/views/users/components/userCommunitySettings/index.js
admin/src/views/users/containers/user.js
admin/src/views/users/index.js
```

## PR 1.3: Core Shared Components Part 1 (~35 files)

### Avatar Components
```
src/components/avatar/communityAvatar.js
src/components/avatar/image.js
src/components/avatar/userAvatar.js
```

### Basic UI Components
```
src/components/badges/index.js
src/components/error/SettingsFallback.js
src/components/formElements/index.js
src/components/icon/index.js
src/components/gallery/browser.js
src/components/gallery/index.js
src/components/goop/index.js
src/components/githubProfile/index.js
```

### List Components
```
src/components/listItems/channel.js
src/components/listItems/index.js
```

### Utility Components
```
src/components/announcementBanner/index.js
src/components/appViewWrapper/index.js
src/components/desktopAppUpsell/index.js
src/components/fullscreenView/index.js
src/components/loginButtonSet/index.js
src/components/menu/index.js
src/components/outsideClickHandler/index.js
src/components/profile/index.js
src/components/reaction/index.js
src/components/redirectHandler/index.js
src/components/reputation/index.js
src/components/rich-text-editor/index.js
src/components/scrollManager/index.js
src/components/scrollRow/index.js
src/components/settingsViews/overview.js
src/components/settingsViews/style.js
src/components/threadFeed/index.js
src/components/threadLikes/index.js
src/components/toggleChannelMembership/index.js
src/components/toggleChannelNotifications/index.js
src/components/userEmailConfirmation/index.js
src/components/usernameSearch/index.js
src/components/viewError/index.js
src/components/withCurrentUser/index.js
```

## PR 1.4: Core Shared Components Part 2 (~34 files)

### Chat/Message Components
```
src/components/chatInput/components/mediaUploader.js
src/components/message/index.js
src/components/message/view.js
src/components/message/threadAttachment/index.js
```

### Complex Form Components
```
src/components/composer/index.js
src/components/emailInvitationForm/index.js
```

### Hover Profile Components
```
src/components/hoverProfile/channelProfile.js
src/components/hoverProfile/communityProfile.js
src/components/hoverProfile/loadingHoverProfile.js
src/components/hoverProfile/userContainer.js
src/components/hoverProfile/userProfile.js
```

### Inbox/Thread Components
```
src/components/inboxThread/activity.js
src/components/inboxThread/header/index.js
src/components/inboxThread/header/threadHeader.js
src/components/inboxThread/header/timestamp.js
src/components/inboxThread/header/userProfileThreadHeader.js
src/components/inboxThread/index.js
src/components/inboxThread/participantList.js
src/components/inboxThread/threadCommunityBanner.js
```

### Modal Components
```
src/components/modals/BanUserModal/index.js
src/components/modals/ChangeChannelModal/index.js
src/components/modals/ChangeChannelModal/listOfChannels.js
src/components/modals/CloseComposerConfirmationModal/index.js
src/components/modals/CreateChannelModal/index.js
src/components/modals/DeleteDoubleCheckModal/index.js
src/components/modals/LoginModal/index.js
src/components/modals/RepExplainerModal/index.js
src/components/modals/ReportUserModal/index.js
src/components/modals/RestoreChannelModal/index.js
```

### Upsell Components
```
src/components/upsell/NullCard.js
src/components/upsell/UpsellCreateCommunity.js
src/components/upsell/UpsellReputationExplainer.js
```

## PR 1.5: User & Authentication Views (~25 files)

```
src/views/user/components/communityList.js
src/views/user/components/userCoverPhoto.js
src/views/user/index.js
src/views/user/index.tsx
src/views/userSettings/components/deleteAccountForm.js
src/views/userSettings/components/editForm.js
src/views/userSettings/components/emailSettings.js
src/views/userSettings/components/notificationSettings.js
src/views/userSettings/components/overview.js
src/views/userSettings/components/privateChannelList.js
src/views/userSettings/index.js
src/views/userSettings/index.tsx
src/views/authViewHandler/index.js
src/views/login/index.js
src/views/communityLogin/index.js
src/views/newUserOnboarding/index.js
src/views/newUserOnboarding/components/setUsername/index.js
```

## PR 1.6: Community Management Views (~30 files)

```
src/views/community/components/channelsList.js
src/views/community/components/membersList.js
src/views/community/components/pendingUsersNotification.js
src/views/community/index.js
src/views/community/index.tsx
src/views/communitySettings/components/administratorSettings.js
src/views/communitySettings/components/archiveForm.js
src/views/communitySettings/components/editForm.js
src/views/communitySettings/components/joinTokenSettings.js
src/views/communitySettings/components/joinTokenToggle.js
src/views/communitySettings/components/overview.js
src/views/communitySettings/components/resetJoinToken.js
src/views/communitySettings/components/slack/importData.js
src/views/communitySettings/components/slack/importForm.js
src/views/communitySettings/components/slack/importSettings.js
src/views/communitySettings/components/slack/teamSelection.js
src/views/communitySettings/components/slack/index.js
src/views/communitySettings/index.js
src/views/communitySettings/index.tsx
src/views/communityMembers/components/blockedUsers.js
src/views/communityMembers/components/editDropdown.js
src/views/communityMembers/components/list.js
src/views/communityMembers/components/pendingUsers.js
src/views/communityMembers/index.js
src/views/communityMembers/index.tsx
src/views/communityAnalytics/components/communityGrowthOverview.js
src/views/communityAnalytics/components/communityReportedContent.js
src/views/communityAnalytics/components/communityUserList.js
src/views/communityAnalytics/components/overview.js
src/views/communityAnalytics/components/topAndNewThreads.js
src/views/communityAnalytics/index.js
src/views/communityAnalytics/index.tsx
src/views/newCommunity/index.js
src/views/newCommunity/components/createCommunityForm/index.js
src/views/newCommunity/components/editCommunityForm/index.js
src/views/privateCommunityJoin/index.js
```

## PR 1.7: Channel Management Views (~25 files)

```
src/views/channel/components/MembersList.js
src/views/channel/components/pendingUsersNotification.js
src/views/channel/components/search.js
src/views/channel/index.js
src/views/channel/index.tsx
src/views/channelSettings/components/archiveForm.js
src/views/channelSettings/components/blockedUsers.js
src/views/channelSettings/components/channelMembers.js
src/views/channelSettings/components/editDropdown.js
src/views/channelSettings/components/editForm.js
src/views/channelSettings/components/joinTokenSettings.js
src/views/channelSettings/components/joinTokenToggle.js
src/views/channelSettings/components/overview.js
src/views/channelSettings/components/pendingUsers.js
src/views/channelSettings/components/resetJoinToken.js
src/views/channelSettings/index.js
src/views/channelSettings/index.tsx
src/views/privateChannelJoin/index.js
```

## PR 1.8: Thread, Messaging & Remaining Views (~35 files)

### Thread Views
```
src/views/thread/components/actionBar.js
src/views/thread/components/messages.js
src/views/thread/components/sidebarThreadDetail.js
src/views/thread/components/threadDetail.js
src/views/thread/components/desktopAppUpsell/index.js
src/views/thread/index.js
src/views/thread/index.tsx
```

### Direct Messages
```
src/views/directMessages/components/header.js
src/views/directMessages/components/messages.js
src/views/directMessages/components/threadsList.js
src/views/directMessages/containers/existingThread.js
src/views/directMessages/containers/newThread.js
src/views/directMessages/index.js
src/views/directMessages/index.tsx
```

### Notifications
```
src/views/notifications/components/newMessageNotification.js
src/views/notifications/components/newMentionNotification.js
src/views/notifications/components/newReactionNotification.js
src/views/notifications/components/newThreadNotification.js
src/views/notifications/components/newUserInCommunityNotification.js
src/views/notifications/components/privateChannelRequestApprovedNotification.js
src/views/notifications/components/privateCommunityRequestApprovedNotification.js
src/views/notifications/components/unread.js
src/views/notifications/components/usernameChanged.js
src/views/notifications/index.js
src/views/notifications/index.tsx
```

### Search & Explore
```
src/views/search/index.js
src/views/search/search.js
src/views/search/style.js
src/views/explore/index.js
src/views/explore/components/exploreCommunity.js
src/views/explore/components/exploreCommunityCard.js
```

### Static Pages
```
src/views/pages/index.js
src/views/pages/apps/index.js
src/views/pages/components/browsers.js
src/views/pages/faq/index.js
src/views/pages/features/index.js
src/views/pages/features/shared.js
src/views/pages/home/index.js
src/views/pages/privacy/index.js
src/views/pages/support/index.js
src/views/pages/terms/index.js
```

### Misc Views
```
src/views/status/index.js
src/views/queryParamToastDispatcher/index.js
src/index.tsx
```

---

## How to Use This Document

1. **Creating a split PR**: Copy the relevant file list from the section above
2. **Cherry-picking changes**: Use `git checkout fully-featured-class-components -- <file>` for each file
3. **Verification**: Compare the file count in your PR with the count listed here
4. **Cross-reference**: Use this with the main splitting plan document for context

## Notes

- File counts are approximate and based on the current state of PR #1
- Some files may have dependencies on others (check the main plan for recommendations)
- Test files (if any) should be included with their corresponding component files
