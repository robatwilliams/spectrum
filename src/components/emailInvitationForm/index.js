// @flow
import * as React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import { addToastWithTimeout } from 'src/actions/toasts';
import Icon from 'src/components/icon';
import isEmail from 'validator/lib/isEmail';
import sendCommunityEmailInvitations from 'shared/graphql/mutations/community/sendCommunityEmailInvites';
import { OutlineButton } from 'src/components/button';
import { Error } from '../formElements';
import { SectionCardFooter } from 'src/components/settingsViews/style';
import { withCurrentUser } from 'src/components/withCurrentUser';
import {
  EmailInviteForm,
  EmailInviteInput,
  Action,
  ActionAsLabel,
  ActionHelpText,
  RemoveRow,
  CustomMessageTextAreaStyles,
  HiddenInput,
} from './style';

type Props = {
  id: string,
  dispatch: Dispatch<Object>,
  currentUser: Object,
  sendEmailInvites: Function,
};

type ContactProps = {
  email: string,
  firstName: string,
  lastName: string,
  error: boolean,
};

const EmailInvitationForm = (props: Props) => {
  const { id, dispatch, currentUser, sendEmailInvites } = props;

  const [isLoading, setIsLoading] = React.useState(false);
  const [importError, setImportError] = React.useState('');
  const [contacts, setContacts] = React.useState([
    {
      email: '',
      firstName: '',
      lastName: '',
      error: false,
    },
    {
      email: '',
      firstName: '',
      lastName: '',
      error: false,
    },
    {
      email: '',
      firstName: '',
      lastName: '',
      error: false,
    },
  ]);
  const [hasCustomMessage, setHasCustomMessage] = React.useState(false);
  const [customMessageString, setCustomMessageString] = React.useState('');
  const [customMessageError, setCustomMessageError] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  const getUniqueEmails = array => array.filter((x, i, a) => a.indexOf(x) === i);

  const sendInvitations = () => {
    setIsLoading(true);

    let validContacts = contacts
      .filter(contact => !contact.error)
      .filter(contact => contact.email !== currentUser.email)
      .filter(contact => contact.email.length > 0)
      .filter(contact => isEmail(contact.email))
      // eslint-disable-next-line
      .map(({ error, ...contact }) => {
        return { ...contact };
      });

    let customMessage =
      hasCustomMessage && !customMessageError ? customMessageString : null;

    // make sure to uniqify the emails so you can't enter on email multiple times
    validContacts = getUniqueEmails(validContacts);

    if (validContacts.length === 0) {
      setIsLoading(false);

      return dispatch(
        addToastWithTimeout('error', 'No emails entered - try again!')
      );
    }

    sendEmailInvites({
      id: id,
      contacts: validContacts,
      customMessage,
    })
      .then(() => {
        setIsLoading(false);
        setContacts([
          {
            email: '',
            firstName: '',
            lastName: '',
            error: false,
          },
          {
            email: '',
            firstName: '',
            lastName: '',
            error: false,
          },
          {
            email: '',
            firstName: '',
            lastName: '',
            error: false,
          },
        ]);
        setHasCustomMessage(false);
        setCustomMessageString('');
        setCustomMessageError(false);

        return dispatch(
          addToastWithTimeout(
            'success',
            `Invitations sent to ${
              validContacts.length > 1
                ? `${validContacts.length} people`
                : `${validContacts.length} person`
            }!`
          )
        );
      })
      .catch(err => {
        setIsLoading(false);
        dispatch(addToastWithTimeout('error', err.message));
      });
  };

  const handleChange = (e, i, key) => {
    const newContacts = [...contacts];
    newContacts[i][key] = e.target.value;
    setContacts(newContacts);
  };

  const addRow = () => {
    const newContacts = [...contacts];
    newContacts.push({
      email: '',
      firstName: '',
      lastName: '',
      error: false,
    });
    setContacts(newContacts);
  };

  const removeRow = index => {
    const newContacts = [...contacts];
    newContacts.splice(index, 1);
    setContacts(newContacts);
  };

  const validate = (e, i) => {
    const newContacts = [...contacts];
    if (!isEmail(e.target.value)) {
      newContacts[i].error = true;
    } else {
      newContacts[i].error = false;
    }
    setContacts(newContacts);
  };

  const handleCustomMessageChange = e => {
    const newCustomMessageString = e.target.value;
    if (newCustomMessageString.length > 500) {
      setCustomMessageString(newCustomMessageString);
      setCustomMessageError(true);
    } else {
      setCustomMessageString(newCustomMessageString);
      setCustomMessageError(false);
    }
  };

  const toggleCustomMessage = () => {
    setHasCustomMessage(!hasCustomMessage);
  };

  const handleFile = evt => {
    setImportError('');

    // Only show loading indicator for large files
    // where it takes > 200ms to load
    const timeout = setTimeout(() => {
      setIsLoading(true);
    }, 200);

    const reader = new FileReader();
    reader.onload = file => {
      clearTimeout(timeout);
      setIsLoading(false);

      let parsed;
      try {
        if (typeof reader.result !== 'string') return;
        parsed = JSON.parse(reader.result);
      } catch (err) {
        setImportError('Only .json files are supported for import.');
        return;
      }

      if (!Array.isArray(parsed)) {
        setImportError(
          'Your JSON data is in the wrong format. Please provide either an array of emails ["hi@me.com"] or an array of objects with an "email" property and (optionally) a "name" property [{ "email": "hi@me.com", "name": "Me" }].'
        );
        return;
      }

      const formatted = parsed.map(value => {
        if (typeof value === 'string')
          return {
            email: value,
          };

        return {
          email: value.email,
          firstName: value.firstName || value.name,
          lastName: value.lastName,
        };
      });

      const validated = formatted
        .map(value => {
          if (!isEmail(value.email)) return { ...value, error: true };
          return value;
        })
        .filter(Boolean);

      if (validated.length > 5000) {
        setImportError('Cannot invite more than 5,000 emails.');
        return;
      }

      const consolidated = [
        ...contacts.filter(
          contact =>
            contact.email.length > 0 ||
            contact.firstName.length > 0 ||
            contact.lastName.length > 0
        ),
        ...validated,
      ];

      const unique = consolidated.filter(
        (obj, i) =>
          consolidated.findIndex(a => a['email'] === obj['email']) === i
      );

      setContacts(unique);
      setInputValue('');
    };

    reader.readAsText(evt.target.files[0]);
  };

  return (
    <div>
      {importError && <Error>{importError}</Error>}
      {contacts.map((contact, i) => {
        return (
          <EmailInviteForm key={i}>
            <EmailInviteInput
              error={contact.error}
              type="email"
              onBlur={e => validate(e, i)}
              placeholder="Email address"
              value={contact.email}
              onChange={e => handleChange(e, i, 'email')}
            />
            <EmailInviteInput
              type="text"
              placeholder="First name (optional)"
              value={contact.firstName}
              onChange={e => handleChange(e, i, 'firstName')}
              hideOnMobile
            />
            <RemoveRow onClick={() => removeRow(i)}>
              <Icon glyph="view-close" size="16" />
            </RemoveRow>
          </EmailInviteForm>
        );
      })}

      <Action onClick={addRow}>
        <Icon glyph="plus" size={20} /> Add row
      </Action>
      <ActionAsLabel mb="8px">
        <HiddenInput
          value={inputValue}
          type="file"
          accept=".json"
          onChange={handleFile}
        />
        <Icon size={20} glyph="upload" /> Import emails
      </ActionAsLabel>
      <ActionHelpText>
        Upload a .json file with an array of up to 5,000 email addresses.
      </ActionHelpText>

      <Action onClick={toggleCustomMessage}>
        <Icon glyph={hasCustomMessage ? 'view-close' : 'post'} size={20} />
        {hasCustomMessage
          ? 'Remove custom message'
          : 'Optional: Add a custom message to your invitation'}
      </Action>

      {hasCustomMessage && (
        <Textarea
          autoFocus
          value={customMessageString}
          placeholder="Write something sweet here..."
          style={{
            ...CustomMessageTextAreaStyles,
            border: customMessageError
              ? '2px solid #E3353C'
              : '2px solid #DFE7EF',
          }}
          onChange={handleCustomMessageChange}
        />
      )}

      {hasCustomMessage && customMessageError && (
        <Error>
          Your custom invitation message can be up to 500 characters.
        </Error>
      )}

      <SectionCardFooter>
        <OutlineButton
          loading={isLoading}
          onClick={sendInvitations}
          disabled={hasCustomMessage && customMessageError}
        >
          {isLoading ? 'Sending...' : 'Send Invitations'}
        </OutlineButton>
      </SectionCardFooter>
    </div>
  );
}

export const CommunityInvitationForm = compose(
  withCurrentUser,
  sendCommunityEmailInvitations,
  connect()
)(EmailInvitationForm);
