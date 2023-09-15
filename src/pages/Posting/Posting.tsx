import { A } from "@solidjs/router";
import {
  CONFESSION_LASTEST_HASHTAG_NUMBER_METADATA_KEY,
  DEFAULT_AVATAR_URL,
  DEFAULT_DIVIDER,
  PENDING_CHANGES_CONFESSION_ARRAY_KEYS,
} from "app-constants";
import PreviewPostConfession from "components/PreviewPostConfession";
import savePendingChanges from "methods/savePendingChanges";
import updateSpreadsheetMetadata from "methods/updateSpreadsheetMetadata";
import View from "pages/_ConfessionView";
import { Component, For, Show, batch, createSignal } from "solid-js";
import {
  confesisonForm,
  confessionPageMetadata,
  currentConfessionPage,
  isFacebookLoaded,
  pendingChanges,
  pendingPost,
  resetPendingChanges,
} from "store/index";
import { HandleAction, PendingChanges } from "types";
import Button from "ui-components/Button";
import LoadingCircle from "ui-components/LoadingCircle";
import MainTitle from "ui-components/MainTitle";
import { usePostingContext } from "./Context";
import PostSetting from "./PostSetting";
import PostedDialog from "./PostedDialog";
// add options: post date?, form link?, images?, reply?, copy or post directly?, caption?, P/S?, template?...

const GLOBE_ICON = () => (
  <svg fill="currentColor" viewBox="0 0 16 16" width="1em" height="1em">
    <g fill-rule="evenodd" transform="translate(-448 -544)">
      <g>
        <path
          d="M109.5 408.5c0 3.23-2.04 5.983-4.903 7.036l.07-.036c1.167-1 1.814-2.967 2-3.834.214-1 .303-1.3-.5-1.96-.31-.253-.677-.196-1.04-.476-.246-.19-.356-.59-.606-.73-.594-.337-1.107.11-1.954.223a2.666 2.666 0 0 1-1.15-.123c-.007 0-.007 0-.013-.004l-.083-.03c-.164-.082-.077-.206.006-.36h-.006c.086-.17.086-.376-.05-.529-.19-.214-.54-.214-.804-.224-.106-.003-.21 0-.313.004l-.003-.004c-.04 0-.084.004-.124.004h-.037c-.323.007-.666-.034-.893-.314-.263-.353-.29-.733.097-1.09.28-.26.863-.8 1.807-.22.603.37 1.166.667 1.666.5.33-.11.48-.303.094-.87a1.128 1.128 0 0 1-.214-.73c.067-.776.687-.84 1.164-1.2.466-.356.68-.943.546-1.457-.106-.413-.51-.873-1.28-1.01a7.49 7.49 0 0 1 6.524 7.434"
          transform="translate(354 143.5)"
        ></path>
        <path
          d="M104.107 415.696A7.498 7.498 0 0 1 94.5 408.5a7.48 7.48 0 0 1 3.407-6.283 5.474 5.474 0 0 0-1.653 2.334c-.753 2.217-.217 4.075 2.29 4.075.833 0 1.4.561 1.333 2.375-.013.403.52 1.78 2.45 1.89.7.04 1.184 1.053 1.33 1.74.06.29.127.65.257.97a.174.174 0 0 0 .193.096"
          transform="translate(354 143.5)"
        ></path>
        <path
          fill-rule="nonzero"
          d="M110 408.5a8 8 0 1 1-16 0 8 8 0 0 1 16 0zm-1 0a7 7 0 1 0-14 0 7 7 0 0 0 14 0z"
          transform="translate(354 143.5)"
        ></path>
      </g>
    </g>
  </svg>
);

