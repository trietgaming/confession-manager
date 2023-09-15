import { Component } from "solid-js";
import Modal from "ui-components/Modal";
import { usePostingContext } from "./Context";

const PostedDialog: Component = () => {
  const { postingData, setPostingData } = usePostingContext();

  return (
    <Modal
      title="Đăng bài thành công!"
      handleSubmit={() => {
        window.open(postingData.newPostLink, "_blank", undefined);
        setPostingData("newPostLink", "");
      }}
      isShow={!!postingData.newPostLink.length}
      handleClose={() => setPostingData("newPostLink", "")}
    >
      Bài viết của bạn đã được đăng lên trang thành công.
      <br />
      Link bài viết:{" "}
      <a class="text-blue-500" href={postingData.newPostLink} target="_blank">
        {postingData.newPostLink}
      </a>
      <br />
      Bấm <b>Xác nhận</b> để mở cửa sổ dẫn đến bài viết của bạn trên Facebook.
    </Modal>
  );
};

export default PostedDialog;