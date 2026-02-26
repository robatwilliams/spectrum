// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import compose from 'recompose/compose';
import { closeModal } from 'src/actions/modals';
import ModalContainer from '../modalContainer';
import { modalStyles } from '../styles';
import { OutlineButton } from 'src/components/button';
import LoginButtonSet from 'src/components/loginButtonSet';
import { Container, CodeOfConduct } from './style';
import type { Dispatch } from 'redux';

type Props = {
  dispatch: Dispatch<Object>,
  isOpen: boolean,
  modalProps: any,
};

const LoginModal = (props: Props) => {
  const close = () => {
    props.dispatch(closeModal());
  };

  const { isOpen } = props;

  const styles = modalStyles(480);
  const redirectPath = `${window.location.href}`;
  const signinType = 'signin';

  return (
    <Modal
      /* TODO(@mxstbr): Fix this */
      ariaHideApp={false}
      isOpen={isOpen}
      contentLabel={'Sign up'}
      onRequestClose={close}
      shouldCloseOnOverlayClick={true}
      style={styles}
      closeTimeoutMS={330}
    >
      {/*
        We pass the closeModal dispatch into the container to attach
        the action to the 'close' icon in the top right corner of all modals
      */}
      <ModalContainer title={'Sign up'} closeModal={close}>
        <Container data-cy="login-modal">
          <LoginButtonSet
            redirectPath={redirectPath}
            signinType={signinType}
            githubOnly
          />

          <OutlineButton
            css={{ width: '100%' }}
            onClick={close}
            to={`/login?r=${redirectPath}`}
          >
            Existing user? Click here to log in
          </OutlineButton>

          <div style={{ padding: '16px' }} />

          <CodeOfConduct>
            By using Spectrum, you agree to our{' '}
            <a
              href="https://github.com/withspectrum/code-of-conduct"
              target="_blank"
              rel="noopener noreferrer"
            >
              Code of Conduct
            </a>
            {', '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={
                'https://help.github.com/en/github/site-policy/github-privacy-statement'
              }
            >
              Privacy Statement
            </a>
            {', and '}
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={
                'https://help.github.com/en/github/site-policy/github-terms-of-service'
              }
            >
              Terms of Service
            </a>
            .
          </CodeOfConduct>
        </Container>
      </ModalContainer>
    </Modal>
  );
};

const map = state => ({
  isOpen: state.modals.isOpen,
  modalProps: state.modals.modalProps,
});

// $FlowIssue
export default compose(connect(map))(LoginModal);
