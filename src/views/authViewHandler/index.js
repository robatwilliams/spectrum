// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import compose from 'recompose/compose';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from 'shared/graphql/queries/user/getUser';
import type { GetUserType } from 'shared/graphql/queries/user/getUser';
import editUserMutation from 'shared/graphql/mutations/user/editUser';
import NewUserOnboarding from 'src/views/newUserOnboarding';

type Props = {
  navigate?: Function,
  location?: Object,
  editUser: Function,
  children: (authed: boolean) => React$Element<*>,
  data: {
    user: GetUserType,
    loading: boolean,
  },
};

class AuthViewHandler extends React.Component<Props> {
  componentDidUpdate(prev: Props) {
    const {
      data: { user },
      editUser,
      navigate,
      location,
    } = this.props;

    if (!prev.data.user && user) {
      if (!user.timezone) {
        const timezone = new Date().getTimezoneOffset() * -1;
        try {
          editUser({ timezone });
        } catch (err) {}
      }

      if (location && location.pathname === '/home' && navigate) {
        navigate('/', { replace: true });
      }
    }
  }

  render() {
    const {
      children,
      data: { user, loading },
    } = this.props;

    if (user && !user.username) return <NewUserOnboarding />;
    if (user && user.id) return children(true);
    if (loading) return null;
    return children(false);
  }
}

const AuthViewHandlerWrapper = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  return <AuthViewHandler {...props} navigate={navigate} location={location} />;
};

export default compose(
  getCurrentUser,
  editUserMutation,
  connect()
)(AuthViewHandlerWrapper);
