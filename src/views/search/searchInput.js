import * as React from 'react';
import compose from 'recompose/compose';
import { SearchWrapper, SearchInput, ClearSearch, SearchForm } from './style';
import Icon from 'src/components/icon';

type Props = {};

const SearchViewInput = (props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [value, setValue] = React.useState('');
  const [searchQueryString, setSearchQueryString] = React.useState('');
  const searchInputRef = React.useRef(null);

  const open = () => {
    setIsOpen(true);
    searchInputRef.current.focus();
  };

  const close = () => {
    if (value.length === 0) {
      setIsOpen(false);
      setSearchQueryString('');
    }
    searchInputRef.current.blur();
  };

  const clearClose = () => {
    setValue('');
    setSearchQueryString('');
    searchInputRef.current.focus();
  };

  const onChange = e => {
    setValue(e.target.value);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const searchString = value.toLowerCase().trim();
    props.handleSubmit(searchString);
  };

  const placeholder = 'Search for conversations...';

  return (
    <SearchWrapper isOpen={isOpen} onClick={open}>
      <Icon glyph={'search'} size={32} />
      <ClearSearch
        onClick={clearClose}
        isVisible={isOpen && value.length > 0}
        isOpen={isOpen}
      >
        <span>&times;</span>
      </ClearSearch>
      <SearchForm onSubmit={handleSubmit}>
        <SearchInput
          isOpen={isOpen}
          onBlur={close}
          onChange={onChange}
          value={value}
          placeholder={placeholder}
          ref={searchInputRef}
          autoFocus={true}
        />
      </SearchForm>
    </SearchWrapper>
  );
};

export default compose()(SearchViewInput);
