// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { ViewGrid } from 'src/components/layout';
import searchThreadsQuery from 'shared/graphql/queries/search/searchThreads';
import ThreadFeed from 'src/components/threadFeed';
import SearchInput from './searchInput';
import { setTitlebarProps } from 'src/actions/titlebar';

const SearchThreadFeed = compose(
  connect(),
  searchThreadsQuery
)(ThreadFeed);

type Props = {
  dispatch: Function,
};

const Search = (props: Props) => {
  const { dispatch } = props;
  const [searchQueryString, setSearchQueryString] = React.useState('');

  React.useEffect(() => {
    dispatch(
      setTitlebarProps({
        title: 'Search',
      })
    );
  }, [dispatch]);

  const handleSubmit = (queryString: string) => {
    if (queryString.length > 0) {
      setSearchQueryString(queryString);
    }
  };

  const searchFilter = { everythingFeed: true };

  return (
    <ViewGrid>
      <SearchInput handleSubmit={handleSubmit} />

      {searchQueryString && searchQueryString.length > 0 && searchFilter && (
        <SearchThreadFeed
          queryString={searchQueryString}
          filter={searchFilter}
        />
      )}
    </ViewGrid>
  );
};

export default compose(connect())(Search);
