import React from 'react';
import PropTypes from 'prop-types';

export class EditToken extends React.Component {
  static propTypes = {
    onTokenChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.handleSetToken = this.handleSetToken.bind(this);
    this.state = {
      inputValue: '',
    };
  }

  render() {
    return (
      <div className="setToken">
        {'SetToken:'}
        <input
          type="text"
          placeholder="请输入token"
          onChange={this.handleSetToken}
        />
      </div>
    );
  }

  handleSetToken(event) {
    this.props.onTokenChange(event.target.value);
  }
}
