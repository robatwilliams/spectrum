// @flow
import * as React from 'react';
import Icon from 'src/components/icon';
import { Wrapper, MenuContainer, MenuOverlay, Absolute } from './style';

type Props = {
  hasNavBar?: boolean,
  darkContext?: boolean,
  hasTabBar?: boolean,
  children: React$Node,
};

const Menu = (props: Props) => {
  const { hasNavBar, darkContext, hasTabBar, children } = props;
  const [menuIsOpen, setMenuIsOpen] = React.useState(false);

  const toggleMenu = () => {
    setMenuIsOpen(!menuIsOpen);
  };

  return (
    <Wrapper darkContext={darkContext}>
      <Icon
        data-cy={'community-menu-open'}
        glyph={'menu'}
        onClick={() => toggleMenu()}
      />
      <Absolute open={menuIsOpen} hasNavBar={hasNavBar}>
        <MenuContainer hasNavBar={hasNavBar} hasTabBar={hasTabBar}>
          {menuIsOpen && children}
        </MenuContainer>
        <Icon
          glyph={'view-close'}
          onClick={() => toggleMenu()}
          hasNavBar={hasNavBar}
        />
        <MenuOverlay
          data-cy={'community-menu-close'}
          onClick={() => toggleMenu()}
        />
      </Absolute>
    </Wrapper>
  );
};

export default Menu;
