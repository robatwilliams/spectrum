// @flow
import * as React from 'react';
import Tooltip from 'src/components/tooltip';
import Icon from 'src/components/icon';
import { Loading } from 'src/components/loading';
import {
  PRO_USER_MAX_IMAGE_SIZE_STRING,
  PRO_USER_MAX_IMAGE_SIZE_BYTES,
} from 'src/helpers/images';
import { MediaLabel, MediaInput, Form } from './style';

type Props = {
  onValidated: Function,
  onError: Function,
  currentUser: ?Object,
  isSendingMediaMessage: boolean,
};

const MediaUploader = (props: Props) => {
  const { currentUser, onError, onValidated, isSendingMediaMessage } = props;
  const formRef = React.useRef(null);

  const validate = (validity: Object, file: ?Object) => {
    if (!currentUser) return 'You must be signed in to upload images';
    if (!file) return onError('');
    if (!validity.valid)
      return "We couldn't validate this upload, please try uploading another file";

    if (file && file.size > PRO_USER_MAX_IMAGE_SIZE_BYTES) {
      return `Try uploading a file less than ${PRO_USER_MAX_IMAGE_SIZE_STRING}.`;
    }

    // if it makes it this far, there is not an error we can detect
    return null;
  };

  const clearForm = () => {
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const validatePreview = (validity: Object, file: ?Object) => {
    const validationResult = validate(validity, file);
    if (validationResult !== null) {
      return onError(validationResult);
    }
    onError('');
    // clear the form so that another image can be uploaded
    clearForm();
    // send back the validated file
    return onValidated(file);
  };

  const onChange = (e: any) => {
    const {
      target: {
        validity,
        files: [file],
      },
    } = e;

    if (!file) return;

    return validatePreview(validity, file);
  };

  const onPaste = (event: any) => {
    // Ensure that the image is only pasted if user focuses input
    if (!event || !props.inputFocused) {
      return;
    }
    const items = (event.clipboardData || event.originalEvent.clipboardData)
      .items;
    if (!items) {
      return;
    }
    for (let item of items) {
      if (item.kind === 'file' && item.type.includes('image/')) {
        validatePreview({ valid: true }, item.getAsFile());
        break;
      }
    }
  };

  React.useEffect(() => {
    document.addEventListener('paste', onPaste, true);
    clearForm();
    return () => {
      document.removeEventListener('paste', onPaste);
      clearForm();
    };
  }, []);

  if (isSendingMediaMessage) {
    return (
      <MediaLabel>
        <Loading />
      </MediaLabel>
    );
  }

  return (
    <Form
      onSubmit={e => e.preventDefault()}
      ref={formRef}
      data-cy="chat-input-media-uploader"
    >
      <Tooltip content={'Upload photo'}>
        <MediaLabel>
          <MediaInput
            type="file"
            accept={'.png, .jpg, .jpeg, .gif, .mp4'}
            multiple={false}
            onChange={onChange}
          />
          <Icon glyph="photo" />
        </MediaLabel>
      </Tooltip>
    </Form>
  );
};

export default MediaUploader;
