// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import Loadable from 'react-loadable';
import { ErrorBoundary } from 'src/components/error';
import { CLIENT_URL } from './api/constants';
import generateMetaInfo from 'shared/generate-meta-info';
import GlobalStyles from './reset.css.js';
import { GlobalThreadAttachmentStyles } from 'src/components/message/threadAttachment/style';
import { theme } from 'shared/theme';
import AppViewWrapper from 'src/components/appViewWrapper';
import ScrollManager from 'src/components/scrollManager';
import Head from 'src/components/head';
import ModalRoot from 'src/components/modals/modalRoot';
import Gallery from 'src/components/gallery';
import Toasts from 'src/components/toasts';
import Composer from 'src/components/composer';
import signedOutFallback from 'src/helpers/signed-out-fallback';
import AnnouncementBanner from 'src/components/announcementBanner';
import PrivateChannelJoin from 'src/views/privateChannelJoin';
import PrivateCommunityJoin from 'src/views/privateCommunityJoin';
import ThreadSlider from 'src/views/threadSlider';
import Navigation from 'src/views/navigation';
import Status from 'src/views/status';
import Login from 'src/views/login';
import DirectMessages from 'src/views/directMessages';
import { ThreadView } from 'src/views/thread';
import { withCurrentUser } from 'src/components/withCurrentUser';
import Maintenance from 'src/components/maintenance';
import type { GetUserType } from 'shared/graphql/queries/user/getUser';
import RedirectOldThreadRoute from './views/thread/redirect-old-route';
import NewUserOnboarding from './views/newUserOnboarding';
import QueryParamToastDispatcher from './views/queryParamToastDispatcher';
import { LoadingView } from 'src/views/viewHelpers';
import GlobalTitlebar from 'src/views/globalTitlebar';
import NoUsernameHandler from 'src/views/authViewHandler/noUsernameHandler';
import { NavigationContext } from 'src/helpers/navigation-context';

const Explore = Loadable({
  loader: () => import('./views/explore' /* webpackChunkName: "Explore" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const UserView = Loadable({
  loader: () => import('./views/user'/* webpackChunkName: "UserView" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const CommunityView = Loadable({
  loader: () => import('./views/community'/* webpackChunkName: "CommunityView" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const CommunityLoginView = Loadable({
  loader: () => import('./views/communityLogin'/* webpackChunkName: "CommunityView" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const ChannelView = Loadable({
  loader: () => import('./views/channel'/* webpackChunkName: "ChannelView" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const HomeViewRedirect = Loadable({
  loader: () => import('./views/homeViewRedirect'/* webpackChunkName: "HomeViewRedirect" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const Notifications = Loadable({
  loader: () => import('./views/notifications'/* webpackChunkName: "Notifications" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const UserSettings = Loadable({
  loader: () => import('./views/userSettings'/* webpackChunkName: "UserSettings" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const CommunitySettings = Loadable({
  loader: () => import('./views/communitySettings'/* webpackChunkName: "communitySettings" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const ChannelSettings = Loadable({
  loader: () => import('./views/channelSettings'/* webpackChunkName: "channelSettings" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const NewCommunity = Loadable({
  loader: () => import('./views/newCommunity'/* webpackChunkName: "NewCommunity" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const NewDirectMessage = Loadable({
  loader: () => import('./views/newDirectMessage'/* webpackChunkName: "NewDirectMessage" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const Pages = Loadable({
  loader: () => import('./views/pages'/* webpackChunkName: "Splash" */),
  loading: ({ isLoading }) => isLoading && null,
});

