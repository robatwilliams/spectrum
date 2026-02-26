// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withApollo, type Client } from 'react-apollo';
import { Manager, Reference, Popper } from 'react-popper';
import { createPortal } from 'react-dom';
import { withCurrentUser } from 'src/components/withCurrentUser';
import LoadingHoverProfile from './loadingHoverProfile';
import UserProfile from './userProfile';
import { Span, PopperWrapper } from './style';
import {
  getUserByUsername,
  getUserByUsernameQuery,
} from 'shared/graphql/queries/user/getUser';

const MentionHoverProfile = getUserByUsername(props => {
  if (props.data && props.data.user) {
    return (
      <UserProfile ref={props.ref} user={props.data.user} style={props.style} />
    );
  }

  if (props.data && props.data.loading) {
    return <LoadingHoverProfile style={props.style} ref={props.ref} />;
  }

  return null;
});

type Props = {
  children: any,
  username: string,
  currentUser: ?Object,
  style?: Object,
  client: Client,
};

const UserHoverProfileWrapper = (props: Props) => {
  const { children, currentUser, username, style = {}, client } = props;
  
  const [visible, setVisible] = React.useState(false);
  const isMountedRef = React.useRef();
  const timeoutRef = React.useRef();

  React.useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleMouseEnter = () => {
    if (!isMountedRef.current) return;

    client
      .query({
        query: getUserByUsernameQuery,
        variables: { username },
      })
      .then(() => {
        if (!isMountedRef.current) return;
      });

    const ref = setTimeout(() => {
      if (isMountedRef.current) {
        return setVisible(true);
      }
    }, 500);
    timeoutRef.current = ref;
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isMountedRef.current && visible) {
      setVisible(false);
    }
  };

  const me = currentUser && currentUser.username === username;

  return (
    <Span
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
    >
      <Manager tag={false}>
        <Reference>
          {({ ref }) => (
            <div ref={ref} style={style}>
              {children}
            </div>
          )}
        </Reference>
        {visible &&
          document.body &&
          createPortal(
            <Popper
              placement="bottom-start"
              modifiers={{
                flip: {
                  enabled: true,
                },
                preventOverflow: {
                  enabled: true,
                  padding: 25,
                },
              }}
            >
              {({ style, ref, placement }) => (
                <PopperWrapper
                  ref={ref}
                  popperStyle={style}
                  data-placement={placement}
                >
                  <MentionHoverProfile username={username} me={me} />
                </PopperWrapper>
              )}
            </Popper>,
            document.body
          )}
      </Manager>
    </Span>
  );
};

export default compose(
  withCurrentUser,
  withApollo,
  connect()
)(UserHoverProfileWrapper);
