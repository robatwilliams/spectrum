// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import Modal from 'react-modal';
import compose from 'recompose/compose';
import { withRouter, type History } from 'react-router';
import { closeModal } from 'src/actions/modals';
import { addToastWithTimeout } from 'src/actions/toasts';
import deleteCommunityMutation from 'shared/graphql/mutations/community/deleteCommunity';
import type { DeleteCommunityType } from 'shared/graphql/mutations/community/deleteCommunity';
import deleteChannelMutation from 'shared/graphql/mutations/channel/deleteChannel';
import type { DeleteChannelType } from 'shared/graphql/mutations/channel/deleteChannel';
import deleteThreadMutation from 'shared/graphql/mutations/thread/deleteThread';
import type { DeleteThreadType } from 'shared/graphql/mutations/thread/deleteThread';
import deleteMessage from 'shared/graphql/mutations/message/deleteMessage';
import type { DeleteMessageType } from 'shared/graphql/mutations/message/deleteMessage';
import archiveChannel from 'shared/graphql/mutations/channel/archiveChannel';
import removeCommunityMember from 'shared/graphql/mutations/communityMember/removeCommunityMember';
import ModalContainer from '../modalContainer';
import { TextButton, WarnButton } from 'src/components/button';
import { modalStyles } from '../styles';
import { Actions, Message } from './style';
import type { Dispatch } from 'redux';

const { useState } = React;

/*
  Generic component that should be used to confirm any 'delete' action.
  Takes modalProps as an object with four fields:

  entity => represents the table for lookup in the backend. Currently can
  be either 'thread', 'channel', or 'community'

  id => id of the entity to be deleted

  message => components can construct a custom confirmation message

  redirect => optional => string which represents the path a user should return
  too after deleting a thing (e.g. '/foo/bar')
*/
type Props = {
  dispatch: Dispatch<Object>,
  modalProps: {
    id: string,
    entity: string,
    redirect?: ?string,
    message?: ?string,
    buttonLabel?: string,
    extraProps?: any,
  },
  deleteMessage: Function,
  deleteCommunity: Function,
  deleteThread: Function,
  deleteChannel: Function,
  archiveChannel: Function,
  removeCommunityMember: Function,
  dispatch: Dispatch<Object>,
  isOpen: boolean,
  history: History,
};

export const deleteMessageWithToast = (
  dispatch: Function,
  deleteMessage: Function,
  id: string
) => {
  return deleteMessage(id)
    .then(({ data }: DeleteMessageType) => {
      const { deleteMessage } = data;
      if (deleteMessage) {
        dispatch(addToastWithTimeout('neutral', 'Message deleted.'));
      }
    })
    .catch(err => {
      dispatch(
        addToastWithTimeout(
          'error',
          `Sorry, we weren't able to delete this message. ${err.message}`
        )
      );
    });
};