/* prettier-ignore */
const Search = Loadable({
  loader: () => import('./views/search'/* webpackChunkName: "Search" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />,
});

/* prettier-ignore */
const ErrorFallback = Loadable({
  loader: () => import('./components/error'/* webpackChunkName: "Error" */),
  loading: ({ isLoading }) => isLoading && <LoadingView />
});

const HomeViewRedirectFallback = signedOutFallback(HomeViewRedirect, Pages);
const HomeFallback = signedOutFallback(HomeViewRedirect, () => (
  <Navigate to="/" />
));
const LoginFallback = signedOutFallback(() => <Navigate to="/" />, Login);
const CommunityLoginFallback = signedOutFallback(
  props => <Navigate to={`/${props.match.params.communitySlug}`} />,
  CommunityLoginView
);
const NewCommunityFallback = signedOutFallback(NewCommunity, () => (
  <Login redirectPath={`${CLIENT_URL}/new/community`} />
));
const NewDirectMessageFallback = signedOutFallback(NewDirectMessage, () => (
  <Login redirectPath={`${CLIENT_URL}/new/message`} />
));
const MessagesFallback = signedOutFallback(DirectMessages, () => (
  <Login redirectPath={`${CLIENT_URL}/messages`} />
));
const UserSettingsFallback = signedOutFallback(UserSettings, () => (
  <Login redirectPath={`${CLIENT_URL}/me/settings`} />
));
const CommunitySettingsFallback = signedOutFallback(CommunitySettings, () => (
  <Login />
));
const ChannelSettingsFallback = signedOutFallback(ChannelSettings, () => (
  <Login />
));
const NotificationsFallback = signedOutFallback(Notifications, () => (
  <Login redirectPath={`${CLIENT_URL}/notifications`} />
));
const ComposerFallback = signedOutFallback(Composer, () => (
  <Login redirectPath={`${CLIENT_URL}/new/thread`} />
));

// Wrapper components for /me routes that need current user context
const MeRedirect = ({ currentUser, isLoadingCurrentUser }) => {
  if (currentUser && currentUser.username) {
    return <Navigate to={`/users/${currentUser.username}`} replace />;
  }
  if (isLoadingCurrentUser) return null;
  return <Login redirectPath={`${CLIENT_URL}/me`} />;
};

const MeSettingsRedirect = ({ currentUser, isLoadingCurrentUser }) => {
  if (currentUser && currentUser.username) {
    return <Navigate to={`/users/${currentUser.username}/settings`} replace />;
  }
  if (currentUser && !currentUser.username) {
    return <NewUserOnboarding />;
  }
  if (isLoadingCurrentUser) return null;
  return <Login redirectPath={`${CLIENT_URL}/me/settings`} />;
};

export const RouteModalContext = React.createContext({
  isModal: false,
});

type Props = {
  currentUser: ?GetUserType,
  isLoadingCurrentUser: boolean,
  maintenanceMode?: boolean,
};

const AppRoutes = (props: Props) => {
  const { currentUser, isLoadingCurrentUser, maintenanceMode } = props;
  const location = useLocation();
  const [navigationIsOpen, setNavigationIsOpen] = React.useState(false);
  const previousLocationRef = React.useRef(location);

  // Track previous location for modal routing
  React.useEffect(() => {
    previousLocationRef.current = location;
  });

  const { title, description } = generateMetaInfo();

  if (maintenanceMode) {
    return (
      <ThemeProvider theme={theme}>
        <ScrollManager>
          <GlobalStyles />
          <Head
            title="Ongoing Maintenance - Spectrum"
            description="Spectrum is currently undergoing scheduled maintenance downtime. Please check https://twitter.com/withspectrum for ongoing updates."
          />
          <Maintenance />
        </ScrollManager>
      </ThemeProvider>
    );
  }

  const isModal = false; /* !!(
    location.state &&
    location.state.modal &&
    previousLocationRef.current !== location
  ); // not initial render */

  // allows any UI in the tree to open or close the side navigation on mobile
  const navigationContext = {
    navigationIsOpen,
    setNavigationIsOpen,
  };

  // allows any UI in the tree to know if it is existing within a modal or not
  // commonly used for background views to know that they are backgrounded
  const routeModalContext = { isModal };

  return (
    <ErrorBoundary fallbackComponent={ErrorFallback}>
      <ThemeProvider theme={theme}>
        <NavigationContext.Provider value={navigationContext}>
          {/* default meta tags, get overridden by anything further down the tree */}
          <Head title={title} description={description} />
          <GlobalStyles />
          <GlobalThreadAttachmentStyles />

          {/* dont let non-critical pieces of UI crash the whole app */}
          <ErrorBoundary>
            <Status />
          </ErrorBoundary>
          <ErrorBoundary>
            <Toasts />
          </ErrorBoundary>
          <ErrorBoundary>
            <Gallery />
          </ErrorBoundary>
          <ErrorBoundary>
            <ModalRoot />
          </ErrorBoundary>
          <ErrorBoundary>
            <QueryParamToastDispatcher />
          </ErrorBoundary>
          <ErrorBoundary>
            <AnnouncementBanner />
          </ErrorBoundary>

          {/* 
              while users should be able to browse communities/threads
              if they are signed out (eg signedOutFallback), they should not
              be allowed to use the app after signing up if they dont set a username.

              otherwise we can get into a state where people are sending DMs,
              sending messages, and posting threads without having a user profile
              that people can report or link to.

              this global component simply listens for users without a username
              to be authenticated, and if so forces a redirect to /new/user 
              prompting them to set a username
            */}
          <ErrorBoundary>
            <NoUsernameHandler currentUser={currentUser} />
          </ErrorBoundary>

          {isModal && (
            <Route
              // NOTE(@mxstbr): This custom path regexp matches threadId correctly in all cases, no matter if we prepend it with a custom slug or not.
              // Imagine our threadId is "id-123-id" (similar in shape to an actual UUID)
              // - /id-123-id => id-123-id, easy start that works
              // - /some-custom-slug~id-123-id => id-123-id, custom slug also works
              // - /~id-123-id => id-123-id => id-123-id, empty custom slug also works
              // - /some~custom~slug~id-123-id => id-123-id, custom slug with delimiter char in it (~) also works! :tada:
              path="/:communitySlug/:channelSlug/(.*~)?:threadId"
              element={
                <ThreadSlider previousLocation={previousLocationRef.current} />
              }
            />
          )}

          {/*
              this context provider allows children views to determine
              how they should behave if a modal is open. For example,
              you could tell a community view to not paginate the thread
              feed if a thread modal is open.
            */}
          <RouteModalContext.Provider value={routeModalContext}>
            {/*
                we tell the app view wrapper any time the modal state
                changes so that we can restore the scroll position to where
                it was before the modal was opened
              */}
            <AppViewWrapper {...routeModalContext}>
              <Navigation />
              <GlobalTitlebar />

              <div css={isModal ? { overflow: 'hidden' } : {}}>
                {/*
                    switch only renders the first match. Subrouting happens downstream
                    https://reacttraining.com/react-router/web/api/Switch
                  */}
                <Routes
                  location={isModal ? previousLocationRef.current : location}
                >
                  <Route path="/" element={<HomeViewRedirectFallback />} />
                  <Route path="/home" element={<HomeFallback />} />

                  {/* Public Business Pages */}
                  <Route path="/about" element={<Pages />} />
                  <Route path="/contact" element={<Pages />} />
                  <Route path="/terms" element={<Pages />} />
                  <Route path="/privacy" element={<Pages />} />
                  <Route path="/terms.html" element={<Pages />} />
                  <Route path="/privacy.html" element={<Pages />} />
                  <Route path="/code-of-conduct" element={<Pages />} />
                  <Route path="/support" element={<Pages />} />
                  <Route path="/features" element={<Pages />} />
                  <Route path="/faq" element={<Pages />} />
                  <Route path="/apps" element={<Pages />} />

                  {/* App Pages */}
                  <Route
                    path="/new/community"
                    element={<NewCommunityFallback />}
                  />
                  <Route path="/new/thread" element={<ComposerFallback />} />
                  <Route path="/new/search" element={<Search />} />
                  <Route path="/new/user" element={<NewUserOnboarding />} />
                  <Route
                    path="/new/message"
                    element={<NewDirectMessageFallback />}
                  />

                  <Route
                    path="/new"
                    element={<Navigate to="/new/community" replace />}
                  />

                  <Route path="/login" element={<LoginFallback />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route
                    path="/messages/:threadId"
                    element={<MessagesFallback />}
                  />
                  <Route path="/messages" element={<MessagesFallback />} />
                  <Route
                    path="/thread/:threadId"
                    element={<RedirectOldThreadRoute />}
                  />
                  <Route path="/thread" element={<Navigate to="/" replace />} />
                  <Route path="/users" element={<Navigate to="/" replace />} />
                  <Route path="/users/:username" element={<UserView />} />
                  <Route
                    path="/users/:username/settings"
                    element={<UserSettingsFallback />}
                  />
                  <Route
                    path="/notifications"
                    element={<NotificationsFallback />}
                  />

                  <Route
                    path="/me/settings"
                    element={
                      <MeSettingsRedirect
                        currentUser={currentUser}
                        isLoadingCurrentUser={isLoadingCurrentUser}
                      />
                    }
                  />
                  <Route
                    path="/me"
                    element={
                      <MeRedirect
                        currentUser={currentUser}
                        isLoadingCurrentUser={isLoadingCurrentUser}
                      />
                    }
                  />

                  {/*
                        We check communitySlug last to ensure none of the above routes
                        pass. We handle null communitySlug values downstream by either
                        redirecting to home or showing a 404
                      */}
                  <Route
                    path="/:communitySlug/:channelSlug/settings"
                    element={<ChannelSettingsFallback />}
                  />
                  <Route
                    path="/:communitySlug/:channelSlug/join/:token"
                    element={<PrivateChannelJoin />}
                  />
                  <Route
                    path="/:communitySlug/:channelSlug/join"
                    element={<PrivateChannelJoin />}
                  />
                  <Route
                    path="/:communitySlug/settings"
                    element={<CommunitySettingsFallback />}
                  />
                  <Route
                    path="/:communitySlug/join/:token"
                    element={<PrivateCommunityJoin />}
                  />
                  <Route
                    path="/:communitySlug/login"
                    element={<CommunityLoginFallback />}
                  />
                  <Route
                    // NOTE(@mxstbr): This custom path regexp matches threadId correctly in all cases, no matter if we prepend it with a custom slug or not.
                    // Imagine our threadId is "id-123-id" (similar in shape to an actual UUID)
                    // - /id-123-id => id-123-id, easy start that works
                    // - /some-custom-slug~id-123-id => id-123-id, custom slug also works
                    // - /~id-123-id => id-123-id => id-123-id, empty custom slug also works
                    // - /some~custom~slug~id-123-id => id-123-id, custom slug with delimiter char in it (~) also works! :tada:
                    path="/:communitySlug/:channelSlug/(.*~)?:threadId"
                    element={<ThreadView />}
                  />
                  <Route
                    path="/:communitySlug/:channelSlug"
                    element={<ChannelView />}
                  />
                  <Route path="/:communitySlug" element={<CommunityView />} />
                </Routes>
              </div>

              {isModal && (
                <Route
                  path="/thread/:threadId"
                  element={<RedirectOldThreadRoute />}
                />
              )}

              {isModal && (
                <Route
                  path="/new/thread"
                  element={
                    <ComposerFallback
                      previousLocation={previousLocationRef.current}
                      isModal
                    />
                  }
                />
              )}

              {isModal && (
                <Route
                  path="/new/message"
                  element={
                    <NewDirectMessageFallback
                      previousLocation={previousLocationRef.current}
                      isModal
                    />
                  }
                />
              )}
            </AppViewWrapper>
          </RouteModalContext.Provider>
        </NavigationContext.Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default compose(withCurrentUser)(AppRoutes);
