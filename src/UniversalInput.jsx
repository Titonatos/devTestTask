import _ from "lodash";
import React, { Component, useState, useRef, useEffect } from "react";
import cn from "classnames";
import { Input, InputNumber, Select } from "antd";
import MaskedInput from "react-input-mask";

import { formatCharsInput } from "./maskFormat";
import maskIsValid from "./maskValidator";

import * as styles from "./styles.css";

const { TextArea } = Input;
const { Option, OptGroup } = Select;

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

const TextInputWithActions = ({
  input,
  value,
  autoFocus,
  readOnly,
  prepareNumber,
  onKeyDown,
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
  onChange,
  formatter,
  children,
  ...otherProps
}) => {
  const [actionsWidth, setActionsWidth] = useState(0);
  const [inputValue, setInputValue] = useState(value);
  const [oldValue, setOldValue] = useState("");
  
  const inputRef = useRef(null);
  const actionsNodeRef = useRef(null);

  const onChangeDebounce = () => _.debounce(onchange, 200);

  const recalcActionsWidth = () => {
    if (actionsNodeRef.current) {
      setActionsWidth(actionsNodeRef.current.clientWidth);    
    }
  }
  
  const setFocus = () => {
    autoFocus && inputRef.current.focus();
  };

  useEffect(() => {
    recalcActionsWidth();
  }, [actionsNodeRef.current]);

  useEffect(() => {
    setFocus();
  }, [])

  const onChangeHandler = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChangeDebounce(newValue);
  };

  const onChangeNumber = (newValue) => {
    const resultValue = prepareNumber?.(newValue) || newValue;
    setInputValue(resultValue);
    onChangeDebounce(newValue);
  };
  
  const setValue = (newValue) => {
    setInputValue(newValue);
    onChangeDebounce(newValue);
  }

  const onBlur = (e) => {
    if (readOnly) {
      return;
    }

    const newValue = e.target.value;
    setBlur(newValue);
  };

  const onBlurSelect = (e) => {
    !readOnly && setBlur(inputValue);
  };

  const setBlur = (newValue) => {
    setInputValue(newValue);
    onChangeDebounce.cancel();
    onChange?.(newValue);

    if (newValue !== oldValue) {
      onEndEditing?.(newValue);
    }

    setOldValue(newValue);
  };

  const onBlurNumber = (e) => {
    if (readOnly) {
      return;
    }

    const newValue = e.target.value;
    const resultValue = prepareNumber?.(newValue) || newValue;

    if (resultValue || oldValue !== "") {
      setBlur(resultValue);
    }
  };

  const keyDownHandler = (e) => {
    onKeyDown?.(e);

    if (!allowTabs) {
      return;
    }

    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      document.execCommand("insertText", false, "\t");
      return false;
    }
  };

  const onChangeMasked = e => {
    const newValue = e.target.value;
    const resultValue = (newValue === mask.replace(/[^-]/g, "_")) ? "" : newValue;
    
    setInputValue(resultValue);
  };

  const getPlaceHolderMask = (mask) => {
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

  const renderSelectOption = (o) => {
    return (
      <Option value={o.value} label={o.label}>
        {o.label}
        {o.subLabel && (
          <span className={styles.optionSubLabel}>{o.subLabel}</span>
        )}
      </Option>
    );
  };

  let { mask, options, ...props } = otherProps;

  mask = mask && maskIsValid(mask) ? mask : undefined;

  const finalValue = value || value === 0 ? value : "";
  
  const textInputContainer = type === "number" ? "" : styles.textInputContainer;
  
  const containerCN = cn(wrapperClassName, textInputContainer, {
    [styles.inputMask]: !multiline && !!mask
  });
  let inputCN = cn(className, {
    [styles.inputReadOnly]: readOnly,
    [styles[theme]]: !!theme,
    [styles.readOnly]: readOnly
  });

  const inputStyle = _.assign({}, style);
  const actionsStyle = {};
  const actionsCN = styles.inputWithActions;

  if (!actions || actions.length == 0) {
    actionsStyle.visibility = "hidden";
  } else if (actionsWidth) {
    inputStyle.paddingRight = actionsWidth;
  }

  const commonProps = {
    ...props,
    ref: inputRef,
    onBlur,
    keyDownHandler,
    style: inputStyle,
    className: inputCN,
  }
  
  
  let control;
  if (type === "number") {
    if (readOnly) {
      control = (
        <span className={inputCN}>
          {formatter?.(finalValue)}
        </span>
      );
    } else {
      control = (
        <InputNumber
          {...commonProps}
          onChange={onChangeNumber}
          style={style}
          onBlur={onBlurNumber}
        />
      );
    }
  } 
  else if (mask) {
    control = (
      <MaskedInput
        formatChars={formatCharsInput}
        mask={mask}
        {...commonProps}
        placeholder={getPlaceHolderMask(mask)}
        value={inputValue}
        onChange={onChangeMasked}
        disabled={readOnly}
      >
        {inputProps => <Input {...inputProps} ref={input} />}
      </MaskedInput>
    );
  } else if (script) {
    control = (
      <CodeEditor
        {...commonProps}
        value={inputValue}
        onChange={setValue}
        subType={subType}
        rows={config.get("rows")}
      />
    );
  } else if (options) {
    const individualInputStyle = _.assign(inputStyle, { width: "100%" });
    const valueInOptions = _.some(options, o => {
      if (o.value === finalValue) {
        return true;
      }
      if (o.options && _.some(o.options, o => o.value === finalValue)) {
        return true;
      }
    });
    if (!valueInOptions && finalValue) {
      inputCN = cn(inputCN, styles.invalidValue);
    }

    control = (
      <Select
        {...commonProps}
        value={inputValue}
        style={individualInputStyle}
        className={inputCN}
        onChange={setValue}
        onBlur={onBlurSelect}
        onInputKeyDown={keyDownHandler}
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
                  return renderSelectOption(o);
                })}
              </OptGroup>
            );
          } else {
            return renderSelectOption(o);
          }
        })}
      </Select>
    );
  } else if (multiline) {
    control = (
      <TextArea
        {...commonProps}
        value={inputValue}
        spellCheck="false"
        rows={4}
        autoSize={{
          minRows: props.readOnly ? 1 : minRows,
          maxRows: maxRows
        }}
        className={cn(inputCN, styles.textArea)}
        onChange={onChangeHandler}
      />
    );
  } else if (children) {
    control = (
      <div style={inputStyle} className={cn("ant-input", inputCN)}>
        {children}
      </div>
    );
  } else {
    control = (
      <Input
        {...commonProps}
        value={inputValue}
        config={config}
        onChange={onChangeHandler}
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
            ref={actionsNodeRef}
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
