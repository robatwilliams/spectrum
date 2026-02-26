// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { timeDifference } from 'shared/time-difference';
import { convertTimestampToDate } from 'shared/time-formatting';
import { addToastWithTimeout } from 'src/actions/toasts';
import editThreadMutation from 'shared/graphql/mutations/thread/editThread';
import uploadImageMutation from 'shared/graphql/mutations/uploadImage';
import type { GetThreadType } from 'shared/graphql/queries/thread/getThread';
import ThreadRenderer from 'src/components/threadRenderer';
import ActionBar from './actionBar';
import ThreadEditInputs from 'src/components/composer/inputs';
import { withCurrentUser } from 'src/components/withCurrentUser';
import { UserListItem } from 'src/components/entities';
import {
  ThreadWrapper,
  ThreadContent,
  ThreadHeading,
  ThreadSubtitle,
  BylineContainer,
} from '../style';
import getThreadLink from 'src/helpers/get-thread-link';
import { ENTER } from 'src/helpers/keycodes';
import type { Dispatch } from 'redux';
import { ErrorBoundary } from 'src/components/error';
const { useState, useEffect, useRef, useMemo } = React;

type Props = {
  thread: GetThreadType,
  setThreadLock: Function,
  editThread: Function,
  dispatch: Dispatch<Object>,
  currentUser: ?Object,
  toggleEdit: Function,
  uploadImage: Function,
  ref?: any,
};

