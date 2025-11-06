import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import PropTypes from 'prop-types';
import { PlusOutlined } from '@ant-design/icons';
import { TagStyle } from './style';
import Styled from 'styled-components';

const { CheckableTag } = TagStyle;

const TagLabel = Styled.span`
  text-wrap: pretty !important;
`;

function Tag(props) {
  const [state, setState] = useState({
    checked: true,
    selectedTags: [],
  });

  const { closable, onClose, color, checked, onChange, onInsert, data, hottags, animate, children, lastTagValid, buttonLabel, isDoingServerCheck } = props;
  const tagsFromServer = data;

  const log = e => {
    onClose(e);
  };

  const handleChange = checke => {
    setState({ ...state, checke });
    if (onChange) onChange(checke);
  };

  const handleChangeHot = (tag, checke) => {
    const { selectedTags } = state;
    const nextSelectedTags = checke ? [...selectedTags, tag] : selectedTags.filter(t => t !== tag);
    // console.log('You are interested in: ', nextSelectedTags);
    setState({
      ...state,
      selectedTags: nextSelectedTags,
    });
    if (onChange) onChange(nextSelectedTags);
  };

  const { selectedTags } = state;

  return checked ? (
    <CheckableTag props={props} checked={state.checked} onChange={handleChange} />
  ) : hottags ? (
    <>
      <span style={{ marginRight: 8 }}>Categories:</span>
      {tagsFromServer.map(tag => (
        <CheckableTag
          key={tag}
          checked={selectedTags.indexOf(tag) > -1}
          onChange={checke => handleChangeHot(tag, checke)}
        >
          {tag}
        </CheckableTag>
      ))}
    </>
  ) : animate ? (
    <AnimatedTags data={data} onChange={onChange} onInsert={onInsert} lastTagValid={lastTagValid} buttonLabel={buttonLabel} isDoingServerCheck={isDoingServerCheck} />
  ) : (
    <TagStyle closable={closable} onClose={log} color={color}>
      {children}
    </TagStyle>
  );
}

Tag.propTypes = {
  data: PropTypes.arrayOf(PropTypes.string),
  closable: PropTypes.bool,
  onClose: PropTypes.func,
  color: PropTypes.string,
  checked: PropTypes.bool,
  onChange: PropTypes.func,
  onInsert: PropTypes.func,
  hottags: PropTypes.bool,
  animate: PropTypes.bool,
  lastTagValid: PropTypes.bool,
  isDoingServerCheck: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.string, PropTypes.node]),
  buttonLabel: PropTypes.string,
};

function AnimatedTags(props) {
  const { data, onChange, onInsert, lastTagValid, buttonLabel, isDoingServerCheck } = props;
  const [state, setState] = useState({ tags: data, inputVisible: false, inputValue: '' });

  const handleClose = removedTag => {
    const tags = state.tags.filter(tag => tag !== removedTag);
    // console.log(tags);
    setState({ tags });
    if (onChange) onChange(tags);
  };

  const showInput = () => {
    setState({ ...state, inputVisible: true });
  };

  const handleInputChange = e => {
    setState({ ...state, inputValue: e.target.value });
  };

  const handleInputConfirm = () => {
    const { inputValue } = state;
    let { tags } = state;
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue];
    }

    if (onChange) onChange(tags);
    if (onInsert) onInsert(inputValue);
    setState({
      ...state,
      tags,
      inputVisible: false,
      inputValue: '',
    });
  };

  const forMap = tag => {
    const fullTag = data.find(x=>x.includes(tag)) ?? tag;
    const tagElem = (
      <TagStyle
        closable
        onClose={e => {
          e.preventDefault();
          handleClose(tag);
        }}
      >
        {fullTag}
      </TagStyle>
    );

    return (
      <span key={tag} style={{ display: 'inline-block' }}>
        {tagElem}
      </span>
    );
  };

  const { tags, inputVisible, inputValue } = state;
  const tagChild = tags.map(forMap);

  useEffect(() => {
    if (!lastTagValid) {
      let { tags } = state;
      tags = tags.slice(0, -1);
      setState({
        ...state,
        tags,
      })
    }
  }, [lastTagValid]);

  return (
    <div>
      <div style={{ marginBottom: 10 }}>{tagChild}</div>

      {inputVisible && (
        <Input
          autoFocus
          type="text"
          size="small"
          style={{ width: 78 }}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      )}

      {!inputVisible && (
        <TagStyle onClick={showInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
          <PlusOutlined style={{marginRight: '5px'}}/>
          <TagLabel>{buttonLabel || 'New Tag'}</TagLabel>
          {isDoingServerCheck && (
            <span class="ant-input-suffix">
              <span class="ant-form-item-feedback-icon ant-form-item-feedback-icon-validating">
                <span role="img" aria-label="loading" class="anticon anticon-loading anticon-spin">
                  <svg viewBox="0 0 1024 1024" focusable="false" data-icon="loading" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                    <path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z">
                    </path>
                  </svg>
                </span>
              </span>
            </span>
          )}
        </TagStyle>
      )}
    </div>
  );
}

AnimatedTags.propTypes = {
  data: PropTypes.array,
  onChange: PropTypes.func,
  onInsert: PropTypes.func,
  lastTagValid: PropTypes.bool,
  isDoingServerCheck: PropTypes.bool,
  buttonLabel: PropTypes.string,
};

export { Tag };
