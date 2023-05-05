import { Component } from "solid-js";
import Button from "ui-components/Button";
import handleLogin from "methods/handleLogin";

const Settings: Component = () => {
  const showPicker = () => {
    // TODO(developer): Replace with your API key
    
  };
  return <Button onClick={showPicker}>Chọn Bảng</Button>;
};

export default Settings;
