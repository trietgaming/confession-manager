import {
  CHAT_QUOTE_ICON,
  RETURN_ICON_URL,
  RIGHT_ARROW_ICON_URL,
} from "app-constants";
import Confession from "classes/Confesison";
import { Component, JSX, Show, createSignal } from "solid-js";
import { confessionPageMetadata } from "store/index";

const PreviewPostConfession: Component<{
  confession: Confession;
  index: number;
  handleMoveUp: () => any;
  handleMoveDown: () => any;
  handleRemove: () => any;
  showDate?: boolean;
  showTime?: boolean;
}> = (props) => {
  const [date, time] = props.confession.getTimestamp().split(" ");
  const confessionNumber =
    (confessionPageMetadata.lastestConfessionNumber || 0) + props.index + 1;
  const [isReplyEnabled, setReplyEnabled] = createSignal(false);

  let cfsReplyRef: HTMLSpanElement | undefined;

  return (
    <>
      <span class="flex space-x-1 absolute space-y-0 flex-nowrap content-start -translate-x-20 items-center select-none">
        <button
          class="hover:bg-gray-400 rounded-md "
          onClick={props.handleRemove}
        >
          <img src={RETURN_ICON_URL} alt="Hủy" class="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            setReplyEnabled((prev) => !prev);
            cfsReplyRef?.focus();
          }}
          class={`hover:bg-gray-400 rounded-md ${
            isReplyEnabled() ? "bg-sky-300" : ""
          }`}
        >
          <img src={CHAT_QUOTE_ICON} alt="Trả lời" class="w-5 h-5" />
        </button>
        <div class="flex flex-col">
          <button
            class="-rotate-90 bg-gray-200 hover:bg-gray-400 p-0 rounded"
            onClick={props.handleMoveUp}
          >
            <img src={RIGHT_ARROW_ICON_URL} class="w-4 h-4" />
          </button>
          <button
            class="rotate-90 bg-gray-200 hover:bg-gray-400 p-0 rounded"
            onClick={props.handleMoveDown}
          >
            <img src={RIGHT_ARROW_ICON_URL} class="w-4 h-4" />
          </button>
        </div>
      </span>
      <span>
        #{confessionPageMetadata.hashtag}
        {confessionNumber}{" "}
        {props.showDate && props.showTime
          ? props.confession.getTimestamp()
          : props.showDate
          ? date
          : props.showTime
          ? time
          : ""}{" "}
        {props.confession.getData()}
      </span>
      <Show when={isReplyEnabled()}>
        <span class="after:content-['\\0200B']">
          <br />
          <br />
        </span>
        <span>
          <span>
            #{confessionPageMetadata.replyHashtag + confessionNumber}{" "}
          </span>
          <span class="outline-none border-none" contentEditable ref={cfsReplyRef}></span>
        </span>
      </Show>
    </>
  );
};

export default PreviewPostConfession;
