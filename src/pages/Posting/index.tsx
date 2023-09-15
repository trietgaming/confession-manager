import Posting from "./Posting";
import { PostingProvider } from "./Context";
import { Component } from "solid-js";

const PostingWrapper: Component = () => {
  return (
    <PostingProvider>
      <Posting />
    </PostingProvider>
  );
};

export default PostingWrapper;
