// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { EditDropdownContainer } from 'src/components/settingsViews/style';
import Icon from 'src/components/icon';
import OutsideClickHandler from 'src/components/outsideClickHandler';

type Props = {
  render: Function,
};

const EditDropdown = (props: Props) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleOpen = () => setIsOpen(true);

  const close = () => setIsOpen(false);

  return (
    <EditDropdownContainer>
      <Icon onClick={toggleOpen} isOpen={isOpen} glyph={'settings'} />

      {isOpen && (
        <OutsideClickHandler onOutsideClick={close}>
          {props.render()}
        </OutsideClickHandler>
      )}
    </EditDropdownContainer>
  );
};

export default compose(connect())(EditDropdown);
