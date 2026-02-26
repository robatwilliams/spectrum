// @flow
import * as React from 'react';
import { useEffect, useRef } from 'react';
import compose from 'recompose/compose';
import { withCurrentUser } from 'src/components/withCurrentUser';
import { history } from 'src/helpers/history';
import queryString from 'query-string';
import Routes from 'src/hot-routes';

type Props = {
  currentUser: ?Object,
  isLoadingCurrentUser: boolean,
  maintenanceMode: boolean,
};

const RedirectHandler = (props: Props) => {
  const prevIsLoadingCurrentUser = useRef(props.isLoadingCurrentUser);

  useEffect(() => {
    const params = queryString.parse(history.location.search);
    const doneFetching =
      prevIsLoadingCurrentUser.current && !props.isLoadingCurrentUser;

    if (doneFetching) {
      // Redirect ?t=asdfxyz to the thread view only for anonymous users who wouldn't see it
      // in their inbox view (since they don't have an inbox view)
      if (!props.currentUser && params.t) {
        history.replace(`/thread/${params.t}`);
      }
    }

    prevIsLoadingCurrentUser.current = props.isLoadingCurrentUser;
  }, [props.isLoadingCurrentUser, props.currentUser]);

  return <Routes maintenanceMode={props.maintenanceMode} />;
};

export default compose(withCurrentUser)(RedirectHandler);
