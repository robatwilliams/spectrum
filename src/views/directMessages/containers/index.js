// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import type { Dispatch } from 'redux';
import type { Match } from 'react-router';
import Head from 'src/components/head';
import ThreadsList from '../components/threadsList';
import ExistingThread from './existingThread';
import { PrimaryOutlineButton } from 'src/components/button';
import { setTitlebarProps } from 'src/actions/titlebar';
import {
  ViewGrid,
  SecondaryPrimaryColumnGrid,
  PrimaryColumn,
} from 'src/components/layout';
import {
  StyledSecondaryColumn,
  NoCommunitySelected,
  NoCommunityHeading,
  NoCommunitySubheading,
} from '../style';

type Props = {
  match: Match,
  dispatch: Dispatch<Object>,
};

const DirectMessages = (props: Props) => {
  const { match, dispatch } = props;
  const activeThreadId = match.params.threadId;

  React.useEffect(() => {
    if (!activeThreadId) {
      dispatch(
        setTitlebarProps({
          title: 'Messages',
          rightAction: (
            <PrimaryOutlineButton size={'small'} to={'/new/message'}>
              New
            </PrimaryOutlineButton>
          ),
        })
      );
    }
  }, [activeThreadId, dispatch]);

  return (
    <ViewGrid>
      <SecondaryPrimaryColumnGrid>
        <StyledSecondaryColumn shouldHideThreadList={!!activeThreadId}>
          <ThreadsList activeThreadId={activeThreadId} />
        </StyledSecondaryColumn>

        <PrimaryColumn>
          {activeThreadId ? (
            <ExistingThread id={activeThreadId} match={match} />
          ) : (
            <NoCommunitySelected>
              <Head title={'Messages'} />
              <div>
                <NoCommunityHeading>
                  No conversation selected
                </NoCommunityHeading>
                <NoCommunitySubheading>
                  Choose from an existing conversation, or start a new one.
                </NoCommunitySubheading>
                <PrimaryOutlineButton
                  to={{
                    pathname: '/new/message',
                    state: { modal: true },
                  }}
                >
                  New message
                </PrimaryOutlineButton>
              </div>
            </NoCommunitySelected>
          )}
        </PrimaryColumn>
      </SecondaryPrimaryColumnGrid>
    </ViewGrid>
  );
};

export default connect()(DirectMessages);