const Posting: Component = () => {
  let postContainer: HTMLDivElement | undefined;
  const [isMobileView, setMobileView] = createSignal(false);
  const { postTemplateSettings, postingData, setPostingData } =
    usePostingContext()!;

  const handleCancel = () => {
    batch(() => {
      for (const confession of pendingPost) {
        confession.setHidden(false);
      }
      pendingPost.length = 0;
    });
  };

  const handleChange: HandleAction = (_, confession) => {
    // console.log(confession);
    confession.setHidden(true);
    pendingPost.push(confession);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(postContainer!.innerText);
    alert("Copy thành công!");
  };

  const handlePost = () => {
    setPostingData("isPosting", true);

    FB.api(
      `/${currentConfessionPage()?.id}/feed?access_token=${
        currentConfessionPage()?.access_token
      }`,
      "post",
      {
        message: postContainer!.innerText,
        link:
          postTemplateSettings.embed === confesisonForm.responderUri
            ? `${postTemplateSettings.embed}?post_by=confession-manager`
            : postTemplateSettings.embed,
      },
      async (response: { error?: string; id?: string }) => {
        if (response?.error) {
          alert("Đã có lỗi xảy ra");
          console.error(response.error);
        } else {
          await updateSpreadsheetMetadata([
            {
              key: CONFESSION_LASTEST_HASHTAG_NUMBER_METADATA_KEY,
              value: `${
                (confessionPageMetadata.lastestConfessionNumber || 0) +
                pendingPost.length
              }`,
            },
          ]);

          await batch(async () => {
            const oldPendingChanges: PendingChanges = {
              ...pendingChanges,
            };
            resetPendingChanges();
            pendingChanges.posts = pendingPost;
            await savePendingChanges();
            for (const key of PENDING_CHANGES_CONFESSION_ARRAY_KEYS) {
              pendingChanges[key] = oldPendingChanges[key];
            }
          });

          const postId = response.id as string;
          const postUrl = "https://www.facebook.com/" + postId;
          setPostingData("newPostLink", postUrl);
        }
        console.log(response);
        setPostingData("isPosting", false);
      }
    );
  };

  return (
    <>
      <PostedDialog />
      <div class="flex justify-between mt-4 mx-2 relative">
        <div class="z-1 bg-white min-w-[18%] max-w-[25%] rounded-lg py-2 overflow-auto max-h-[90vh] px-6 translate-x-[64px] shadow-md">
          <View
            key="accepted"
            postPage
            ascending
            metadata={{
              accepted: {
                title: "Confession đã duyệt",
                actions: {
                  primary: {
                    key: "post",
                    title: "Đăng",
                  },
                },
              },
            }}
            handleChange={handleChange}
          />
        </div>
        <div class="relative flex flex-col items-center space-y-4 mb-4 max-h-[90vh] overflow-auto z-0 px-16">
          <MainTitle class="my-2">Bài đăng</MainTitle>
          <p>
            Xem các{" "}
            <A href="/posted" class="text-blue-500">
              Confession đã đăng
            </A>
          </p>
          <p class="text-sm text-gray-600">
            Cài đặt Trang, #hashtag, số thứ tự của confession tại{" "}
            <A href="/settings" class="text-blue-500">
              Cài đặt
            </A>
          </p>
          {/* desktop padding x 16, mobile padding x 10 - margin y 8 */}
          <div class="flex rounded-md bg-white divide-x border">
            <button
              class={`p-2 hover:bg-gray-200 ${
                isMobileView() ? "" : "bg-sky-200 hover:bg-sky-200"
              }`}
              onClick={() => setMobileView(false)}
            >
              Máy tính
            </button>
            <button
              class={`p-2 hover:bg-gray-200 ${
                isMobileView() ? "bg-sky-200 hover:bg-sky-200" : ""
              }`}
              onClick={() => setMobileView(true)}
            >
              Điện thoại
            </button>
          </div>
          <div
            style={{
              width: isMobileView() ? "320px" : "590px",
              padding: isMobileView() ? "10px" : "16px",
            }}
            class={`bg-white rounded-lg shadow-md break-words whitespace-break-spaces`}
          >
            <div class="flex space-x-2 items-center mb-3">
              <img
                src={currentConfessionPage()?.pictureUrl || DEFAULT_AVATAR_URL}
                alt="Avatar"
                class="w-10 h-10 rounded-full"
              />
              <div class="flex flex-col justify-between">
                <div class="font-bold text-md">
                  {currentConfessionPage()?.name || "Trang của bạn"}
                </div>
                <div class="text-sm text-gray-600 flex space-x-1 items-center">
                  <div>Vừa xong</div>
                  <div>•</div>
                  <GLOBE_ICON />
                </div>
              </div>
            </div>
            <div ref={postContainer}>
              <div hidden={!postTemplateSettings.header?.length}>
                {postTemplateSettings.header}
                {postTemplateSettings.header?.length &&
                  (postTemplateSettings.dividerEnabled ? (
                    <div>{postTemplateSettings.divider || DEFAULT_DIVIDER}</div>
                  ) : (
                    <br />
                  ))}
                {!postTemplateSettings.dividerEnabled && "\u200B"}
              </div>
              <For each={pendingPost}>
                {(confession, index) => {
                  return (
                    <div>
                      <PreviewPostConfession
                        showDate={postTemplateSettings.showDate}
                        showTime={postTemplateSettings.showTime}
                        confession={confession}
                        index={index()}
                        handleMoveUp={() => {
                          const next = index() - 1;
                          if (next >= 0) {
                            [pendingPost[index()], pendingPost[next]] = [
                              pendingPost[next],
                              pendingPost[index()],
                            ];
                          }
                        }}
                        handleMoveDown={() => {
                          const next = index() + 1;
                          if (next < pendingPost.length) {
                            [pendingPost[index()], pendingPost[next]] = [
                              pendingPost[next],
                              pendingPost[index()],
                            ];
                          }
                        }}
                        handleRemove={() => {
                          batch(() => {
                            pendingPost.splice(index(), 1);
                            confession.setHidden(false);
                          });
                        }}
                      />
                      {index() !== pendingPost.length - 1 && <br />}
                      {"\u200B"}
                    </div>
                  );
                }}
              </For>
              <div>
                {(postTemplateSettings.footer?.length ||
                  (postTemplateSettings.formLinkEnabled &&
                    !postTemplateSettings.formLinkAtFooterDisabled)) &&
                  (postTemplateSettings.dividerEnabled ? (
                    <div>{postTemplateSettings.divider || DEFAULT_DIVIDER}</div>
                  ) : (
                    <br />
                  ))}
                {postTemplateSettings.footer}
              </div>
              <Show
                when={
                  postTemplateSettings.formLinkEnabled &&
                  !postTemplateSettings.formLinkAtFooterDisabled
                }
              >
                <span>
                  {postTemplateSettings.formLinkTitle}{" "}
                  <a href={confesisonForm.responderUri} class="text-blue-500">
                    {confesisonForm.responderUri}
                  </a>
                </span>
              </Show>
            </div>
          </div>
          <div class="flex space-x-2">
            <Button
              class="bg-gray-500 hover:bg-gray-300"
              onClick={handleCancel}
            >
              Hủy
            </Button>
            <Button class="bg-sky-500 hover:bg-sky-400" onClick={handleCopy}>
              Copy
            </Button>
            <Button
              class="flex items-center space-x-2"
              onClick={handlePost}
              disabled={
                postingData.isPosting ||
                !isFacebookLoaded() ||
                !currentConfessionPage() ||
                !pendingPost.length
              }
            >
              <p>Đăng lên Trang</p>
              <Show when={postingData.isPosting}>
                <LoadingCircle />
              </Show>
            </Button>
          </div>
        </div>
        <div class="flex flex-col bg-white px-8 mr-2 rounded-lg shadow-md min-w-[20%] max-h-[90vh] space-y-3 pb-4 overflow-auto">
          <PostSetting />
        </div>
      </div>
    </>
  );
};

export default Posting;
