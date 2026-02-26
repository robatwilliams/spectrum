import React from 'react';
// $FlowFixMe
import compose from 'recompose/compose';
// $FlowFixMe
import pure from 'recompose/pure';
// $FlowFixMe
import { connect } from 'react-redux';
import { Button } from '../../../../components/buttons';
import { Avatar } from '../../../../components/avatar';
import { saveUserCommunityPermissionsMutation } from '../../../../api/mutations';
import { addToastWithTimeout } from '../../../../actions/toasts';
import { Checkbox } from '../../../../components/formElements';
import {
  Container,
  Row,
  Column,
  Name,
  Username,
  EditForm,
  List,
  Save,
} from './style';

const UserCommunitySettings = (props) => {
  const { community, dispatch, saveUserCommunityPermissions } = props;

  const getInitialPermissions = () => {
    const {
      communityPermissions: {
        isOwner,
        isMember,
        isBlocked,
        isModerator,
        receiveNotifications,
      },
    } = community;

    return {
      isOwner,
      isMember,
      isBlocked,
      isModerator,
      receiveNotifications,
    };
  };

  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [permissions, setPermissions] = React.useState(getInitialPermissions());

  const initEdit = () => {
    if (isEditing) return;
    setIsEditing(true);
  };

  const save = () => {
    let input = { ...permissions };
    input['id'] = community.id;

    setIsLoading(true);

    saveUserCommunityPermissions(input)
      .then(({ data: { saveUserCommunityPermissions } }) => {
        setIsLoading(false);
        dispatch(addToastWithTimeout('success', 'Saved'));
      })
      .catch(err => {
        setIsLoading(false);
        console.error('error', err);
      });
  };

  const changePermission = e => {
    const perm = e.target.id;
    const current = permissions[perm];
    setPermissions({
      ...permissions,
      [perm]: !current,
    });
  };

  const roles = Object.keys(community.communityPermissions).filter(
    key => community.communityPermissions[key] && key.indexOf('__') === -1
  );
  const role =
    roles.indexOf('isOwner') > -1 ? 'isOwner' : (roles && roles[0]) || '';
  const permissionKeys = Object.keys(permissions);

  return (
    <Container onClick={initEdit}>
      <Row>
        <Avatar size={32} radius={4} src={community.profilePhoto} />
        <Column>
          <Name>{community.name}</Name>
          <Username>{role.substr(2)}</Username>
        </Column>
      </Row>

      {isEditing && (
        <EditForm>
          <List>
            {permissionKeys.map(perm => {
              return (
                <Checkbox
                  id={perm}
                  checked={permissions[perm]}
                  onChange={changePermission}
                  key={perm}
                >
                  <span>{perm}</span>
                </Checkbox>
              );
            })}
          </List>
          <Save>
            <Button onClick={save} loading={isLoading}>
              Save
            </Button>
          </Save>
        </EditForm>
      )}
    </Container>
  );
};

export default compose(saveUserCommunityPermissionsMutation, connect(), pure)(
  UserCommunitySettings
);
