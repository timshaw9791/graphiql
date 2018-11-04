/**
 *  Copyright (c) Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the license found in the
 *  LICENSE file in the root directory of this source tree.
 *
 *
 *  用来替换是MarkdownContent，MarkDownContent 使用了Markdown，转成html是换行失效，暂时仅使用普通的text来代替
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class TextContent extends React.Component {
  static propTypes = {
    text: PropTypes.string,
    className: PropTypes.string,
  };

  shouldComponentUpdate(nextProps) {
    return this.props.text !== nextProps.text;
  }

  render() {
    const text = this.props.text;

    if (!text) {
      return <div />;
    }
    return (
      <div
        className={this.props.className}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }
}
