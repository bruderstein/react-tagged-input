/**
 * @jsx React.DOM
 */

var React = require('react');
var joinClasses = require('react/lib/joinClasses');

var delimiters = [' ', ','];

var KEY_CODES = {
  ENTER: 13,
  BACKSPACE: 8
};

var DefaultTagComponent = React.createClass({

  render: function() {
    var self = this, p = self.props;

    return (
      <div className={joinClasses("tag", this.props.classes)}>
        <div className="tag-text">{p.item}</div>
        <div className="remove"
          onClick={p.onRemove}>
          {"\u274C"}
        </div>
      </div>
    );
  }

});

var TaggedInput = React.createClass({

  propTypes: {
    onAddTag: React.PropTypes.func,
    onRemoveTag: React.PropTypes.func,
    onEnter: React.PropTypes.func,
    unique: React.PropTypes.bool,
    autofocus: React.PropTypes.bool,
    backspaceDeletesWord: React.PropTypes.bool,
    placeholder: React.PropTypes.string
  },

  getInitialState: function () {
    return {
      tags: this.props.tags || [],
      unique: this.props.unique || true,
      currentInput: null
    };
  },

  render: function() {
    var self = this, s = self.state, p = self.props;

    var tagComponents = [],
      classes = "tagged-input-wrapper",
      placeholder,
      i;

    if (p.classes) {
      classes += ' ' + p.classes;
    }

    if (s.tags.length === 0) {
      placeholder = p.placeholder;
    }

    var TagComponent = DefaultTagComponent;

    for (i = 0 ; i < s.tags.length; i++) {
      tagComponents.push(
        <TagComponent
          item={s.tags[i]}
          itemIndex={i}
          onRemove={self._handleRemoveTag.bind(this, i)}
          classes={p.unique && (i === s.duplicateIndex) ? 'duplicate' : ''}
        />
      );
    }

    var input = (
      <input type="text"
        className="tagged-input"
        ref="input"
        onKeyUp={this._handleKeyUp}
        onKeyDown={this._handleKeyDown}
        onChange={this._handleChange}
        value={s.currentInput}
        placeholder={placeholder}>
      </input>
    );

    return (
      <div className={classes}
        onClick={self._handleClickOnWrapper}>
        {tagComponents}
        {input}
      </div>
    );
  },

  componentDidMount: function() {
    var self = this, s = self.state, p = self.props;

    if (p.autofocus) {
      self.refs.input.getDOMNode().focus();
    }
  },

  _handleRemoveTag: function (index) {
    var self = this, s = self.state, p = self.props;

    var removedItems = s.tags.splice(index, 1);
    var duplicateIndex;

    if (s.duplicateIndex) {
      self.setState({duplicateIndex: null}, function () {
        if (p.onRemoveTag) {
          p.onRemoveTag(removedItems[0]);
        }
      });
    } else {
      if (p.onRemoveTag) {
        p.onRemoveTag(removedItems[0]);
      }
      self.forceUpdate();
    }
  },

  _handleKeyUp: function (e) {
    var self = this, s = self.state, p = self.props;

    var enteredValue = e.target.value;

    switch (e.keyCode) {
      case KEY_CODES.ENTER:
        if (s.currentInput) {
          self._validateAndTag(s.currentInput, function (status) {
            if (p.onEnter) {
              p.onEnter(e, s.tags);
            }
          });
        }
      break;
    }
  },

  _handleKeyDown: function (e) {
    var self = this,
      s = self.state,
      p = self.props,
      poppedValue,
      newCurrentInput;

    switch (e.keyCode) {
      case KEY_CODES.BACKSPACE:
        if (!e.target.value || e.target.value.length < 0) {
          poppedValue = s.tags.pop();

          newCurrentInput = p.backspaceDeletesWord ? '': poppedValue;

          this.setState({
            currentInput: newCurrentInput,
            duplicateIndex: null
          });
          if (p.onRemoveTag) {
            p.onRemoveTag(poppedValue);
          }
        }
        break;
    }
  },

  _handleChange: function (e) {
    var self = this, s = self.state, p = self.props;

    var value = e.target.value,
      lastChar = value.charAt(value.length - 1),
      tagText = value.substring(0, value.length - 1);

    if (delimiters.indexOf(lastChar) !== -1) {
      self._validateAndTag(tagText);
    } else {
      this.setState({
        currentInput: e.target.value
      });
    }
  },

  _handleClickOnWrapper: function (e) {
    this.refs.input.getDOMNode().focus();
  },

  _validateAndTag: function (tagText, callback) {
    var self = this, s = self.state, p = self.props;
    var duplicateIndex;
    var trimmedText;

    if (tagText && tagText.length > 0) {
      trimmedText = tagText.trim();
      if (s.unique) {
        duplicateIndex = this.state.tags.indexOf(trimmedText);

        if (duplicateIndex === -1) {
          s.tags.push(trimmedText);
          self.setState({
            currentInput: '',
            duplicateIndex: null
          }, function () {
            if (p.onAddTag) {
              p.onAddTag(tagText);
            }
            if (callback) {
              callback(true);
            }
          });
        } else {
          self.setState({duplicateIndex: duplicateIndex}, function () {
            if (callback) {
              callback(false);
            }
          });
        }
      } else {
        s.tags.push(trimmedText);
        self.setState({currentInput: ''}, function () {
          if (p.onAddTag) {
            p.onAddTag(tagText);
          }
          if (callback) {
            callback(true);
          }
        });
      }
    }
  },

  getTags: function () {
    return this.state.tags;
  },

  getEnteredText: function () {
    return this.state.currentInput;
  },

  getAllValues: function () {
    var self = this, s = this.state, p = this.props;

    if (s.currentInput && s.currentInput.length > 0) {
      return (this.state.tags.concat(s.currentInput));
    } else {
      return this.state.tags;
    }
  }

});

module.exports = TaggedInput;
