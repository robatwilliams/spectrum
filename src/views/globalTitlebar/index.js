// @flow
import React from 'react';
import compose from 'recompose/compose';
import { useNavigate } from 'react-router-dom';
import { connect } from 'react-redux';
import { withCurrentUser } from 'src/components/withCurrentUser';
import { MobileTitlebar } from 'src/components/titlebar';
import { ErrorBoundary } from 'src/components/error';
import { isViewingMarketingPage } from 'src/helpers/is-viewing-marketing-page';

export type TitlebarPayloadProps = {
  title: string,
  titleIcon?: React$Node,
  rightAction?: React$Node,
  leftAction?: React$Element<*> | 'menu' | 'view-back',
};

type TitlebarProps = {
  ...$Exact<TitlebarPayloadProps>,
  currentUser: ?Object,
};

const GlobalTitlebar = (props: TitlebarProps): React$Node => {
  const {
    title = 'Spectrum',
    titleIcon = null,
    rightAction = null,
    leftAction = 'menu',
    currentUser,
  } = props;
  const navigate = useNavigate();

  if (isViewingMarketingPage({ location: window.location }, currentUser)) {
    return null;
  }

  return (
    <ErrorBoundary fallbackComponent={<MobileTitlebar title="Error" />}>
      <MobileTitlebar
        title={title}
        titleIcon={titleIcon}
        leftAction={leftAction}
        rightAction={rightAction}
      />
    </ErrorBoundary>
  );
};

const map = (state): * => state.titlebar;

export default compose(
  withCurrentUser,
  connect(map)
)(GlobalTitlebar);
