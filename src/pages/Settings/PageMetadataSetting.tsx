import { Component, Show, batch, createEffect, createSignal } from "solid-js";
import {
  doubleTitleContainerClass,
  settingContainerClass,
  titleIconClass,
} from ".";
import {
  CONFESSION_LASTEST_HASHTAG_NUMBER_METADATA_KEY,
  CONFESSION_PAGE_HASHTAG_METADATA_KEY,
  CONFESSION_PAGE_REPLY_HASHTAG_METADATA_KEY,
  HASHTAG_LOGO_URL,
  NUMBER_LIST_ICON_URL,
  RELOAD_ICON_URL,
} from "app-constants";
import { confessionPageMetadata, currentConfessionPage } from "store/index";
import Button from "ui-components/Button";
import updateSpreadsheetMetadata from "methods/updateSpreadsheetMetadata";
import LoadingCircle from "ui-components/LoadingCircle";

const PageMetadataSetting: Component = () => {
  const [isSubmitting, setSubmitting] = createSignal(false);
  const [isLastestNumberSubmitting, setLastestNumberSubmitting] =
    createSignal(false);

  const [hashtagInputValue, setHashtagInputValue] = createSignal(
    confessionPageMetadata.hashtag
  );
  const [replyHashtagInputValue, setReplyHashtagInputValue] = createSignal(
    confessionPageMetadata.replyHashtag
  );
  const [
    lastestConfessionNumberInputValue,
    setLastestConfessionNumberInputValue,
  ] = createSignal<undefined | number>();

  createEffect(() => {
    batch(() => {
      setHashtagInputValue(confessionPageMetadata.hashtag);
      setReplyHashtagInputValue(confessionPageMetadata.replyHashtag);
      setLastestConfessionNumberInputValue(
        confessionPageMetadata.lastestConfessionNumber
      );
    });
  });

  const handleChangeHashtagSubmit = async () => {
    setSubmitting(true);
    const hashtagValue = hashtagInputValue();
    const replyHashtagValue = replyHashtagInputValue();

    try {
      const metadataPayload: Parameters<
        typeof updateSpreadsheetMetadata
      >[number] = [];
      if (hashtagValue.length)
        metadataPayload.push({
          key: CONFESSION_PAGE_HASHTAG_METADATA_KEY,
          value: hashtagValue,
        });

      if (replyHashtagValue.length)
        metadataPayload.push({
          key: CONFESSION_PAGE_REPLY_HASHTAG_METADATA_KEY,
          value: replyHashtagValue,
        });

      await updateSpreadsheetMetadata(metadataPayload);
    } catch (err) {
      alert("Đã có lỗi xảy ra");
      console.error(err);
    }
    setSubmitting(false);
  };

  const handleSubmitLastestNumber = async () => {
    setLastestNumberSubmitting(true);
    const value = lastestConfessionNumberInputValue();
    if (typeof value === "number") {
      try {
        await updateSpreadsheetMetadata([
          {
            key: CONFESSION_LASTEST_HASHTAG_NUMBER_METADATA_KEY,
            value: value + "",
          },
        ]);
      } catch (err) {
        alert("Đã có lỗi xảy ra");
        console.error(err);
      }
    }
    setLastestNumberSubmitting(false);
  };

  return (
    <>
      <div class={settingContainerClass}>
        <div class="flex flex-col space-y-4">
          <div class="flex items-center space-x-8">
            <div class={doubleTitleContainerClass}>
              <img
                src={HASHTAG_LOGO_URL}
                alt="Hashtag"
                class={titleIconClass}
              />
              <p class="whitespace-nowrap">Confession hashtag</p>
            </div>
            <div class="relative">
              <p class="absolute inset-y-0 flex items-center pl-3">#</p>
              <input
                value={hashtagInputValue()}
                onInput={(e) => setHashtagInputValue(e.currentTarget.value)}
                type="text"
                placeholder="cfs"
                class="block max-w-[200px] py-4 px-6 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={() => {
                  setHashtagInputValue(confessionPageMetadata.hashtag);
                }}
                class="absolute inset-y-0 flex items-center right-0 px-2 hover:bg-gray-200 rounded z-0"
              >
                <img src={RELOAD_ICON_URL} alt="Hủy" class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="flex items-center space-x-8">
            <div class={doubleTitleContainerClass}>
              <img
                src={HASHTAG_LOGO_URL}
                alt="Hashtag"
                class={titleIconClass}
              />
              <p class="whitespace-nowrap w-[138px]">Hashtag trả lời</p>
            </div>
            <div class="relative">
              <p class="absolute inset-y-0 flex items-center pl-3">#</p>
              <input
                onInput={(e) =>
                  setReplyHashtagInputValue(e.currentTarget.value)
                }
                type="text"
                placeholder="replycfs"
                class="block max-w-[200px] py-4 px-6 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500"
                value={replyHashtagInputValue()}
              />
              <button
                onClick={() => {
                  setReplyHashtagInputValue(
                    confessionPageMetadata.replyHashtag
                  );
                }}
                class="absolute inset-y-0 flex items-center right-0 px-2 hover:bg-gray-200 rounded z-0"
              >
                <img src={RELOAD_ICON_URL} alt="Hủy" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <Button
          disabled={
            isSubmitting() ||
            (hashtagInputValue() === confessionPageMetadata.hashtag &&
              replyHashtagInputValue() ===
                confessionPageMetadata.replyHashtag) ||
            (!hashtagInputValue().length && !replyHashtagInputValue().length)
          }
          class="whitespace-nowrap flex items-center space-x-2"
          onClick={handleChangeHashtagSubmit}
        >
          <p>Thay đổi</p>
          <Show when={isSubmitting()}>
            <LoadingCircle />
          </Show>
        </Button>
      </div>
      <hr />
      <div class={settingContainerClass}>
        <div class={doubleTitleContainerClass}>
          <img
            src={NUMBER_LIST_ICON_URL}
            alt="Hashtag"
            class={titleIconClass}
          />
          <p class="whitespace-nowrap">Số hashtag gần nhất</p>
        </div>
        <div class="relative">
          <p class="absolute inset-y-0 flex items-center pl-3">#</p>
          <input
            type="number"
            placeholder="1000"
            class="block p-4 pl-6 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500"
            value={lastestConfessionNumberInputValue()}
            onInput={(e) =>
              setLastestConfessionNumberInputValue(+e.currentTarget.value)
            }
          />
        </div>
      </div>
      <div class="flex space-x-4 justify-center">
        <Button
          class="whitespace-nowrap bg-slate-500 hover:bg-slate-600"
          disabled={
            isLastestNumberSubmitting() ||
            lastestConfessionNumberInputValue() ===
              confessionPageMetadata.lastestConfessionNumber
          }
          onClick={() =>
            setLastestConfessionNumberInputValue(
              confessionPageMetadata.lastestConfessionNumber
            )
          }
        >
          Hủy
        </Button>
        <Button
          class="whitespace-nowrap"
          disabled={!currentConfessionPage() || isLastestNumberSubmitting()}
        >
          Đồng bộ từ Trang
        </Button>
        <Button
          class="whitespace-nowrap"
          disabled={
            isLastestNumberSubmitting() ||
            lastestConfessionNumberInputValue() ===
              confessionPageMetadata.lastestConfessionNumber
          }
          onClick={handleSubmitLastestNumber}
        >
          Xác nhận
        </Button>
      </div>
    </>
  );
};

export default PageMetadataSetting;
