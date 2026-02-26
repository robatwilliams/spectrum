// @flow
//
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import addCommunityMemberWithTokenMutation from 'shared/graphql/mutations/communityMember/addCommunityMemberWithToken';
import { addToastWithTimeout } from 'src/actions/toasts';
import CommunityLogin from 'src/views/communityLogin';
import { CLIENT_URL } from 'src/api/constants';
import { withCurrentUser } from 'src/components/withCurrentUser';
import { ErrorView, LoadingView } from 'src/views/viewHelpers';

type Props = {
  match: Object,
  location: Object,
  history: Object,
  addCommunityMemberWithToken: Function,
  currentUser: Object,
  dispatch: Function,
};

const PrivateCommunityJoin = (props: Props) => {
  const {
    match,
    history,
    addCommunityMemberWithToken,
    currentUser,
    dispatch,
  } = props;

  const [isLoading, setIsLoading] = React.useState(false);

  const handleJoin = () => {
    const { token, communitySlug } = match.params;

    setIsLoading(true);

    addCommunityMemberWithToken({ communitySlug, token })
      .then(() => {
        setIsLoading(false);
        dispatch(addToastWithTimeout('success', 'Welcome!'));
        return history.replace(`/${communitySlug}`);
      })
      .catch(err => {
        setIsLoading(false);
        dispatch(addToastWithTimeout('error', err.message));
        return history.replace(`/${communitySlug}`);
      });
  };

  React.useEffect(() => {
    const { token, communitySlug } = match.params;

    if (!token) {
      return history.replace(`/${communitySlug}`);
    }

    if (!currentUser) {
      return;
    }

    return handleJoin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prevCurrentUserRef = React.useRef(null);
  React.useEffect(() => {
    const prevCurrentUser = prevCurrentUserRef.current;
    prevCurrentUserRef.current = currentUser;

    if (!prevCurrentUser && currentUser) {
      return handleJoin();
    }
  });

  const {
    params: { communitySlug, token },
  } = match;

  const redirectPath = `${CLIENT_URL}/${communitySlug}/join/${token}`;

  if (!currentUser || !currentUser.id) {
    return <CommunityLogin match={match} redirectPath={redirectPath} />;
  }

  if (isLoading) return <LoadingView />;

  return <ErrorView />;
};

export default compose(
  withCurrentUser,
  addCommunityMemberWithTokenMutation,
  connect()
)(PrivateCommunityJoin);
