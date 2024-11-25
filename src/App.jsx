import React from "react";
import { useState, useEffect } from "react";
import "./App.css";
import UniversalInput from "./UniversalInput";

const App = () => {
  const [firstValue, setFirstValue] = useState(localStorage.getItem('firstValue') || "");
  const [secondValue, setSecondValue] = useState(localStorage.getItem('secondValue') || "");
  const [thirdValue, setThirdValue] = useState(localStorage.getItem('thirdValue') || "");
  const [fourValue, setFourValue] = useState(localStorage.getItem('fourValue') || "");
  const [fiveValue, setFiveValue] = useState(localStorage.getItem('fiveValue') || "");

  const updateValue = (name, setValueFunc) => (newValue) => {
    setValueFunc(newValue);
    localStorage.setItem(name, newValue);
  };

  const handleStorageChange = (event) => {
    switch (event.key) {
      case 'firstValue':
        setFirstValue(event.newValue);
        break;
      case 'secondValue':
        setSecondValue(event.newValue);
        break;
      case 'thirdValue':
        setThirdValue(event.newValue);
        break;
      case 'fourValue':
        setFourValue(event.newValue);
        break;
      case 'fiveValue':
        setFiveValue(event.newValue);
        break;
      default:
          break;
  }};

  window.addEventListener('storage', handleStorageChange);

  return (
    <div className="main">
      <h1 className="title">THIS IS NOT A TEST TASK</h1>
      <div className="inputItems">
        
        <UniversalInput
          type="number"
          disabled={false}
          value={firstValue}
          onChange={updateValue('firstValue', setFirstValue)}
          placeholder="Number type"
          style={{ width: "100%" }}
          className="inputItem"
        />
        <UniversalInput
          disabled={false}
          value={secondValue}
          onChange={updateValue('secondValue', setSecondValue)}
          placeholder="Text type"
          style={{ width: "100%" }}
          className="inputItem"
        />
        <UniversalInput
          multiline={true}
          disabled={false}
          value={thirdValue}
          onChange={updateValue('thirdValue', setThirdValue)}
          placeholder="Text multiline type"
          style={{ width: "100%" }}
          className="inputItem"
        />
        <UniversalInput
          disabled={false}
          value={fourValue}
          onChange={updateValue('fourValue', setFourValue)}
          mask={"111-111"}
          placeholder="With mask"
          style={{
            width: "100%",
            backgroundColor: "white",
            color: "black",
            borderRadius: "15px",
          }}
          className="inputItem"
        />
        <UniversalInput
          disabled={false}
          value={fiveValue}
          onChange={updateValue('fiveValue', setFiveValue)}
          options={[
            { value: "first element", label: "first element" },
            { value: "second element", label: "second element" },
            { value: "third element", label: "third element" },
          ]}
          placeholder="Another type"
          style={{
            width: "100%",
            backgroundColor: "white",
            color: "black",
            borderRadius: "15px",
          }}
          className="inputItem"
        />
      </div>
    </div>
  );
};

export default App;