const ThreadDetailPure = (props: Props) => {
  const { currentUser, thread, dispatch, editThread, uploadImage } = props;

  const parsedBody = useMemo(() => {
    return JSON.parse(thread.content.body);
  }, [thread.content.body]);

  const [isEditing, setIsEditing] = useState(false);
  const [body, setBody] = useState('');
  const [title, setTitle] = useState(thread.content.title);
  const [receiveNotifications, setReceiveNotifications] = useState(thread.receiveNotifications);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [error, setError] = useState('');

  const bodyEditor = useRef(null);
  const titleTextarea = useRef(null);

  useEffect(() => {
    setIsEditing(false);
    setBody('');
    setTitle(thread.content.title);
    setFlyoutOpen(false);
    setReceiveNotifications(thread.receiveNotifications);
    setIsSavingEdit(false);
  }, [thread.id, thread.content.title, thread.receiveNotifications]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setTitle(thread.content.title);
    setBody(null);

    fetch('https://convert.spectrum.chat/to', {
      method: 'POST',
      body: thread.content.body,
    })
      .then(res => {
        if (res.status >= 300 || res.status < 200)
          throw new Error('Oops, something went wrong.');
        return res;
      })
      .then(res => res.text())
      .then(md => {
        setBody(md);
      })
      .catch(err => {
        dispatch(addToastWithTimeout('error', err.message));
        setIsEditing(isEditing);
        setBody('');
        props.toggleEdit && props.toggleEdit();
      });

    props.toggleEdit && props.toggleEdit();
  };

  const handleKeyPress = e => {
    const cmdEnter = e.keyCode === ENTER && e.metaKey;
    if (cmdEnter) return saveEdit();
  };

  const saveEdit = () => {
    const threadId = thread.id;

    if (!title || title.trim().length === 0) {
      dispatch(
        addToastWithTimeout('error', 'Be sure to save a title for your thread!')
      );
      return;
    }

    setIsSavingEdit(true);

    const content = {
      title: title.trim(),
      body,
    };

    const input = {
      threadId,
      content,
    };

    editThread(input)
      .then(({ data: { editThread } }) => {
        setIsSavingEdit(false);

        if (editThread && editThread !== null) {
          toggleEdit();
          return dispatch(addToastWithTimeout('success', 'Thread saved!'));
        } else {
          return dispatch(
            addToastWithTimeout(
              'error',
              "We weren't able to save these changes. Try again?"
            )
          );
        }
      })
      .catch(err => {
        setIsSavingEdit(false);
        dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const changeTitle = e => {
    const newTitle = e.target.value;
    if (/\n$/g.test(newTitle)) {
      bodyEditor.current && bodyEditor.current.focus && bodyEditor.current.focus();
      return;
    }
    setTitle(newTitle);
  };

  const changeBody = evt => {
    setBody(evt.target.value);
  };

  const uploadFiles = files => {
    const uploading = `![Uploading ${files[0].name}...]()`;
    let caretPos = bodyEditor.current.selectionStart;
    if (!body) return;

    setIsSavingEdit(true);
    setBody(
      body.substring(0, caretPos) +
        uploading +
        body.substring(bodyEditor.current.selectionEnd, body.length)
    );

    setTimeout(() => {
      caretPos = caretPos + uploading.length;
      bodyEditor.current.selectionStart = caretPos;
      bodyEditor.current.selectionEnd = caretPos;
      bodyEditor.current.focus();
    }, 0);

    return uploadImage({
      image: files[0],
      type: 'threads',
    })
      .then(({ data }) => {
        setIsSavingEdit(false);
        if (!body) return;
        changeBody({
          target: {
            value: body.replace(
              uploading,
              `![${files[0].name}](${data.uploadImage})`
            ),
          },
        });
      })
      .catch(err => {
        console.error({ err });
        setIsSavingEdit(false);
        if (!body) return;
        changeBody({
          target: {
            value: body.replace(uploading, ''),
          },
        });
        dispatch(
          addToastWithTimeout(
            'error',
            `Uploading image failed - ${err.message}`
          )
        );
      });
  };

  const createdAt = new Date(thread.createdAt).getTime();
  const timestamp = convertTimestampToDate(createdAt);
  const { author } = thread;

  const editedTimestamp = thread.modifiedAt
    ? new Date(thread.modifiedAt).getTime()
    : null;

  return (
    <ThreadWrapper isEditing={isEditing} ref={props.ref}>
      <ThreadContent isEditing={isEditing}>
        {isEditing ? (
          <ThreadEditInputs
            uploadFiles={uploadFiles}
            title={title}
            body={body}
            autoFocus
            bodyRef={ref => (bodyEditor.current = ref)}
            changeBody={changeBody}
            changeTitle={changeTitle}
            onKeyDown={handleKeyPress}
            isEditing={isEditing}
          />
        ) : (
          <React.Fragment>
            <BylineContainer>
              <UserListItem
                userObject={author.user}
                name={author.user.name}
                username={author.user.username}
                profilePhoto={author.user.profilePhoto}
                badges={author.roles}
                isCurrentUser={
                  currentUser && author.user.id === currentUser.id
                }
                isOnline={author.user.isOnline}
                avatarSize={40}
                showHoverProfile={false}
                messageButton={
                  currentUser && author.user.id !== currentUser.id
                }
              />
            </BylineContainer>

            {thread.community.website && thread.community.redirect && (
              <div
                style={{
                  width: 'calc(100% + 32px)',
                  borderBottom: '1px solid #f6f7f8',
                  padding: '12px 16px',
                  background: '#FFE6BF',
                  marginLeft: '-16px',
                  marginRight: '-16px',
                  color: '#7D4A00',
                }}
              >
                The {thread.community.name} community has a new home. This
                thread is preserved for historical purposes. The content of
                this conversation may be innaccurrate or out of date.{' '}
                <a
                  style={{ color: '#D85537', fontWeight: '600' }}
                  href={thread.community.website}
                >
                  Go to new community home &rarr;
                </a>
              </div>
            )}

            <div style={{ height: '16px' }} />

            <ThreadHeading>{thread.content.title}</ThreadHeading>

            <ThreadSubtitle>
              <Link to={getThreadLink(thread)}>
                {timestamp}
                {thread.modifiedAt && (
                  <React.Fragment>
                    {' '}
                    (Edited{' '}
                    {timeDifference(
                      Date.now(),
                      editedTimestamp
                    ).toLowerCase()}
                    {thread.editedBy &&
                      thread.editedBy.user.id !== thread.author.user.id &&
                      ` by @${thread.editedBy.user.username}`}
                    )
                  </React.Fragment>
                )}
              </Link>
            </ThreadSubtitle>

            <ThreadRenderer body={JSON.parse(thread.content.body)} />
          </React.Fragment>
        )}
      </ThreadContent>

      <ErrorBoundary>
        <ActionBar
          toggleEdit={toggleEdit}
          currentUser={currentUser}
          thread={thread}
          saveEdit={saveEdit}
          isSavingEdit={isSavingEdit}
          isEditing={isEditing}
          title={title}
          uploadFiles={uploadFiles}
        />
      </ErrorBoundary>
    </ThreadWrapper>
  );
};

const ThreadDetail = compose(
  editThreadMutation,
  uploadImageMutation,
  withRouter
)(ThreadDetailPure);

const map = state => ({
  flyoutOpen: state.flyoutOpen,
});

export default compose(
  withCurrentUser,
  // $FlowIssue
  connect(map)
)(ThreadDetail);
