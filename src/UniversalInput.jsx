import _ from "lodash";
import React, { Component, useState } from "react";
import cn from "classnames";
import { Input, InputNumber, Select } from "antd";
import MaskedInput from "react-input-mask";

import { formatCharsInput } from "./maskFormat";
import maskIsValid from "./maskValidator";

import * as styles from "./styles.css";

const { TextArea } = Input;
const { Option, OptGroup } = Select;

// class CodeEditor extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       value: ""
//     };
//   }

//   onChange = e => {
//     const value = e.target.value;
//     this.setState({ value });
//     this.props.onChange && this.props.onChange(value);
//   };

//   onBlur = () => {
//     this.props.onBlur && this.props.onBlur(this.state.value);
//   };

//   render() {
//     const { className, style } = this.props;
//     const { value } = this.state;

//     return (
//       <TextArea
//         rows={4}
//         ref={this.props.inputRef}
//         value={value}
//         onChange={this.onChange}
//         onBlur={this.onBlur}
//         className={className}
//         style={style}
//       />
//     );
//   }
// }


const CodeEditor = (props) => {
  const [value, setValue] = useState("");
  const { onChange, onBlur, inputRef, className, style } = props;

  onChangeHandler = e => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange?.(value);
  };

  return (
    <TextArea
      rows={4}
      ref={inputRef}
      value={value}
      onChange={onChangeHandler}
      onBlur={onBlur}
      className={className}
      style={style}
    />
  );
}

