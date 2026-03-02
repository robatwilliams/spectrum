// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import Clipboard from 'react-clipboard.js';
import { CLIENT_URL } from 'src/api/constants';
import { addToastWithTimeout } from 'src/actions/toasts';
import Tooltip from 'src/components/tooltip';
import Icon from 'src/components/icon';
import compose from 'recompose/compose';
import { PrimaryOutlineButton, TextButton } from 'src/components/button';
import { LikeButton } from 'src/components/threadLikes';
import type { GetThreadType } from 'shared/graphql/queries/thread/getThread';
import getThreadLink from 'src/helpers/get-thread-link';
import type { Dispatch } from 'redux';
import { InputHints, DesktopLink } from 'src/components/composer/style';
import {
  MediaLabel,
  MediaInput,
} from 'src/components/chatInput/components/style';
import {
  ShareButtons,
  ShareButton,
  ActionBarContainer,
  FixedBottomActionBarContainer,
  EditDone,
} from '../style';
import ActionsDropdown from './actionsDropdown';

type Props = {
  thread: GetThreadType,
  currentUser: Object,
  isEditing: boolean,
  dispatch: Dispatch<Object>,
  toggleEdit: Function,
  saveEdit: Function,
  pinThread: Function,
  threadLock: Function,
  isSavingEdit: boolean,
  title: string,
  isLockingThread: boolean,
  isPinningThread: boolean,
  uploadFiles: Function,
};

const ActionBar = (props: Props) => {
  const {
    thread,
    isEditing,
    isSavingEdit,
    title,
    toggleEdit,
    saveEdit,
    dispatch,
    threadLock,
    isLockingThread,
    isPinningThread,
  } = props;

  const uploadFilesHandler = evt => {
    props.uploadFiles(evt.target.files);
  };

  if (isEditing) {
    return (
      <FixedBottomActionBarContainer>
        <div style={{ display: 'flex' }}>
          <InputHints>
            <MediaLabel>
              <MediaInput
                type="file"
                accept={'.png, .jpg, .jpeg, .gif, .mp4'}
                multiple={false}
                onChange={uploadFilesHandler}
              />
              <Icon glyph="photo" />
            </MediaLabel>
            <DesktopLink
              target="_blank"
              href="https://guides.github.com/features/mastering-markdown/"
            >
              <Icon glyph="markdown" />
            </DesktopLink>
          </InputHints>
        </div>
        <div style={{ display: 'flex' }}>
          <EditDone data-cy="cancel-thread-edit-button">
            <TextButton onClick={toggleEdit}>Cancel</TextButton>
          </EditDone>
          <EditDone>
            <PrimaryOutlineButton
              loading={isSavingEdit}
              disabled={title.trim().length === 0 || isSavingEdit}
              onClick={saveEdit}
              data-cy="save-thread-edit-button"
            >
              {isSavingEdit ? 'Saving...' : 'Save'}
            </PrimaryOutlineButton>
          </EditDone>
        </div>
      </FixedBottomActionBarContainer>
    );
  } else {
    return (
      <ActionBarContainer>
        <div style={{ display: 'flex' }}>
          <LikeButton thread={thread} />

          <ShareButtons>
            {!thread.channel.isPrivate && (
              <React.Fragment>
                <Tooltip content={'Share on Facebook'}>
                  <ShareButton facebook data-cy="thread-facebook-button">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?t=${encodeURIComponent(
                        thread.content.title
                      )}&u=https://spectrum.chat${getThreadLink(thread)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon glyph={'facebook'} size={24} />
                    </a>
                  </ShareButton>
                </Tooltip>

                <Tooltip content={'Tweet'}>
                  <ShareButton twitter data-cy="thread-tweet-button">
                    <a
                      href={`https://twitter.com/share?url=https://spectrum.chat${getThreadLink(
                        thread
                      )}&text=${encodeURIComponent(
                        thread.content.title
                      )} on @withspectrum`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon glyph={'twitter'} size={24} />
                    </a>
                  </ShareButton>
                </Tooltip>
              </React.Fragment>
            )}

            <Clipboard
              style={{ background: 'none' }}
              data-clipboard-text={`${CLIENT_URL}${getThreadLink(thread)}`}
              onSuccess={() =>
                dispatch(addToastWithTimeout('success', 'Copied to clipboard'))
              }
            >
              <Tooltip content={'Copy link'}>
                <ShareButton data-cy="thread-copy-link-button">
                  <a>
                    <Icon glyph={'link'} size={24} />
                  </a>
                </ShareButton>
              </Tooltip>
            </Clipboard>
          </ShareButtons>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ActionsDropdown
            thread={thread}
            toggleEdit={toggleEdit}
            lockThread={threadLock}
            isLockingThread={isLockingThread}
            isPinningThread={isPinningThread}
          />
        </div>
      </ActionBarContainer>
    );
  }
};

export default compose(connect())(ActionBar);
