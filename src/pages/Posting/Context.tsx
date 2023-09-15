import {
  Component,
  ParentComponent,
  createContext,
  useContext,
} from "solid-js";

import { SetStoreFunction, createStore } from "solid-js/store";
import { PostTemplateSettings, PostingData } from "types";

const PostingContext = createContext<{
  setPostTemplateSettings: SetStoreFunction<PostTemplateSettings>;
  postTemplateSettings: PostTemplateSettings;
  setPostingData: SetStoreFunction<PostingData>;
  postingData: PostingData;
}>({} as any);

const PostingProvider: ParentComponent = (props) => {
  const [postingData, setPostingData] = createStore<PostingData>({
    isPosting: false,
    newPostLink: "",
  });

  const [postTemplateSettings, setPostTemplateSettings] =
    createStore<PostTemplateSettings>({});

  return (
    <PostingContext.Provider
      value={{
        postingData,
        setPostingData,
        postTemplateSettings,
        setPostTemplateSettings,
      }}
    >
      {props.children}
    </PostingContext.Provider>
  );
};

const usePostingContext = () => useContext(PostingContext)!;

export { PostingContext, PostingProvider, usePostingContext };
