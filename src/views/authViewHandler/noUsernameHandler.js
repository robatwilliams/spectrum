// @flow
import compose from 'recompose/compose';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  getCurrentUser,
  type GetUserType,
} from 'shared/graphql/queries/user/getUser';

type Props = {
  data: {
    user: ?GetUserType,
  },
};

const NoUsernameHandler = (props: Props) => {
  const { data } = props;
  const { user } = data;
  const location = useLocation();
  const navigate = useNavigate();
  if (!user) return null;
  if (user && user.username) return null;
  const { pathname, search } = location;
  if (pathname === '/new/user') return null;
  navigate('/new/user', {
    replace: true,
    state: { redirect: `${pathname}${search}` },
  });
  return null;
};

export default compose(getCurrentUser)(NoUsernameHandler);
