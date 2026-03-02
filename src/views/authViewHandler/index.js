// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { withRouter, type History, type Location } from 'react-router';
import { getCurrentUser } from 'shared/graphql/queries/user/getUser';
import type { GetUserType } from 'shared/graphql/queries/user/getUser';
import editUserMutation from 'shared/graphql/mutations/user/editUser';
import NewUserOnboarding from 'src/views/newUserOnboarding';

type Props = {
  history: History,
  location: Location,
  editUser: Function,
  children: (authed: boolean) => React$Element<*>,
  data: {
    user: GetUserType,
    loading: boolean,
  },
};

const AuthViewHandler = (props: Props) => {
  const prevUserRef = React.useRef();

  React.useEffect(() => {
    const {
      data: { user },
      editUser,
      history,
      location,
    } = props;

    if (!prevUserRef.current && user) {
      if (!user.timezone) {
        const timezone = new Date().getTimezoneOffset() * -1;
        try {
          editUser({ timezone });
        } catch (err) {}
      }

      if (location.pathname === '/home') history.replace('/');
    }

    prevUserRef.current = user;
  }, [props.data.user]);

  const {
    children,
    data: { user, loading },
  } = props;

  if (user && !user.username) return <NewUserOnboarding />;
  if (user && user.id) return children(true);
  if (loading) return null;
  return children(false);
};

export default compose(
  getCurrentUser,
  editUserMutation,
  withRouter,
  connect()
)(AuthViewHandler);
