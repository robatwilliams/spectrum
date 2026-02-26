// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { withRouter, type History, type Location } from 'react-router';
import { connect } from 'react-redux';
import debounce from 'debounce';
import Icon from 'src/components/icon';
import { openModal, closeModal } from 'src/actions/modals';
import getThreadLink from 'src/helpers/get-thread-link';
import { addToastWithTimeout } from 'src/actions/toasts';
import getComposerCommunitiesAndChannels from 'shared/graphql/queries/composer/getComposerCommunitiesAndChannels';
import type { GetComposerType } from 'shared/graphql/queries/composer/getComposerCommunitiesAndChannels';
import publishThread from 'shared/graphql/mutations/thread/publishThread';
import { setTitlebarProps } from 'src/actions/titlebar';
import uploadImage, {
  type UploadImageInput,
  type UploadImageType,
} from 'shared/graphql/mutations/uploadImage';
import Head from 'src/components/head';
import { TextButton } from 'src/components/button';
import { PrimaryButton } from 'src/components/button';
import Tooltip from 'src/components/tooltip';
import {
  MediaLabel,
  MediaInput,
} from 'src/components/chatInput/components/style';
import type { Dispatch } from 'redux';
import {
  Overlay,
  Container,
  Actions,
  DisabledWarning,
  InputHints,
  DesktopLink,
  ButtonRow,
  Wrapper,
} from './style';
import { ESC, ENTER } from 'src/helpers/keycodes';
import Inputs from './inputs';
import ComposerLocationSelectors from './LocationSelectors';
import {
  getDraftThread,
  storeDraftThread,
  clearDraftThread,
} from 'src/helpers/thread-draft-handling';

type State = {
  title: string,
  body: string,
  isLoading: boolean,
  postWasPublished: boolean,
  preview: boolean,
  selectedChannelId: ?string,
  selectedCommunityId: ?string,
};

type Props = {
  data: {
    user: GetComposerType,
    refetch: Function,
    loading: boolean,
  },
  uploadImage: (input: UploadImageInput) => Promise<UploadImageType>,
  dispatch: Dispatch<Object>,
  publishThread: Function,
  history: History,
  location: Location,
  websocketConnection: string,
  networkOnline: boolean,
  isEditing: boolean,
  isModal?: boolean,
  previousLocation?: Location,
};

export const DISCARD_DRAFT_MESSAGE =
  'Are you sure you want to discard this draft?';

