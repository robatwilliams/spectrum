// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { closeGallery } from 'src/actions/gallery';
import type { GetMediaMessagesForThreadType } from 'shared/graphql/queries/message/getMediaMessagesForThread';
import type { Dispatch } from 'redux';
import {
  Overlay,
  ActiveImage,
  Minigallery,
  MiniImg,
  MiniContainer,
  CloseButton,
  GalleryWrapper,
} from './style';
import { ESC, ARROW_LEFT, ARROW_RIGHT } from 'src/helpers/keycodes';

type Props = {
  dispatch: Dispatch<Object>,
  data: {
    messages?: GetMediaMessagesForThreadType,
  },
  activeMessageId: string,
};

const Browser = (props: Props) => {
  const { dispatch, data, activeMessageId } = props;

  const getInitialState = () => {
    // if there are no messages found
    if (!data.messages || data.messages.length === 0) {
      return {
        images: [],
        activeMessageId: activeMessageId,
        index: null,
      };
    }

    let index;
    data.messages.map((message, i) => {
      if (message.id === activeMessageId) {
        index = i;
        return message;
      } else {
        return message;
      }
    });

    return {
      images: data.messages,
      activeMessageId: activeMessageId,
      index,
    };
  };

  const [images, setImages] = React.useState(getInitialState().images);
  const [index, setIndex] = React.useState(getInitialState().index);

  const closeGallery = () => {
    dispatch(closeGallery());
  };

  const handleKeyPress = e => {
    // if no media, skip on outta here
    if (!images) return;

    if (e.keyCode === ESC) {
      closeGallery();
    }

    if (e.keyCode === ARROW_LEFT) {
      previousImage();
    }

    if (e.keyCode === ARROW_RIGHT) {
      nextImage();
    }
  };

  React.useEffect(() => {
    // $FlowFixMe
    document.addEventListener('keydown', handleKeyPress, false);
    return () => {
      // $FlowFixMe
      document.removeEventListener('keydown', handleKeyPress, false);
    };
  }, []);

  const previousImage = () => {
    if (index === null) return;

    if (index === 0) {
      setIndex(images.length - 1);
    } else {
      // $FlowFixMe
      setIndex(index - 1);
    }
  };

  const nextImage = () => {
    if (index === images.length - 1) {
      setIndex(0);
    } else {
      setIndex(index + 1);
    }
  };

  const setCount = i => {
    setIndex(i);
  };

  const { messages } = data;

  if (!messages || messages.length === 0) return null;

  // when a user uploads an image, sometimes the resulting image doesn't get updated in the Apollo cache
  // if it doesn't update in the cache, then the browser component will receive a bad `activeMessageId`
  // prop. If it's the case that this happens, we just select the *last* image, assuming it's the one that the user just uploaded.
  let filteredIndex = typeof index === 'number' ? index : messages.length - 1;

  const src = `${images[filteredIndex].content.body}`;

  return (
    <GalleryWrapper>
      <CloseButton onClick={closeGallery}>✕</CloseButton>
      <Overlay onClick={closeGallery} onKeyDown={handleKeyPress} />
      <ActiveImage onClick={nextImage} src={src} />
      <Minigallery>
        <MiniContainer>
          {images.map((image, i) => {
            return (
              <MiniImg
                src={`${image.content.body}`}
                key={i}
                onClick={() => setCount(i)}
                active={i === filteredIndex}
              />
            );
          })}
        </MiniContainer>
      </Minigallery>
    </GalleryWrapper>
  );
};

export default connect()(Browser);

