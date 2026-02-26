// @flow
import * as React from 'react';
import { Loading } from 'src/components/loading';
import { HoverWrapper, ProfileCard } from './style';

type Props = {
  ref?: (?HTMLElement) => void,
  style: CSSStyleDeclaration,
};

const LoadingHoverProfile = (props: Props) => {
  const { ref, style } = props;

  return (
    <HoverWrapper popperStyle={style} ref={ref}>
      <ProfileCard style={{ display: 'flex', alignItems: 'center' }}>
        <Loading />
      </ProfileCard>
    </HoverWrapper>
  );
};

export default LoadingHoverProfile;
