// @flow
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import compose from 'recompose/compose';
import { withCurrentUser } from 'src/components/withCurrentUser';
import queryString from 'query-string';
import Routes from 'src/hot-routes';

type Props = {
  currentUser: ?Object,
  isLoadingCurrentUser: boolean,
  maintenanceMode: boolean,
};

const RedirectHandler = (props: Props) => {
  const { currentUser, isLoadingCurrentUser, maintenanceMode } = props;
  const navigate = useNavigate();
  const location = useLocation();
  const [hasCheckedLegacyParams, setHasCheckedLegacyParams] = useState(false);

  // Handle legacy ?thread=asdf & ?t=asdf URLs on initial load
  useEffect(() => {
    if (!hasCheckedLegacyParams) {
      const params = queryString.parse(location.search);
      const threadParam = params.thread || params.t;
      if (threadParam) {
        if (params.m) {
          navigate(`/thread/${threadParam}?m=${params.m}`, { replace: true });
        } else {
          navigate(`/thread/${threadParam}`, { replace: true });
        }
      }
      setHasCheckedLegacyParams(true);
    }
  }, [hasCheckedLegacyParams, location.search, navigate]);

  // Redirect ?t=asdfxyz to the thread view only for anonymous users
  useEffect(() => {
    if (!isLoadingCurrentUser) {
      const params = queryString.parse(location.search);
      if (!currentUser && params.t) {
        navigate(`/thread/${params.t}`, { replace: true });
      }
    }
  }, [currentUser, isLoadingCurrentUser, location.search, navigate]);

  return <Routes maintenanceMode={maintenanceMode} />;
};

export default compose(withCurrentUser)(RedirectHandler);
