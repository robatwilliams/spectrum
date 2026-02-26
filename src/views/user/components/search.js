// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { throttle } from 'src/helpers/utils';
import searchThreadsQuery from 'shared/graphql/queries/search/searchThreads';
import ThreadFeed from 'src/components/threadFeed';
import { SearchContainer, SearchInput } from '../style';

const SearchThreadFeed = compose(searchThreadsQuery)(ThreadFeed);

type Props = {
  community: Object,
  user: Object,
};

const Search = (props) => {
  const [searchString, setSearchString] = React.useState('');
  const [sendStringToServer, setSendStringToServer] = React.useState('');

  const search = React.useCallback(
    throttle((searchString) => {
      // don't start searching until at least 3 characters are typed
      if (searchString.length < 3) return;

      // start the input loading spinner
      setSendStringToServer(searchString);
    }, 500),
    []
  );

  const handleChange = (e: any) => {
    const searchString = e.target.value.toLowerCase().trim();

    // set the searchstring to state
    setSearchString(searchString);

    // trigger a new search based on the search input
    // $FlowIssue
    search(searchString);
  };

  const { user } = props;

  return (
    <div>
      <SearchContainer>
        <SearchInput
          defaultValue={searchString}
          autoFocus={true}
          type="text"
          placeholder={`Search ${user.name}'s conversations...`}
          onChange={handleChange}
        />
      </SearchContainer>
      {searchString && sendStringToServer && (
        <SearchThreadFeed
          search
          viewContext="userProfile"
          userId={user.id}
          queryString={sendStringToServer}
          filter={{ creatorId: user.id }}
          user={user}
        />
      )}
    </div>
  );
};

export default compose()(Search);
