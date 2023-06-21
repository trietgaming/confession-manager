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

  const [isSyncing, setSyncing] = createSignal(false);

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

  const handleSync = async () => {
    setSyncing(true);

    FB.api(
      `/${currentConfessionPage()?.id}/feed?access_token=${
        currentConfessionPage()?.access_token
      }`,
      "get",
      { fields: ["message"] },
      async (response: { error?: any; data: { message: string }[] }) => {
        console.log(response);
        if (!response?.error) {
          let foundAny = false;
          for (const messageData of response.data) {
            const found = messageData.message.match(
              new RegExp(`#${confessionPageMetadata.hashtag}([0-9])\\w+`, "g")
            );
            if (found) {
              const num = +found[found.length - 1].match(/\d+$/)![0];
              if (!num) continue;
              foundAny = true;
              setLastestConfessionNumberInputValue(num);
              await handleSubmitLastestNumber(null, num);
              break;
            }
          }
          if (!foundAny)
            alert(
              "Không tìm thấy Confession mới nhất nào có chứa hashtag #" +
                confessionPageMetadata.hashtag
            );
        }
        setSyncing(false);
      }
    );
  };

  const handleSubmitLastestNumber = async (e?: any, num?: number) => {
    setLastestNumberSubmitting(true);
    const value = num ?? lastestConfessionNumberInputValue();
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
          <img src={NUMBER_LIST_ICON_URL} alt="number" class={titleIconClass} />
          <p class="whitespace-nowrap">Số hashtag gần nhất</p>
        </div>
        <div class="relative">
          <input
            type="number"
            placeholder="1000"
            class="block p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:border-blue-500"
            value={lastestConfessionNumberInputValue()}
            onInput={(e) =>
              setLastestConfessionNumberInputValue(+e.currentTarget.value)
            }
          />
        </div>
      </div>
      <div class={settingContainerClass}>
        <span class="text-sm">
          Đồng bộ từ Trang: Ứng dụng sẽ xem các bài viết của Trang và tìm bài
          viết mới nhất có chứa hashtag của confession và lấy số lớn nhất đứng
          sau hashtag.
        </span>
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
          class="whitespace-nowrap flex items-center space-x-2"
          disabled={
            !currentConfessionPage() ||
            isLastestNumberSubmitting() ||
            isSyncing()
          }
          onClick={handleSync}
        >
          <p>Đồng bộ từ Trang</p>
          <Show when={isSyncing()}>
            <LoadingCircle />
          </Show>
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
