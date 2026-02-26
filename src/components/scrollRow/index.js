import React, { useState, useEffect, useRef } from 'react';
import { ScrollableFlexRow } from './style';

const ScrollRow = (props) => {
  const [scrollPos, setScrollPos] = useState(null);
  const hscroll = useRef(null);

  useEffect(() => {
    const node = hscroll.current;
    node.scrollLeft = scrollPos;

    let x, left, down;
    const handleMouseMove = e => {
      if (down) {
        let newX = e.pageX;
        node.scrollLeft = left - newX + x;
      }
    };

    const handleMouseDown = e => {
      e.preventDefault();

      down = true;
      x = e.pageX;
      left = node.scrollLeft;
    };

    const handleMouseUp = e => {
      down = false;

      if (e.target.id) {
        setScrollPos(left - e.pageX + x);
      }
    };

    const handleMouseLeave = e => {
      down = false;
    };

    node.addEventListener('mousemove', handleMouseMove);
    node.addEventListener('mousedown', handleMouseDown);
    node.addEventListener('mouseup', handleMouseUp);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      node.removeEventListener('mousemove', handleMouseMove);
      node.removeEventListener('mousedown', handleMouseDown);
      node.removeEventListener('mouseup', handleMouseUp);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [scrollPos]);

  return (
    <ScrollableFlexRow
      className={props.className}
      ref={hscroll}
    >
      {props.children}
    </ScrollableFlexRow>
  );
};

export default ScrollRow;
