// @flow
import React from 'react';
import compose from 'recompose/compose';
import { useNavigate, useMatch } from 'react-router-dom';
import Tooltip from 'src/components/tooltip';
import { UserAvatar } from 'src/components/avatar';
import { isViewingMarketingPage } from 'src/helpers/is-viewing-marketing-page';
import { withCurrentUser } from 'src/components/withCurrentUser';
import {
  Overlay,
  NavigationWrapper,
  NavigationGrid,
  AvatarGrid,
  AvatarLink,
  Label,
  IconWrapper,
  Divider,
  DesktopMenuIconsCover,
} from './style';
import Icon from 'src/components/icon';
import NavHead from './navHead';
import DirectMessagesTab from './directMessagesTab';
import NotificationsTab from './notificationsTab';
import GlobalComposerTab from './globalComposerTab';
import { Skip, getAccessibilityActiveState } from './accessibility';
import CommunityList from './communityList';
import { NavigationContext } from 'src/helpers/navigation-context';
import { MIN_WIDTH_TO_EXPAND_NAVIGATION } from 'src/components/layout';

type Props = {
  currentUser?: Object,
  isLoadingCurrentUser: boolean,
};

const Navigation = (props: Props) => {
  const { currentUser, isLoadingCurrentUser } = props;
  const navigate = useNavigate();

  // Match hooks for all routes
  const aboutMatch = useMatch('/about');
  const featuresMatch = useMatch('/features');
  const supportMatch = useMatch('/support');
  const appsMatch = useMatch('/apps');
  const exploreMatch = useMatch('/explore');
  const loginMatch = useMatch('/login');
  const messagesMatch = useMatch('/messages');
  const notificationsMatch = useMatch('/notifications');
  const userMatch = useMatch('/users/:username');
  const newCommunityMatch = useMatch('/new/community');

  const isMarketingPage = isViewingMarketingPage(
    { location: window.location },
    currentUser
  );
  if (isMarketingPage) return null;
  const isWideViewport =
    window && window.innerWidth > MIN_WIDTH_TO_EXPAND_NAVIGATION;
  if (!isLoadingCurrentUser && !currentUser) {
    return (
      <NavigationContext.Consumer>
        {({ navigationIsOpen, setNavigationIsOpen }) => (
          <NavigationWrapper data-cy="navigation-bar" isOpen={navigationIsOpen}>
            <Overlay
              isOpen={navigationIsOpen}
              onClick={() => setNavigationIsOpen(false)}
            />

            <NavigationGrid isOpen={navigationIsOpen}>
              <DesktopMenuIconsCover />

              <Tooltip
                content="Home"
                placement={'left'}
                isEnabled={!isWideViewport}
              >
                <AvatarGrid isActive={!!aboutMatch}>
                  <AvatarLink
                    to={'/about'}
                    data-cy="navigation-home"
                    onClick={() => setNavigationIsOpen(false)}
                    {...getAccessibilityActiveState(!!aboutMatch)}
                  >
                    <IconWrapper>
                      <Icon glyph="logo" />
                    </IconWrapper>

                    <Label>Home</Label>
                  </AvatarLink>
                </AvatarGrid>
              </Tooltip>

              <Tooltip
                content="Features"
                placement={'left'}
                isEnabled={!isWideViewport}
              >
                <AvatarGrid isActive={!!featuresMatch}>
                  <AvatarLink
                    to={'/features'}
                    data-cy="navigation-features"
                    onClick={() => setNavigationIsOpen(false)}
                    {...getAccessibilityActiveState(!!featuresMatch)}
                  >
                    <IconWrapper>
                      <Icon glyph="announcement" />
                    </IconWrapper>

                    <Label>Features</Label>
                  </AvatarLink>
                </AvatarGrid>
              </Tooltip>

              <Tooltip
                content="Support"
                placement={'left'}
                isEnabled={!isWideViewport}
              >
                <AvatarGrid isActive={!!supportMatch}>
                  <AvatarLink
                    to={'/support'}
                    data-cy="navigation-support"
                    onClick={() => setNavigationIsOpen(false)}
                    {...getAccessibilityActiveState(!!supportMatch)}
                  >
                    <IconWrapper>
                      <Icon glyph="support" />
                    </IconWrapper>

                    <Label>Support</Label>
                  </AvatarLink>
                </AvatarGrid>
              </Tooltip>

              <Tooltip
                content="Apps"
                placement={'left'}
                isEnabled={!isWideViewport}
              >
                <AvatarGrid isActive={!!appsMatch}>
                  <AvatarLink
                    to={'/apps'}
                    data-cy="navigation-apps"
                    onClick={() => setNavigationIsOpen(false)}
                    {...getAccessibilityActiveState(!!appsMatch)}
                  >
                    <IconWrapper>
                      <Icon glyph="download" />
                    </IconWrapper>

                    <Label>Apps</Label>
                  </AvatarLink>
                </AvatarGrid>
              </Tooltip>

              <Tooltip
                content="Explore"
                placement={'left'}
                isEnabled={!isWideViewport}
              >
                <AvatarGrid isActive={!!exploreMatch}>
                  <AvatarLink
                    to={'/explore'}
                    data-cy="navigation-explore"
                    onClick={() => setNavigationIsOpen(false)}
                    {...getAccessibilityActiveState(!!exploreMatch)}
                  >
                    <IconWrapper>
                      <Icon glyph="explore" />
                    </IconWrapper>

                    <Label>Explore</Label>
                  </AvatarLink>
                </AvatarGrid>
              </Tooltip>

              <Divider />

              <Tooltip
                content="Log in or sign up"
                placement={'left'}
                isEnabled={!isWideViewport}
              >
                <AvatarGrid isActive={!!loginMatch}>
                  <AvatarLink
                    to={'/login'}
                    data-cy="navigation-login"
                    onClick={() => setNavigationIsOpen(false)}
                    {...getAccessibilityActiveState(!!loginMatch)}
                  >
                    <IconWrapper>
                      <Icon glyph="door-enter" />
                    </IconWrapper>

                    <Label>Log in or sign up</Label>
                  </AvatarLink>
                </AvatarGrid>
              </Tooltip>
            </NavigationGrid>
          </NavigationWrapper>
        )}
      </NavigationContext.Consumer>
    );
  }

  if (currentUser) {
    return (
      <NavigationContext.Consumer>
        {({ navigationIsOpen, setNavigationIsOpen }) => (
          <NavigationWrapper data-cy="navigation-bar" isOpen={navigationIsOpen}>
            <NavHead {...props} />
            <Skip />

            <Overlay
              isOpen={navigationIsOpen}
              onClick={() => setNavigationIsOpen(false)}
            />

            <NavigationGrid isOpen={navigationIsOpen}>
              <DesktopMenuIconsCover />
              <GlobalComposerTab />
              <DirectMessagesTab isActive={!!messagesMatch} />
              <NotificationsTab isActive={!!notificationsMatch} />

              <Tooltip
                content="Explore"
                placement={'left'}
                isEnabled={!isWideViewport}
              >
                <AvatarGrid
                  isActive={
                    exploreMatch && exploreMatch.pathname === '/explore'
                  }
                >
                  <AvatarLink
                    to={'/explore'}
                    data-cy="navigation-explore"
                    onClick={() => setNavigationIsOpen(false)}
                    {...getAccessibilityActiveState(
                      exploreMatch && exploreMatch.pathname === '/explore'
                    )}
                  >
                    <IconWrapper>
                      <Icon glyph="explore" />
                    </IconWrapper>

                    <Label>Explore</Label>
                  </AvatarLink>
                </AvatarGrid>
              </Tooltip>

              <Tooltip
                content="Profile"
                placement={'left'}
                isEnabled={!isWideViewport}
              >
                <AvatarGrid
                  isActive={
                    userMatch &&
                    userMatch.params &&
                    userMatch.params.username === currentUser.username
                  }
                  style={{ marginTop: '4px' }}
                >
                  <AvatarLink
                    to={'/me'}
                    data-cy="navigation-profile"
                    onClick={() => setNavigationIsOpen(false)}
                    {...getAccessibilityActiveState(
                      window.location.pathname ===
                        `/users/${currentUser.username}`
                    )}
                  >
                    <UserAvatar
                      size={32}
                      showOnlineStatus={false}
                      user={currentUser}
                      isClickable={false}
                      showHoverProfile={false}
                    />
                    <Label>Profile</Label>
                  </AvatarLink>
                </AvatarGrid>
              </Tooltip>

              <Divider />

              <CommunityList
                setNavigationIsOpen={setNavigationIsOpen}
                navigationIsOpen={navigationIsOpen}
                {...props}
              />

              {currentUser && (
                <React.Fragment>
                  <Divider />
                  <Tooltip
                    content="Create a community"
                    placement={'left'}
                    isEnabled={!isWideViewport}
                  >
                    <AvatarGrid
                      isActive={
                        newCommunityMatch &&
                        newCommunityMatch.pathname === '/new/community'
                      }
                    >
                      <AvatarLink
                        to={'/new/community'}
                        data-cy="navigation-new-community"
                        {...getAccessibilityActiveState(
                          newCommunityMatch &&
                            newCommunityMatch.pathname === '/new/community'
                        )}
                      >
                        <IconWrapper>
                          <Icon glyph="plus" />
                        </IconWrapper>

                        <Label>Create a community</Label>
                      </AvatarLink>
                    </AvatarGrid>
                  </Tooltip>
                </React.Fragment>
              )}
            </NavigationGrid>
          </NavigationWrapper>
        )}
      </NavigationContext.Consumer>
    );
  }

  return <NavigationWrapper />;
};

export default compose(withCurrentUser)(Navigation);
