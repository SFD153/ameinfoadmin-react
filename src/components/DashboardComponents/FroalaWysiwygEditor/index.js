import React from 'react';
import FroalaEditor from 'react-froala-wysiwyg';
import { froalaConfig } from 'configs/froala';

const FroalaWysiwygEditor = props => {
  return <FroalaEditor tag="textarea" config={froalaConfig} {...props} />;
};

export default FroalaWysiwygEditor;
