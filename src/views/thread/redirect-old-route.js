// @flow
// Redirect the old thread route (/thread/:threadId) to the new one (/:community/:channel/:threadId)
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getThreadByMatch } from 'shared/graphql/queries/thread/getThread';
import { ErrorView, LoadingView } from 'src/views/viewHelpers';
import getThreadLink from 'src/helpers/get-thread-link';

export default getThreadByMatch(props => {
  const { data, location } = props;
  if (data) {
    const { thread, loading, error } = data;

    if (thread && thread.id) {
      return <Navigate to={`${getThreadLink(thread)}`} replace />;
    }

    if (loading) {
      return <LoadingView />;
    }

    // If we don't have a thread, but also aren't loading anymore it's either a private or a non-existent thread
    if (error) {
      return <ErrorView />;
    }

    return <ErrorView data-cy="null-thread-view" />;
  }

  return null;
});