const DeleteDoubleCheckModal = (props: Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const close = () => {
    props.dispatch(closeModal());
  };

  const triggerDelete = () => {
    const {
      history,
      modalProps: { id, entity, redirect, extraProps },
      dispatch,
    } = props;

    setIsLoading(true);

    switch (entity) {
      case 'message':
        return deleteMessageWithToast(
          props.dispatch,
          props.deleteMessage,
          id
        ).then(() => {
          setIsLoading(false);
          close();
        });
      case 'thread': {
        if (!extraProps) return;
        const { community } = extraProps.thread;
        return props
          .deleteThread(id)
          .then(({ data }: DeleteThreadType) => {
            const { deleteThread } = data;
            if (deleteThread) {
              history.replace(`/${community.slug}?tab=posts`);
              dispatch(addToastWithTimeout('neutral', 'Thread deleted.'));
              setIsLoading(false);
              close();
            }
            return;
          })
          .catch(err => {
            dispatch(
              addToastWithTimeout(
                'error',
                `Sorry, we weren't able to delete this thread. ${err.message}`
              )
            );
          });
      }
      case 'channel': {
        return props
          .deleteChannel(id)
          .then(({ data }: DeleteChannelType) => {
            const { deleteChannel } = data;
            if (deleteChannel) {
              // TODO: When we figure out the mutation reducers in apollo
              // client we can just history push and trust the store to update
              // eslint-disable-next-line
              window.location.href = redirect ? redirect : '/';
              // history.push(redirect ? redirect : '/');
              dispatch(addToastWithTimeout('neutral', 'Channel deleted.'));
              setIsLoading(false);
              close();
            }
            return;
          })
          .catch(err => {
            dispatch(
              addToastWithTimeout(
                'error',
                `Sorry, we weren't able to delete this channel. ${err.message}`
              )
            );
          });
      }
      case 'community': {
        return props
          .deleteCommunity(id)
          .then(({ data }: DeleteCommunityType) => {
            const { deleteCommunity } = data;
            if (deleteCommunity) {
              // TODO: When we figure out the mutation reducers in apollo
              // client we can just history push and trust the store to update
              // eslint-disable-next-line
              window.location.href = redirect ? redirect : '/';
              // history.push(redirect ? redirect : '/');
              dispatch(addToastWithTimeout('neutral', 'Community deleted.'));
              setIsLoading(false);
              close();
            }
            return;
          })
          .catch(err => {
            dispatch(
              addToastWithTimeout(
                'error',
                `Sorry, we weren't able to delete this community. ${
                  err.message
                }`
              )
            );
            setIsLoading(false);
          });
      }
      case 'channel-archive': {
        return props
          .archiveChannel({ channelId: id })
          .then(() => {
            dispatch(addToastWithTimeout('neutral', 'Channel archived'));
            setIsLoading(false);
            return close();
          })
          .catch(err => {
            dispatch(addToastWithTimeout('error', err.message));
            setIsLoading(false);
          });
      }
      case 'team-member-leaving-community': {
        return props
          .removeCommunityMember({ input: { communityId: id } })
          .then(() => {
            dispatch(addToastWithTimeout('neutral', 'Left community'));
            setIsLoading(false);
            return close();
          })
          .catch(err => {
            dispatch(addToastWithTimeout('error', err.message));
            setIsLoading(false);
          });
      }
      default: {
        setIsLoading(false);

        return dispatch(
          addToastWithTimeout(
            'error',
            'Unable to figure out what you wanted to delete. Whoops!'
          )
        );
      }
    }
  };

  const {
    isOpen,
    modalProps: { message, buttonLabel },
  } = props;
  const styles = modalStyles();

  return (
    <Modal
      /* TODO(@mxstbr): Fix this */
      ariaHideApp={false}
      isOpen={isOpen}
      contentLabel={'Are you sure?'}
      onRequestClose={close}
      shouldCloseOnOverlayClick={true}
      style={styles}
      closeTimeoutMS={330}
    >
      {/*
        We pass the closeModal dispatch into the container to attach
        the action to the 'close' icon in the top right corner of all modals
      */}
      <ModalContainer title={'Are you sure?'} closeModal={close}>
        <Message>{message ? message : 'Are you sure?'}</Message>

        <Actions>
          <TextButton onClick={close}>Cancel</TextButton>
          <WarnButton
            loading={isLoading}
            onClick={triggerDelete}
            data-cy={'delete-button'}
          >
            {buttonLabel || 'Delete'}
          </WarnButton>
        </Actions>
      </ModalContainer>
    </Modal>
  );
};

const DeleteDoubleCheckModalWithMutations = compose(
  deleteCommunityMutation,
  deleteChannelMutation,
  deleteThreadMutation,
  deleteMessage,
  archiveChannel,
  removeCommunityMember,
  withRouter
)(DeleteDoubleCheckModal);

const map = state => ({
  isOpen: state.modals.isOpen,
  modalProps: state.modals.modalProps,
});

// $FlowIssue
export default connect(map)(DeleteDoubleCheckModalWithMutations);
