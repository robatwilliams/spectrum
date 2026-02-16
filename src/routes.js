// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import {
  Route,
  Switch,
  Redirect,
  withRouter,
  type Location,
  type History,
} from 'react-router';
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
  <Redirect to="/" />
));
const LoginFallback = signedOutFallback(() => <Redirect to="/" />, Login);
const CommunityLoginFallback = signedOutFallback(
  props => <Redirect to={`/${props.match.params.communitySlug}`} />,
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

export const RouteModalContext = React.createContext({
  isModal: false,
});

type Props = {
  currentUser: ?GetUserType,
  isLoadingCurrentUser: boolean,
  maintenanceMode?: boolean,
  location: Location,
  history: History,
};

type State = {
  navigationIsOpen: boolean,
};

class Routes extends React.Component<Props, State> {
  previousLocation = this.props.location;
  state = { navigationIsOpen: false };

  setNavigationIsOpen = (val: boolean) =>
    this.setState({ navigationIsOpen: val });

  render() {
    const { currentUser, isLoadingCurrentUser } = this.props;
    const { navigationIsOpen } = this.state;
    const { title, description } = generateMetaInfo();

    if (this.props.maintenanceMode) {
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

    const { location } = this.props;
    const isModal = false; /* !!(
      location.state &&
      location.state.modal &&
      this.previousLocation !== location
    ); // not initial render */

    // allows any UI in the tree to open or close the side navigation on mobile
    const navigationContext = {
      navigationIsOpen,
      setNavigationIsOpen: this.setNavigationIsOpen,
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
                component={props => (
                  <ThreadSlider
                    previousLocation={this.previousLocation}
                    {...props}
                  />
                )}
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
                <Route>
                  <Navigation />
                </Route>
                <Route>
                  <GlobalTitlebar />
                </Route>

                <div css={isModal ? { overflow: 'hidden' } : {}}>
                  {/*
                    switch only renders the first match. Subrouting happens downstream
                    https://reacttraining.com/react-router/web/api/Switch
                  */}
                  <Switch location={isModal ? this.previousLocation : location}>
                    <Route exact path="/">
                      <HomeViewRedirectFallback />
                    </Route>
                    <Route exact path="/home">
                      <HomeFallback />
                    </Route>

                    {/* Public Business Pages */}
                    <Route path="/about">
                      <Pages />
                    </Route>
                    <Route path="/contact">
                      <Pages />
                    </Route>
                    <Route path="/terms">
                      <Pages />
                    </Route>
                    <Route path="/privacy">
                      <Pages />
                    </Route>
                    <Route path="/terms.html">
                      <Pages />
                    </Route>
                    <Route path="/privacy.html">
                      <Pages />
                    </Route>
                    <Route path="/code-of-conduct">
                      <Pages />
                    </Route>
                    <Route path="/support">
                      <Pages />
                    </Route>
                    <Route path="/features">
                      <Pages />
                    </Route>
                    <Route path="/faq">
                      <Pages />
                    </Route>
                    <Route path="/apps">
                      <Pages />
                    </Route>

                    {/* App Pages */}
                    <Route path="/new/community">
                      <NewCommunityFallback />
                    </Route>
                    <Route path="/new/thread">
                      <ComposerFallback />
                    </Route>
                    <Route path="/new/search">
                      <Search />
                    </Route>
                    <Route path="/new/user">
                      <NewUserOnboarding />
                    </Route>
                    <Route path="/new/message">
                      <NewDirectMessageFallback />
                    </Route>

                    <Route
                      path="/new"
                      render={() => <Redirect to="/new/community" />}
                    />

                    <Route path="/login">
                      <LoginFallback />
                    </Route>
                    <Route path="/explore">
                      <Explore />
                    </Route>
                    <Route path="/messages/:threadId">
                      <MessagesFallback />
                    </Route>
                    <Route path="/messages">
                      <MessagesFallback />
                    </Route>
                    <Route path="/thread/:threadId">
                      <RedirectOldThreadRoute />
                    </Route>
                    <Route path="/thread" render={() => <Redirect to="/" />} />
                    <Route
                      exact
                      path="/users"
                      render={() => <Redirect to="/" />}
                    />
                    <Route exact path="/users/:username">
                      <UserView />
                    </Route>
                    <Route exact path="/users/:username/settings">
                      <UserSettingsFallback />
                    </Route>
                    <Route path="/notifications">
                      <NotificationsFallback />
                    </Route>

                    <Route
                      path="/me/settings"
                      render={() =>
                        currentUser && currentUser.username ? (
                          <Redirect
                            to={`/users/${currentUser.username}/settings`}
                          />
                        ) : currentUser && !currentUser.username ? (
                          <NewUserOnboarding />
                        ) : isLoadingCurrentUser ? null : (
                          <Login redirectPath={`${CLIENT_URL}/me/settings`} />
                        )
                      }
                    />
                    <Route
                      path="/me"
                      render={() =>
                        currentUser && currentUser.username ? (
                          <Redirect to={`/users/${currentUser.username}`} />
                        ) : isLoadingCurrentUser ? null : (
                          <Login redirectPath={`${CLIENT_URL}/me`} />
                        )
                      }
                    />

                    {/*
                        We check communitySlug last to ensure none of the above routes
                        pass. We handle null communitySlug values downstream by either
                        redirecting to home or showing a 404
                      */}
                    <Route path="/:communitySlug/:channelSlug/settings">
                      <ChannelSettingsFallback />
                    </Route>
                    <Route path="/:communitySlug/:channelSlug/join/:token">
                      <PrivateChannelJoin />
                    </Route>
                    <Route path="/:communitySlug/:channelSlug/join">
                      <PrivateChannelJoin />
                    </Route>
                    <Route path="/:communitySlug/settings">
                      <CommunitySettingsFallback />
                    </Route>
                    <Route path="/:communitySlug/join/:token">
                      <PrivateCommunityJoin />
                    </Route>
                    <Route path="/:communitySlug/login">
                      <CommunityLoginFallback />
                    </Route>
                    <Route
                      // NOTE(@mxstbr): This custom path regexp matches threadId correctly in all cases, no matter if we prepend it with a custom slug or not.
                      // Imagine our threadId is "id-123-id" (similar in shape to an actual UUID)
                      // - /id-123-id => id-123-id, easy start that works
                      // - /some-custom-slug~id-123-id => id-123-id, custom slug also works
                      // - /~id-123-id => id-123-id => id-123-id, empty custom slug also works
                      // - /some~custom~slug~id-123-id => id-123-id, custom slug with delimiter char in it (~) also works! :tada:
                      path="/:communitySlug/:channelSlug/(.*~)?:threadId"
                    >
                      <ThreadView />
                    </Route>
                    <Route path="/:communitySlug/:channelSlug">
                      <ChannelView />
                    </Route>
                    <Route path="/:communitySlug">
                      <CommunityView />
                    </Route>
                  </Switch>
                </div>

                {isModal && (
                  <Route path="/thread/:threadId">
                    <RedirectOldThreadRoute />
                  </Route>
                )}

                {isModal && (
                  <Route
                    path="/new/thread"
                    render={props => (
                      <ComposerFallback
                        {...props}
                        previousLocation={this.previousLocation}
                        isModal
                      />
                    )}
                  />
                )}

                {isModal && (
                  <Route
                    path="/new/message"
                    render={props => (
                      <NewDirectMessageFallback
                        {...props}
                        previousLocation={this.previousLocation}
                        isModal
                      />
                    )}
                  />
                )}
              </AppViewWrapper>
            </RouteModalContext.Provider>
          </NavigationContext.Provider>
        </ThemeProvider>
      </ErrorBoundary>
    );
  }
}

export default compose(
  withCurrentUser,
  withRouter
)(Routes);
