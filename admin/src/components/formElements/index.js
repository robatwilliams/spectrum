import React from 'react';

import Icon from '../icons';

import {
  StyledLabel,
  StyledPrefixLabel,
  StyledInput,
  StyledTextArea,
  StyledUnderlineInput,
  StyledHiddenInput,
  StyledCheckboxWrapper,
  StyledError,
  PhotoInputLabel,
  CoverInputLabel,
  InputOverlay,
  ProfileImage,
  CoverImage,
} from './style';

type InputProps = {
  children?: React$Element<any>,
  inputType?: string,
  defaultValue?: ?string,
  placeholder?: string,
  onChange?: Function,
  autoFocus?: boolean,
  checked?: boolean,
  disabled?: boolean,
  id?: string,
};

export const Input = (props: InputProps) => {
  return (
    <StyledLabel {...props}>
      {props.children}
      <StyledInput
        id={props.id}
        type={props.inputType}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        onChange={props.onChange}
        autoFocus={props.autoFocus}
        disabled={props.disabled}
      />
    </StyledLabel>
  );
};

export const PhotoInput = (props: InputProps) => {
  return (
    <PhotoInputLabel user={props.user}>
      <InputOverlay user={props.user}>
        <Icon glyph="photo" />
      </InputOverlay>
      <ProfileImage
        src={`${props.defaultValue}`}
        user={props.user}
        role="presentation"
      />
      <StyledHiddenInput
        type="file"
        id="file"
        name="file"
        accept=".png, .jpg, .jpeg, .gif, .mp4"
        multiple={false}
        onChange={props.onChange}
      />
    </PhotoInputLabel>
  );
};

export const CoverInput = (props: InputProps) => {
  return (
    <CoverInputLabel>
      <InputOverlay>
        <Icon glyph="photo" />
      </InputOverlay>
      <CoverImage
        src={`${props.defaultValue}${props.preview ? '' : '?w=320&dpr=2'}`}
        role="presentation"
      />
      <StyledHiddenInput
        type="file"
        id="file"
        name="file"
        accept=".png, .jpg, .jpeg, .gif, .mp4"
        multiple={false}
        onChange={props.onChange}
      />
    </CoverInputLabel>
  );
};

export const Checkbox = (props: InputProps) => {
  return (
    <StyledLabel>
      <StyledCheckboxWrapper>
        {props.checked ? <Icon glyph="checkmark" /> : <Icon glyph="checkbox" />}
        <StyledHiddenInput
          type="checkbox"
          id={props.id}
          checked={props.checked}
          onChange={props.onChange}
        />
        {props.children}
      </StyledCheckboxWrapper>
    </StyledLabel>
  );
};

export const TextArea = (props: InputProps) => {
  return (
    <StyledLabel>
      {props.children}
      <StyledTextArea
        id={props.id}
        placeholder={props.placeholder}
        defaultValue={props.defaultValue}
        onChange={props.onChange}
        autoFocus={props.autoFocus}
      />
    </StyledLabel>
  );
};

export const UnderlineInput = (props) => {
  return (
    <StyledPrefixLabel disabled={props.disabled}>
      {props.children}
      <StyledUnderlineInput
        type="text"
        id={props.id}
        placeholder={props.placeholder}
        value={props.value || props.defaultValue}
        onChange={props.onChange}
        autoFocus={props.autoFocus}
        disabled={props.disabled}
      />
    </StyledPrefixLabel>
  );
};

export const Error = (props: Object) => {
  return <StyledError>{props.children}</StyledError>;
};
