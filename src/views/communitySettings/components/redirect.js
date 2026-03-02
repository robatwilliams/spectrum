// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { type GetCommunityType } from 'shared/graphql/queries/community/getCommunity';
import {
  SectionCard,
  SectionTitle,
  SectionSubtitle,
  SectionCardFooter,
} from 'src/components/settingsViews/style';
import { OutlineButton } from 'src/components/button';
import toggleCommunityRedirect from 'shared/graphql/mutations/community/toggleCommunityRedirect';
import toggleCommunityNoindex from 'shared/graphql/mutations/community/toggleCommunityNoindex';
import { addToastWithTimeout } from 'src/actions/toasts';
import type { Dispatch } from 'redux';

type Props = {
  community: GetCommunityType,
  toggleCommunityRedirect: Function,
  toggleCommunityNoindex: Function,
  dispatch: Dispatch<Object>,
};

const RedirectSettings = (props: Props) => {
  const [isLoadingRedirect, setIsLoadingRedirect] = React.useState(false);
  const [isLoadingNoindex, setIsLoadingNoindex] = React.useState(false);
  const {
    community,
    toggleCommunityRedirect,
    toggleCommunityNoindex,
    dispatch,
  } = props;

  const toggleRedirect = e => {
    e.preventDefault();

    setIsLoadingRedirect(true);

    return toggleCommunityRedirect(community.id)
      .then(() => {
        setIsLoadingRedirect(false);
        return dispatch(
          addToastWithTimeout('success', 'Community redirect setting saved')
        );
      })
      .catch(err => {
        setIsLoadingRedirect(false);
        return dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const toggleNoindexHandler = e => {
    e.preventDefault();

    setIsLoadingNoindex(true);

    return toggleCommunityNoindex(community.id)
      .then(() => {
        setIsLoadingNoindex(false);
        return dispatch(
          addToastWithTimeout('success', 'Community setting saved')
        );
      })
      .catch(err => {
        setIsLoadingNoindex(false);
        return dispatch(addToastWithTimeout('error', err.message));
      });
  };

  if (community) {
    return (
      <SectionCard data-cy="community-settings-redirect">
        <SectionTitle>Migrate your community elsewhere</SectionTitle>
        <SectionSubtitle style={{ marginTop: '8px' }}>
          Enabling this setting will redirect your community and channel pages
          to your community's website.
        </SectionSubtitle>
        <SectionSubtitle style={{ marginTop: '8px' }}>
          Existing conversations will stay accessible on Spectrum at their
          current URLs, but no new members can join and no new conversations can
          be created.
        </SectionSubtitle>
        <SectionSubtitle style={{ marginTop: '8px' }}>
          We recommend redirecting to a page that explains why users were
          redirected from Spectrum. For example, you can include a query param
          in your community website setting (e.g.{' '}
          <code>community.acme.com/?spectrum=true</code>) to show a special
          notice to users arriving there.
        </SectionSubtitle>
        <SectionCardFooter>
          <OutlineButton
            disabled={isLoadingRedirect}
            onClick={toggleRedirect}
            style={{ alignSelf: 'flex-start' }}
          >
            {isLoadingRedirect
              ? 'Loading...'
              : community.redirect
              ? 'Disable'
              : 'Enable'}
          </OutlineButton>
        </SectionCardFooter>
        {community.redirect && (
          <React.Fragment>
            <SectionCardFooter
              style={{ marginTop: '24px', paddingTop: '24px' }}
            >
              <SectionSubtitle>
                Optional: Prevent threads in my community from being indexed by
                search engines while redirection is active.
              </SectionSubtitle>
            </SectionCardFooter>
            <SectionCardFooter style={{ borderTop: '0', paddingTop: '0' }}>
              <OutlineButton
                disabled={isLoadingNoindex}
                onClick={toggleNoindexHandler}
                style={{ alignSelf: 'flex-start' }}
              >
                {isLoadingNoindex
                  ? 'Loading...'
                  : community.noindex
                  ? 'Disable'
                  : 'Enable'}
              </OutlineButton>
            </SectionCardFooter>
          </React.Fragment>
        )}
      </SectionCard>
    );
  }

  return null;
};

export default compose(
  toggleCommunityRedirect,
  toggleCommunityNoindex,
  connect()
)(RedirectSettings);
