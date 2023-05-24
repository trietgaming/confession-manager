import { Component } from "solid-js";
import Modal from "ui-components/Modal";

const ConditionalFilteringModal: Component<{
  title: string;
  isShow?: boolean;
  handleClose?: () => any;
}> = (props) => {
  return (
    <Modal
      title={props.title}
      isShow={props.isShow}
      handleClose={props.handleClose}
    >Updating...</Modal>
  );
};

export default ConditionalFilteringModal;
