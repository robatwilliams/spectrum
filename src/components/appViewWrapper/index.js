// @flow
import React, { useRef, useLayoutEffect } from 'react';
import compose from 'recompose/compose';
import { withRouter, type History } from 'react-router';
import type { UserInfoType } from 'shared/graphql/fragments/user/userInfo';
import { withCurrentUser } from 'src/components/withCurrentUser';
import { isViewingMarketingPage } from 'src/helpers/is-viewing-marketing-page';
import { StyledAppViewWrapper } from './style';

type Props = {
  isModal: boolean,
  currentUser: ?UserInfoType,
  history: History,
  location: Object,
};

const AppViewWrapper = (props: Props) => {
  const ref = useRef(null);
  const prevScrollOffset = useRef(0);
  const prevIsModal = useRef(props.isModal);
  const snapshotRef = useRef(null);

  // getSnapshotBeforeUpdate equivalent - capture values before DOM updates
  useLayoutEffect(() => {
    const { isModal: currModal } = props;
    const prevModal = prevIsModal.current;

    /*
      If the user is going to open a modal, grab the current scroll
      offset of the main view the user is on and save it for now; we'll use
      the value to restore the scroll position after the user closes the modal
    */
    if (!prevModal && currModal && ref.current) {
      const offset = ref.current.scrollTop;
      prevScrollOffset.current = offset;
      // return 0 so that the modal starts out scrolled to the top by default
      snapshotRef.current = 0;
    } else if (prevModal && !currModal) {
      // the user is closing the modal, return the previous view's scroll offset
      snapshotRef.current = prevScrollOffset.current;
    } else {
      snapshotRef.current = null;
    }
  });

  // componentDidUpdate equivalent - apply updates after render
  useLayoutEffect(() => {
    /*
      If we have a snapshot value, the user has closed a modal and we need
      to return the user to where they were previously scrolled in the primary
      view
    */
    if (snapshotRef.current !== null && ref.current) {
      ref.current.scrollTop = snapshotRef.current;
    }

    prevIsModal.current = props.isModal;
  });

  const { currentUser, history, location } = props;

  const isMarketingPage = isViewingMarketingPage(history, currentUser);
  const isViewingExplore = location && location.pathname === '/explore';
  const isTwoColumn = isViewingExplore || !isMarketingPage;

  return (
    <StyledAppViewWrapper
      ref={ref}
      isTwoColumn={isTwoColumn}
      {...props}
    />
  );
};

export default compose(
  withRouter,
  withCurrentUser
)(AppViewWrapper);
