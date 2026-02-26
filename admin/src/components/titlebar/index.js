import React from 'react';
// $FlowFixMe
import { connect } from 'react-redux';
// $FlowFixMe
import compose from 'recompose/compose';
// $FlowFixMe
import { withRouter } from 'react-router';
import Icon from '../../components/icons';
import { IconButton } from '../../components/buttons';
import { TitleBar, Text, Subtitle, Title, Spacer } from './style';

const Titlebar = (props) => {
  const { title, subtitle, provideBack, history, backRoute } = props;

  const handleBack = () => {
    const length = history.length;

    if (length > 3) {
      history.goBack();
    } else {
      history.push(backRoute);
    }
  };

  return (
    <TitleBar>
      {provideBack ? (
        <IconButton
          glyph="view-back"
          color="text.reverse"
          onClick={handleBack}
        />
      ) : (
        <Spacer />
      )}
      <Text>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
        {title ? (
          <Title large={subtitle ? false : true}>{title}</Title>
        ) : (
          <Icon glyph="logo" />
        )}
      </Text>
    </TitleBar>
  );
};

const mapStateToProps = state => ({
  currentUser: state.users.currentUser,
  isOpen: state.composer.isOpen,
});
export default compose(withRouter, connect(mapStateToProps))(Titlebar);
