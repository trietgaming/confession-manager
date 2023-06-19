import { RETURN_ICON_URL, RIGHT_ARROW_ICON_URL } from "app-constants";
import Confession from "classes/Confesison";
import { Component, JSX } from "solid-js";
import { confessionPageMetadata } from "store/index";

const PreviewPostConfession: Component<{
  confession: Confession;
  index: number;
  handleMoveUp: () => any;
  handleMoveDown: () => any;
  handleRemove: () => any;
}> = (props) => {
  return (
    <div class="relative">
      <div class="flex space-x-1 absolute space-y-0 flex-nowrap content-start -translate-x-14 items-center select-none">
        <button
          class="hover:bg-gray-200 rounded-md"
          onClick={props.handleRemove}
        >
          <img src={RETURN_ICON_URL} alt="Hủy" class="w-5 h-5" />
        </button>
        <div class="flex flex-col">
          <button
            class="-rotate-90 bg-gray-200 hover:bg-white p-0 rounded"
            onClick={props.handleMoveUp}
          >
            <img src={RIGHT_ARROW_ICON_URL} class="w-4 h-4" />
          </button>
          <button
            class="rotate-90 bg-gray-200 hover:bg-white p-0 rounded"
            onClick={props.handleMoveDown}
          >
            <img src={RIGHT_ARROW_ICON_URL} class="w-4 h-4" />
          </button>
        </div>
      </div>
      #{confessionPageMetadata.hashtag}
      {(confessionPageMetadata.lastestConfessionNumber || 0) +
        props.index +
        1}{" "}
      {props.confession.getData()}
    </div>
  );
};

export default PreviewPostConfession;