// We persist the body and title to localStorage
// so in case the app crashes users don't loose content
const ComposerWithData = (props: Props) => {
  const getTitleAndBody = () => {
    const { body: storedBody, title: storedTitle } = getDraftThread();
    return {
      storedBody,
      storedTitle,
    };
  };

  const { storedBody, storedTitle } = getTitleAndBody();
  
  const [title, setTitle] = React.useState(storedTitle || '');
  const [body, setBody] = React.useState(storedBody || '');
  const [isLoading, setIsLoading] = React.useState(false);
  const [postWasPublished, setPostWasPublished] = React.useState(false);
  const [preview, setPreview] = React.useState(false);
  const [selectedChannelId, setSelectedChannelId] = React.useState('');
  const [selectedCommunityId, setSelectedCommunityId] = React.useState('');

  const bodyEditor = React.useRef<any>(null);

  const removeStorage = async () => {
    await clearDraftThread();
  };

  const handleTitleBodyChange = (key: 'title' | 'body', value: string) => {
    storeDraftThread({
      [key]: value,
    });
  };

  const persistBodyToLocalStorageWithDebounce = React.useMemo(
    () =>
      debounce(() => {
        if (!localStorage) return;
        handleTitleBodyChange('body', body);
      }, 500),
    [body]
  );

  const persistTitleToLocalStorageWithDebounce = React.useMemo(
    () =>
      debounce(() => {
        if (!localStorage) return;
        handleTitleBodyChange('title', title);
      }, 500),
    [title]
  );

  const persistTitleToLocalStorage = () => {
    if (!localStorage) return;
    handleTitleBodyChange('title', title);
  };

  const persistBodyToLocalStorage = () => {
    if (!localStorage) return;
    handleTitleBodyChange('body', body);
  };

  const composerHasContent = () => {
    return title !== '' || body !== '';
  };

  const clearEditorStateAfterPublish = () => {
    try {
      removeStorage();
    } catch (err) {
      console.error(err);
    }
  };

  const closeComposer = (clear?: any) => {
    persistBodyToLocalStorage();
    persistTitleToLocalStorage();

    // we will clear the composer if it unmounts as a result of a post
    // being published or draft discarded, that way the next composer open will start fresh
    if (clear) {
      clearEditorStateAfterPublish();
      setTitle('');
      setBody('');
      setPreview(false);
    }

    if (props.previousLocation)
      return props.history.push({
        ...props.previousLocation,
        state: { modal: false },
      });

    return props.history.goBack({ state: { modal: false } });
  };

  const discardDraft = () => {
    const hasContent = composerHasContent();

    if (!hasContent) {
      return closeComposer();
    }

    props.dispatch(
      openModal('CLOSE_COMPOSER_CONFIRMATION_MODAL', {
        message: DISCARD_DRAFT_MESSAGE,
        closeComposer: () => closeComposer('clear'),
      })
    );
  };

  const handleGlobalKeyPress = (e: any) => {
    const esc = e && e.keyCode === ESC;
    const enter = e.keyCode === ENTER;
    const cmdEnter = e.keyCode === ENTER && e.metaKey;

    // we need to verify the source of the keypress event
    // so that if it comes from the discard draft modal, it should not
    // listen to the events for composer
    const innerText = e.target.innerText;
    const modalIsOpen = innerText.indexOf(DISCARD_DRAFT_MESSAGE) >= 0;

    if (esc && modalIsOpen) {
      e.stopPropagation();
      props.dispatch(closeModal());
      return;
    }

    if (enter && modalIsOpen) {
      e.stopPropagation();
      discardDraft();
      return;
    }

    const hasContent = composerHasContent();

    if (esc && hasContent) {
      discardDraft();
      return;
    }

    if (esc && !hasContent) {
      return closeComposer();
    }

    if (cmdEnter && !modalIsOpen) return publishThreadHandler();
  };

  const changeTitle = (e: any) => {
    const newTitle = e.target.value;
    persistTitleToLocalStorageWithDebounce();
    if (/\n$/g.test(newTitle)) {
      bodyEditor.current && bodyEditor.current.focus && bodyEditor.current.focus();
      return;
    }
    setTitle(newTitle);
  };

  const changeBody = (evt: any) => {
    const newBody = evt.target.value;
    persistBodyToLocalStorageWithDebounce();
    setBody(newBody);
  };

  const onCancelClick = () => {
    discardDraft();
  };

  const uploadFile = (evt: any) => {
    uploadFiles(evt.target.files);
  };

  const uploadFiles = (files: any) => {
    const uploading = `![Uploading ${files[0].name}...]()`;
    let caretPos = bodyEditor.current.selectionStart;

    const newBody =
      body.substring(0, caretPos) +
      uploading +
      body.substring(bodyEditor.current.selectionEnd, body.length);

    setIsLoading(true);
    setBody(newBody);

    // Use setTimeout to ensure DOM updates before setting caret position
    setTimeout(() => {
      caretPos = caretPos + uploading.length;
      bodyEditor.current.selectionStart = caretPos;
      bodyEditor.current.selectionEnd = caretPos;
      bodyEditor.current.focus();
    }, 0);

    return props
      .uploadImage({
        image: files[0],
        type: 'threads',
      })
      .then(({ data }) => {
        setIsLoading(false);
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
        setIsLoading(false);
        changeBody({
          target: {
            value: body.replace(uploading, ''),
          },
        });
        props.dispatch(
          addToastWithTimeout(
            'error',
            `Uploading image failed - ${err.message}`
          )
        );
      });
  };

  const publishThreadHandler = () => {
    // if no title and no channel is set, don't allow a thread to be published
    if (
      !title ||
      !selectedCommunityId ||
      !selectedChannelId
    ) {
      return;
    }

    // isLoading will change the publish button to a loading spinner
    setIsLoading(true);

    const { dispatch, networkOnline, websocketConnection } = props;

    if (!networkOnline) {
      return dispatch(
        addToastWithTimeout(
          'error',
          'Not connected to the internet - check your internet connection or try again'
        )
      );
    }

    if (
      websocketConnection !== 'connected' &&
      websocketConnection !== 'reconnected'
    ) {
      return dispatch(
        addToastWithTimeout(
          'error',
          'Error connecting to the server - hang tight while we try to reconnect'
        )
      );
    }

    // define new constants in order to construct the proper shape of the
    // input for the publishThread mutation
    const channelId = selectedChannelId;
    const communityId = selectedCommunityId;

    const content = {
      title: title.trim(),
      // workaround react-mentions bug by replacing @[username] with @username
      // @see withspectrum/spectrum#4587
      body: body.replace(/@\[([a-z0-9_-]+)\]/g, '@$1'),
    };

    // this.props.mutate comes from a higher order component defined at the
    // bottom of this file
    const thread = {
      channelId,
      communityId,
      // NOTE(@mxstbr): On android we send plain text content
      // which is parsed as markdown to draftjs on the server
      type: 'TEXT',
      content,
      // filesToUpload,
    };

    // one last save to localstorage
    persistBodyToLocalStorage();
    persistTitleToLocalStorage();

    props
      .publishThread(thread)
      // after the mutation occurs, it will either return an error or the new
      // thread that was published
      .then(({ data }) => {
        clearEditorStateAfterPublish();

        // stop the loading spinner on the publish button
        setIsLoading(false);
        setPostWasPublished(true);
        setTitle('');
        setBody('');

        // redirect the user to the thread
        // if they are in the inbox, select it
        props.dispatch(
          addToastWithTimeout('success', 'Thread published!')
        );
        if (props.location.pathname === '/new/thread') {
          props.history.replace(getThreadLink(data.publishThread));
        } else {
          props.history.push(getThreadLink(data.publishThread));
        }
        return;
      })
      .catch(err => {
        setIsLoading(false);
        props.dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const setSelectedCommunity = (id: string) => {
    return setSelectedCommunityId(id);
  };

  const setSelectedChannel = (id: string) => {
    return setSelectedChannelId(id);
  };

  React.useEffect(() => {
    const { dispatch } = props;
    dispatch(
      setTitlebarProps({
        title: 'New post',
      })
    );

    // $FlowIssue
    document.addEventListener('keydown', handleGlobalKeyPress, false);

    return () => {
      // $FlowIssue
      document.removeEventListener('keydown', handleGlobalKeyPress, false);
      // if a post was published, in this session, clear redux so that the next
      // composer open will start fresh
      if (postWasPublished) return;

      // otherwise, clear the composer normally and save the state
      return;
    };
  }, []);

  const {
    networkOnline,
    websocketConnection,
    isEditing,
    isModal,
  } = props;

  const networkDisabled =
    !networkOnline ||
    (websocketConnection !== 'connected' &&
      websocketConnection !== 'reconnected');

  return (
    <Wrapper data-cy="thread-composer-wrapper">
      <Head title={'New post'} description={'Write a new post'} />
      <Overlay
        isModal={isModal}
        onClick={discardDraft}
        data-cy="overlay"
      />

      <Container data-cy="modal-container" isModal={isModal}>
        <ComposerLocationSelectors
          selectedChannelId={selectedChannelId}
          selectedCommunityId={selectedCommunityId}
          onCommunitySelectionChanged={setSelectedCommunity}
          onChannelSelectionChanged={setSelectedChannel}
        />

        <Inputs
          title={title}
          body={body}
          changeBody={changeBody}
          changeTitle={changeTitle}
          uploadFiles={uploadFiles}
          autoFocus={true}
          bodyRef={ref => (bodyEditor.current = ref)}
          onKeyDown={handleGlobalKeyPress}
          isEditing={isEditing}
        />

        {networkDisabled && (
          <DisabledWarning>
            Lost connection to the internet or server...
          </DisabledWarning>
        )}
        <Actions>
          <InputHints>
            <Tooltip content={'Upload photo'}>
              <MediaLabel>
                <MediaInput
                  type="file"
                  accept={'.png, .jpg, .jpeg, .gif, .mp4'}
                  multiple={false}
                  onChange={uploadFile}
                />
                <Icon glyph="photo" />
              </MediaLabel>
            </Tooltip>
            <Tooltip content={'Style with Markdown'}>
              <DesktopLink
                target="_blank"
                href="https://guides.github.com/features/mastering-markdown/"
              >
                <Icon glyph="markdown" />
              </DesktopLink>
            </Tooltip>
          </InputHints>
          <ButtonRow>
            <TextButton
              data-cy="composer-cancel-button"
              hoverColor="warn.alt"
              onClick={discardDraft}
            >
              Cancel
            </TextButton>
            <PrimaryButton
              data-cy="composer-publish-button"
              onClick={publishThreadHandler}
              loading={isLoading}
              disabled={
                !title ||
                title.trim().length === 0 ||
                isLoading ||
                networkDisabled ||
                !selectedChannelId ||
                !selectedCommunityId
              }
            >
              {isLoading ? 'Publishing...' : 'Publish'}
            </PrimaryButton>
          </ButtonRow>
        </Actions>
      </Container>
    </Wrapper>
  );
};

// $FlowIssue
const mapStateToProps = state => ({
  websocketConnection: state.connectionStatus.websocketConnection,
  networkOnline: state.connectionStatus.networkOnline,
});

export default compose(
  uploadImage,
  getComposerCommunitiesAndChannels,
  publishThread,
  withRouter,
  connect(mapStateToProps)
)(ComposerWithData);
