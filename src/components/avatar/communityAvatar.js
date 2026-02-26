// @flow
import * as React from 'react';
import type { CommunityInfoType } from 'shared/graphql/fragments/community/communityInfo';
import AvatarImage from './image';
import { Container, AvatarLink } from './style';
import ConditionalWrap from 'src/components/conditionalWrap';

type Props = {
  community: CommunityInfoType,
  size?: number,
  mobilesize?: number,
  style?: Object,
  showHoverProfile?: boolean,
  isClickable?: boolean,
};

const Avatar = (props: Props) => {
  const {
    community,
    size = 32,
    isClickable = true,
    mobilesize,
    style,
  } = props;

  const src = community.profilePhoto;

  const communityFallback = '/img/default_community.svg';
  const source = [src, communityFallback];

  return (
    <Container
      size={size}
      mobilesize={mobilesize}
      style={style}
      type={'community'}
    >
      <ConditionalWrap
        condition={isClickable}
        wrap={children => (
          <AvatarLink to={`/${community.slug}`}>{children}</AvatarLink>
        )}
      >
        <AvatarImage
          src={source}
          size={size}
          mobilesize={mobilesize}
          type={'community'}
          alt={community.name}
        />
      </ConditionalWrap>
    </Container>
  );
}

const AvatarHandler = (props: Props) => {
  return <Avatar {...props} />;
}

export default AvatarHandler;
