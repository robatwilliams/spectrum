// @flow
import * as React from 'react';

type Props = {
  children: React$Node,
  style?: Object,
  onOutsideClick: Function,
};

function OutsideAlerter({ children, style = {}, onOutsideClick }: Props) {
  const wrapperRef = React.useRef(null);

  React.useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    const handleClickOutside = (event: any) => {
      // $FlowFixMe
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        onOutsideClick();
      }
    };

    // iOS bug, see: https://stackoverflow.com/questions/10165141/jquery-on-and-delegate-doesnt-work-on-ipad
    // $FlowFixMe
    document
      .getElementById('root')
      .addEventListener('mousedown', handleClickOutside);

    return () => {
      // $FlowFixMe
      document
        .getElementById('root')
        .removeEventListener('mousedown', handleClickOutside);
    };
  }, [onOutsideClick]);

  return (
    // $FlowFixMe
    <div style={style} ref={wrapperRef}>
      {children}
    </div>
  );
}

export default OutsideAlerter;
