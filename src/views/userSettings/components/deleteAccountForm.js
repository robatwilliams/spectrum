// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { addToastWithTimeout } from 'src/actions/toasts';
import {
  SectionCard,
  SectionTitle,
  SectionSubtitle,
  SectionCardFooter,
} from 'src/components/settingsViews/style';
import { Notice } from 'src/components/listItems/style';
import {
  getCurrentUserCommunityConnection,
  type GetUserCommunityConnectionType,
} from 'shared/graphql/queries/user/getUserCommunityConnection';
import viewNetworkHandler from 'src/components/viewNetworkHandler';
import {
  HoverWarnOutlineButton,
  WarnButton,
  OutlineButton,
} from 'src/components/button';
import deleteCurrentUserMutation from 'shared/graphql/mutations/user/deleteCurrentUser';
import { SERVER_URL } from 'src/api/constants';
import { Link } from 'react-router-dom';
import { Loading } from 'src/components/loading';
import type { Dispatch } from 'redux';

type Props = {
  isLoading: boolean,
  deleteCurrentUser: Function,
  dispatch: Dispatch<Object>,
  data: {
    user: GetUserCommunityConnectionType,
  },
};

const DeleteAccountForm = (props: Props) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [deleteInited, setDeleteInited] = React.useState(false);
  const [ownsCommunities, setOwnsCommunities] = React.useState(false);
  const { dispatch, deleteCurrentUser, data } = props;

  React.useEffect(() => {
    if (data.user && data.user.id) {
      if (data.user && data.user.communityConnection) {
        setOwnsCommunities(
          data.user.communityConnection.edges.some(
            c => c && c.node.communityPermissions.isOwner
          )
        );
      }
    }
  }, [data.user]);

  const initDelete = () => {
    setDeleteInited(true);
  };

  const cancelDelete = () => setDeleteInited(false);

  const confirmDelete = () => {
    setIsLoading(true);

    deleteCurrentUser()
      .then(() => dispatch(addToastWithTimeout('success', 'Account deleted')))
      .then(() => (window.location.href = `${SERVER_URL}/auth/logout`))
      .catch(err => dispatch(addToastWithTimeout('error', err.message)));
  };

  const { user } = data;

  if (user) {
    return (
      <SectionCard data-cy="delete-account-container">
        <SectionTitle>Delete my account</SectionTitle>
        <SectionSubtitle>
          You can delete your account at any time.{' '}
          <Link to={'/faq'}>Read more about how we delete accounts</Link>.
        </SectionSubtitle>

        {ownsCommunities && (
          <Notice data-cy="owns-communities-notice">
            You currently own communities on Spectrum. When your account is
            deleted these communities will not be deleted. Spectrum reserves the
            right to manage your communities after your account is deleted.
          </Notice>
        )}

        <SectionCardFooter>
          {deleteInited ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              {!isLoading && (
                <OutlineButton
                  data-cy="delete-account-cancel-button"
                  onClick={cancelDelete}
                  style={{ marginBottom: '16px', alignSelf: 'stretch' }}
                >
                  Cancel
                </OutlineButton>
              )}
              <WarnButton
                data-cy="delete-account-confirm-button"
                loading={isLoading}
                onClick={confirmDelete}
              >
                {isLoading ? 'Deleting...' : 'Confirm and delete my account'}
              </WarnButton>
            </div>
          ) : (
            <HoverWarnOutlineButton
              data-cy="delete-account-init-button"
              color={'warn.default'}
              onClick={initDelete}
            >
              Delete my account
            </HoverWarnOutlineButton>
          )}
        </SectionCardFooter>
      </SectionCard>
    );
  }

  if (props.isLoading) {
    return (
      <SectionCard>
        <Loading />
      </SectionCard>
    );
  }

  return null;
};