class TextInputWithActions extends Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.state = { actionsWidth: 0, value: this.props.value, oldValue: "" };
  }

  recalcActionsWidth() {
    if (!this.actionsNode) {
      return;
    }

    const actionsWidth = this.actionsNode.clientWidth;
    if (actionsWidth !== this.state.actionsWidth) {
      this.setState({
        actionsWidth
      });
    }
  }

  setFocus = () => {
    if (this.props.autoFocus) {
      this.input.current.focus();
    }
  };

  componentDidMount() {
    this.recalcActionsWidth();
    this.setFocus();
  }

  componentDidUpdate() {
    this.recalcActionsWidth();
  }

  onChange = e => {
    const value = e.target.value;
    this.setState({ value });
    this.onChangeDebounce(value);
    this.setValue(value);
  };

  setValue = value => {
    this.setState({ value });
    this.onChangeDebounce(value);
  };

  onBlur = e => {
    if (this.props.readOnly) {
      return;
    }
    const value = e.target.value;
    this.setBlur(value);
  };

  onBlurSelect = e => {
    if (this.props.readOnly) {
      return;
    }

    this.setBlur(this.state.value);
  };

  onChangeNumber = value => {
    value = this.props.prepareNumber ? this.props.prepareNumber(value) : value;
    this.setState({ value });
    this.onChangeDebounce(value);
  };

  onBlurNumber = e => {
    if (this.props.readOnly) {
      return;
    }
    let value = e.target.value;
    value = this.props.prepareNumber ? this.props.prepareNumber(value) : value;
    if (value || this.state.oldValue !== "") {
      this.setBlur(value);
    }
  };

  setBlur = value => {
    this.setState({ value });
    this.onChangeDebounceCancel();
    this.props.onChange && this.props.onChange(value);
    if (value !== this.state.oldValue) {
      this.props.onEndEditing && this.props.onEndEditing(value);
    } else if (_.isNumber(value) && value !== this.state.oldValue) {
      this.props.onEndEditing && this.props.onEndEditing(value);
    }
    this.state.oldValue = value;
  };

  onChangeDebounce = value => {
    this.onChangeDebounceCancel();
    this.changeTimer = setTimeout(() => {
      this.props.onChange && this.props.onChange(value);
    }, 200);
  };

  onChangeDebounceCancel = () => {
    clearTimeout(this.changeTimer);
  };

  onKeyDown = e => {
    this.props.onKeyDown && this.props.onKeyDown(e);

    if (!this.props.allowTabs) {
      return;
    }

    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      document.execCommand("insertText", false, "\t");
      return false;
    }
  };

  onChangeMasked = e => {
    let { mask } = this.props;
    const value = e.target.value;

    if (value === mask.replace(/[^-]/g, "_")) {
      this.setValue("");
    } else {
      this.setValue(value);
    }
  };

  getPlaceHolderMask = mask => {
    const charsEditableMask = _.keys(formatCharsInput).join("");
    let placeholder = "";
    let shielding = false;

    for (let i = 0; i < mask.length; i++) {
      if (shielding) {
        shielding = false;
        placeholder += mask[i];
        continue;
      }

      if (mask[i] == "\\") {
        shielding = true;
        continue;
      }

      if (charsEditableMask.includes(mask[i])) {
        placeholder += "_";
        continue;
      }

      placeholder += mask[i];
    }

    return placeholder;
  };

  renderSelectOption = o => {
    return (
      <Option value={o.value} label={o.label}>
        {o.label}
        {o.subLabel && (
          <span className={styles.optionSubLabel}>{o.subLabel}</span>
        )}
      </Option>
    );
  };

  render() {
    const {
      wrapperClassName,
      className,
      style,
      actionsClassName,
      inputWrapperClassName,
      actions,
      type,
      theme,
      multiline,
      script,
      minRows = 1,
      maxRows = 20,
      config,
      onEndEditing,
      allowTabs,
      subType,
      t,
      isAdditional,
      ...otherProps
    } = this.props;

    let { mask, options, ...props } = otherProps;

    mask = mask && maskIsValid(mask) ? mask : undefined;

    const value =
      this.state.value || this.state.value === 0 ? this.state.value : "";

    const textInputContainer =
      type === "number" ? "" : styles.textInputContainer;

    const containerCN = cn(wrapperClassName, textInputContainer, {
      [styles.inputMask]: !multiline && !!mask
    });
    let inputCN = cn(className, {
      [styles.inputReadOnly]: this.props.readOnly,
      [styles[theme]]: !!theme,
      [styles.readOnly]: this.props.readOnly
    });

    let actionsCN;

    const { actionsWidth } = this.state;
    let inputStyle = _.assign({}, style);
    const actionsStyle = {};
    const { onChange, ...numberProps } = this.props;
    actionsCN = styles.inputWithActions;

    if (!actions || actions.length == 0) {
      actionsStyle.visibility = "hidden";
    } else if (actionsWidth) {
      inputStyle.paddingRight = actionsWidth;
    }

    let control;
    if (type === "number") {
      if (this.props.readOnly) {
        control = (
          <span className={inputCN}>
            {this.props.formatter && this.props.formatter(value)}
          </span>
        );
      } else {
        control = (
          <InputNumber
            ref={this.input}
            onKeyDown={this.onKeyDown}
            className={inputCN}
            value={value}
            onChange={this.onChangeNumber}
            onBlur={this.onBlurNumber}
            style={style}
            {...props}
          />
        );
      }
    } 
    else if (mask) {
      control = (
        <MaskedInput
          formatChars={formatCharsInput}
          onKeyDown={this.onKeyDown}
          mask={mask}
          {...props}
          placeholder={this.getPlaceHolderMask(mask)}
          value={this.state.value}
          style={inputStyle}
          className={inputCN}
          onChange={this.onChangeMasked}
          onBlur={this.onBlur}
          disabled={this.props.readOnly}
        >
          {inputProps => <Input {...inputProps} ref={this.input} />}
        </MaskedInput>
      );
    } else if (script) {
      control = (
        <CodeEditor
          ref={this.input}
          {...props}
          value={value}
          style={inputStyle}
          className={inputCN}
          onChange={this.setValue}
          onBlur={this.setBlur}
          subType={subType}
          rows={config.get("rows")}
        />
      );
    } else if (options) {
      inputStyle = _.assign(inputStyle, { width: "100%" });
      const valueInOptions = _.some(options, o => {
        if (o.value === value) {
          return true;
        }
        if (o.options && _.some(o.options, o => o.value === value)) {
          return true;
        }
      });
      if (!valueInOptions && value) {
        inputCN = cn(inputCN, styles.invalidValue);
      }

      control = (
        <Select
          ref={this.input}
          {...props}
          className={inputCN}
          style={inputStyle}
          value={value}
          onChange={this.setValue}
          onBlur={this.onBlurSelect}
          onInputKeyDown={this.onKeyDown}
          showSearch={true}
          bordered={false}
          showArrow={false}
          dropdownMatchSelectWidth={300}
          filterOption={(input, option) =>
            (option.label || "").toLowerCase().includes(input.toLowerCase())
          }
        >
          {options.map(o => {
            if (_.isArray(o.options)) {
              return (
                <OptGroup key={o.value} label={o.label}>
                  {o.options.map(o => {
                    return this.renderSelectOption(o);
                  })}
                </OptGroup>
              );
            } else {
              return this.renderSelectOption(o);
            }
          })}
        </Select>
      );
    } else if (multiline) {
      control = (
        <TextArea
          ref={this.input}
          {...props}
          value={value}
          spellCheck="false"
          rows={4}
          autoSize={{
            minRows: props.readOnly ? 1 : minRows,
            maxRows: maxRows
          }}
          className={cn(inputCN, styles.textArea)}
          onChange={this.onChange}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
        />
      );
    } else if (this.props.children) {
      control = (
        <div style={inputStyle} className={cn("ant-input", inputCN)}>
          {this.props.children}
        </div>
      );
    } else {
      control = (
        <Input
          ref={this.input}
          {...props}
          config={config}
          value={value}
          style={inputStyle}
          className={inputCN}
          onChange={this.onChange}
          onBlur={this.onBlur}
          onKeyDown={this.onKeyDown}
        />
      );
    }
    return (
      <div className={containerCN}>
        {control}
        {(actions &&
          actions.length && (
            <ul
              className={cn(actionsClassName, actionsCN)}
              ref={node => (this.actionsNode = node)}
              style={actionsStyle}
            >
              {actions.map((node, i) => (
                <li key={i}>{node}</li>
              ))}
            </ul>
          )) ||
          null}
      </div>
    );
  }
}

class UniversalInput extends Component {
  state = {
    shouldProcess: false
  };

  onChange = value => {
    this.props.onChange && this.props.onChange(value);
    this.props.eventable && this.setState({ shouldProcess: true });
  };

  onEndEditing = value => {
    this.props.onEndEditing && this.props.onEndEditing(value);
    this.setState({ shouldProcess: false });
  };

  render() {
    const {
      updateProcess,
      eventable,
      actions,
      onEndEditing,
      t,
      ...props
    } = this.props;
    let { shouldProcess } = this.state;
    const inProcess = updateProcess && updateProcess.get("inProcess");

    const newActions = [...(actions || [])];
    if (shouldProcess || inProcess) {
      newActions.push(
        <span
          className={cn(styles.actionIcon, {
            [styles.actionIconGray]: inProcess
          })}
          title={inProcess ? "" : "ready to send"}
        >
        </span>
      );
    }
    return (
      <TextInputWithActions
        {...props}
        onEndEditing={this.onEndEditing}
        onChange={this.onChange}
        actions={newActions}
      />
    );
  }
}

export default UniversalInput
