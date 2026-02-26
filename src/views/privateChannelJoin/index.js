// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import joinChannelWithToken from 'shared/graphql/mutations/channel/joinChannelWithToken';
import { addToastWithTimeout } from 'src/actions/toasts';
import CommunityLogin from 'src/views/communityLogin';
import { CLIENT_URL } from 'src/api/constants';
import type { Dispatch } from 'redux';
import { withCurrentUser } from 'src/components/withCurrentUser';
import { LoadingView, ErrorView } from 'src/views/viewHelpers';

type Props = {
  match: Object,
  location: Object,
  history: Object,
  joinChannelWithToken: Function,
  currentUser: Object,
  dispatch: Dispatch<Object>,
};

const PrivateChannelJoin = (props: Props) => {
  const { match, history, currentUser, joinChannelWithToken, dispatch } = props;
  const [isLoading, setIsLoading] = React.useState(false);
  const prevCurrentUserRef = React.useRef();

  const handleJoin = () => {
    const { token, communitySlug, channelSlug } = match.params;

    setIsLoading(true);

    joinChannelWithToken({ channelSlug, token, communitySlug })
      .then(() => {
        setIsLoading(false);
        dispatch(addToastWithTimeout('success', 'Welcome!'));
        return history.push(`/${communitySlug}/${channelSlug}`);
      })
      .catch(err => {
        setIsLoading(false);
        dispatch(addToastWithTimeout('error', err.message));
        return history.push(`/${communitySlug}/${channelSlug}`);
      });
  };

  React.useEffect(() => {
    const { token, communitySlug, channelSlug } = match.params;

    if (!token) {
      return history.push(`/${communitySlug}/${channelSlug}`);
    }

    if (!currentUser) {
      return;
    }

    return handleJoin();
  }, []);

  React.useEffect(() => {
    const prevCurrentUser = prevCurrentUserRef.current;
    prevCurrentUserRef.current = currentUser;

    if (prevCurrentUser === undefined) {
      return;
    }

    if (!prevCurrentUser && currentUser) {
      return handleJoin();
    }
  }, [currentUser]);

  const {
    params: { communitySlug, channelSlug, token },
  } = match;

  const redirectPath = `${CLIENT_URL}/${communitySlug}/${channelSlug}/join/${token}`;

  if (!currentUser || !currentUser.id) {
    return <CommunityLogin match={match} redirectPath={redirectPath} />;
  }

  if (isLoading) return <LoadingView />;

  return <ErrorView />;
};

export default compose(
  withCurrentUser,
  joinChannelWithToken,
  connect()
)(PrivateChannelJoin);
