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

type State = {
  isEditing?: boolean,
  body: ?string,
  title: string,
  receiveNotifications?: boolean,
  isSavingEdit?: boolean,
  flyoutOpen?: ?boolean,
  error?: ?string,
  parsedBody: ?Object,
};

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
  const { thread, editThread, dispatch, currentUser, uploadImage } = props;
  const [isEditing, setIsEditing] = React.useState(false);
  const [parsedBody, setParsedBody] = React.useState(null);
  const [body, setBody] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [receiveNotifications, setReceiveNotifications] = React.useState(false);
  const [isSavingEdit, setIsSavingEdit] = React.useState(false);
  const [flyoutOpen, setFlyoutOpen] = React.useState(false);
  const [error, setError] = React.useState('');
  const bodyEditorRef = React.useRef<any>(null);
  const titleTextareaRef = React.useRef<any>(null);

  const setThreadState = React.useCallback(() => {
    const parsed = JSON.parse(thread.content.body);

    setIsEditing(false);
    setBody('');
    setTitle(thread.content.title);
    setParsedBody(parsed);
    setFlyoutOpen(false);
    setReceiveNotifications(thread.receiveNotifications);
    setIsSavingEdit(false);
  }, [thread]);

  // Initialize state on mount and when thread changes
  React.useEffect(() => {
    setThreadState();
  }, [thread.id, setThreadState]);

  const toggleEditHandler = React.useCallback(() => {
    setIsEditing(prev => !prev);
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
        setIsEditing(prev => prev);
        setBody('');
        props.toggleEdit && props.toggleEdit();
      });

    props.toggleEdit && props.toggleEdit();
  }, [thread, dispatch, props]);

  const handleKeyPress = e => {
    const cmdEnter = e.keyCode === ENTER && e.metaKey;
    if (cmdEnter) return saveEditHandler();
  };

  const saveEditHandler = React.useCallback(() => {
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
      .then(({ data: { editThread: result } }) => {
        setIsSavingEdit(false);

        if (result && result !== null) {
          toggleEditHandler();
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
  }, [thread, title, body, editThread, dispatch, toggleEditHandler]);

  const changeTitle = e => {
    const newTitle = e.target.value;
    if (/\n$/g.test(newTitle)) {
      if (bodyEditorRef.current && bodyEditorRef.current.focus) {
        bodyEditorRef.current.focus();
      }
      return;
    }
    setTitle(newTitle);
  };

  const changeBody = evt => {
    setBody(evt.target.value);
  };

  const uploadFilesHandler = React.useCallback(
    files => {
      const uploading = `![Uploading ${files[0].name}...]()`;
      const editor = bodyEditorRef.current;
      if (!editor || !body) return;

      let caretPos = editor.selectionStart;

      const newBody =
        body.substring(0, caretPos) +
        uploading +
        body.substring(editor.selectionEnd, body.length);

      setIsSavingEdit(true);
      setBody(newBody);

      // Update caret position after state update
      setTimeout(() => {
        if (editor) {
          caretPos = caretPos + uploading.length;
          editor.selectionStart = caretPos;
          editor.selectionEnd = caretPos;
          editor.focus();
        }
      }, 0);

      return uploadImage({
        image: files[0],
        type: 'threads',
      })
        .then(({ data }) => {
          setIsSavingEdit(false);
          setBody(prev => {
            if (!prev) return prev;
            return prev.replace(
              uploading,
              `![${files[0].name}](${data.uploadImage})`
            );
          });
        })
        .catch(err => {
          console.error({ err });
          setIsSavingEdit(false);
          setBody(prev => {
            if (!prev) return prev;
            return prev.replace(uploading, '');
          });
          dispatch(
            addToastWithTimeout(
              'error',
              `Uploading image failed - ${err.message}`
            )
          );
        });
    },
    [body, uploadImage, dispatch]
  );

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
            uploadFiles={uploadFilesHandler}
            title={title}
            body={body}
            autoFocus
            bodyRef={ref => (bodyEditorRef.current = ref)}
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
                isCurrentUser={currentUser && author.user.id === currentUser.id}
                isOnline={author.user.isOnline}
                avatarSize={40}
                showHoverProfile={false}
                messageButton={currentUser && author.user.id !== currentUser.id}
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
                thread is preserved for historical purposes. The content of this
                conversation may be innaccurrate or out of date.{' '}
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
                    {timeDifference(Date.now(), editedTimestamp).toLowerCase()}
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
          toggleEdit={toggleEditHandler}
          currentUser={currentUser}
          thread={thread}
          saveEdit={saveEditHandler}
          isSavingEdit={isSavingEdit}
          isEditing={isEditing}
          title={title}
          uploadFiles={uploadFilesHandler}
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
