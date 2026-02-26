// @flow
import * as React from 'react';
import Modal from 'react-modal';
import compose from 'recompose/compose';
import ModalContainer from '../modalContainer';
import { closeModal } from 'src/actions/modals';
import { connect } from 'react-redux';
import { TextButton, PrimaryOutlineButton } from 'src/components/button';
import moveThreadMutation from 'shared/graphql/mutations/thread/moveThread';
import type { MoveThreadType } from 'shared/graphql/mutations/thread/moveThread';
import { addToastWithTimeout } from 'src/actions/toasts';
import Icon from 'src/components/icon';
import { IconContainer } from '../RepExplainerModal/style';
import { Actions, modalStyles, Section, Title, Subtitle } from './style';
import ChannelSelector from './channelSelector';
import type { Dispatch } from 'redux';

type Props = {
  thread: any,
  dispatch: Dispatch<Object>,
  isOpen: boolean,
  moveThread: Function,
};

const ChangeChannelModal = (props: Props) => {
  const { thread, isOpen, dispatch, moveThread } = props;
  const [activeChannel, setActiveChannel] = React.useState(thread.channel.id);
  const [isLoading, setIsLoading] = React.useState(false);

  const closeModalHandler = () => {
    dispatch(closeModal());
  };

  const setActiveChannelHandler = e => setActiveChannel(e.target.value);

  const saveNewChannel = () => {
    const {
      thread: { id },
    } = props;

    setIsLoading(true);

    return moveThread({ threadId: id, channelId: activeChannel })
      .then(({ data }: MoveThreadType) => {
        const { moveThread } = data;
        if (moveThread) {
          dispatch(
            addToastWithTimeout('success', 'Channel changed successfully.')
          );
          setIsLoading(false);
          closeModalHandler();
        }
        return;
      })
      .catch(err => {
        dispatch(
          addToastWithTimeout(
            'error',
            `We weren't able to change channels. ${err.message}`
          )
        );
      });
  };

  return (
      <Modal
        /* TODO(@mxstbr): Fix this */
        ariaHideApp={false}
        isOpen={isOpen}
        contentLabel={'Reputation'}
        onRequestClose={closeModalHandler}
        shouldCloseOnOverlayClick={true}
        style={modalStyles}
        closeTimeoutMS={330}
      >
        <ModalContainer
          noHeader={false}
          title={null}
          closeModal={closeModalHandler}
        >
          {thread.channel.isPrivate ? (
            <Section>
              <IconContainer>
                <Icon glyph={'private'} size={64} />
              </IconContainer>
              <Title>This thread can’t be moved</Title>
              <Subtitle>
                This thread was posted in the private channel{' '}
                {thread.channel.name} - threads in private channels cannot be
                moved.
              </Subtitle>
            </Section>
          ) : (
            <Section data-cy="move-thread-modal">
              <Title>Change channel</Title>
              <Subtitle>
                Move this thread to a new channel in the same community.
              </Subtitle>

              <ChannelSelector
                currentChannel={activeChannel}
                communitySlug={thread.community.slug}
                setActiveChannel={setActiveChannelHandler}
                id={thread.community.id}
              />

              <Actions>
                <TextButton onClick={closeModalHandler}>Cancel</TextButton>
                <PrimaryOutlineButton
                  loading={isLoading}
                  onClick={saveNewChannel}
                  disabled={activeChannel === thread.channel.id}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </PrimaryOutlineButton>
              </Actions>
            </Section>
          )}
        </ModalContainer>
      </Modal>
    );
};

const map = state => ({ isOpen: state.modals.isOpen });
export default compose(
  // $FlowIssue
  connect(map),
  moveThreadMutation
)(ChangeChannelModal);
