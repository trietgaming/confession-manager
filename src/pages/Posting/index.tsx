import Confession from "classes/Confesison";
import PreviewPostConfession from "components/PreviewPostConfession";
import View from "pages/_ConfessionView";
import { Component, For, batch, createSignal } from "solid-js";
import { createMutable } from "solid-js/store";
import { pendingPost } from "store/index";
import { HandleAction } from "types";
import Button from "ui-components/Button";
import MainTitle from "ui-components/MainTitle";
import PostSetting from "./PostSetting";

// add options: post date?, form link?, images?, reply?, copy or post directly?, caption?, P/S?, template?...

const Posting: Component = () => {
  const [isMobile, setMobile] = createSignal(false);
  let postContainer: HTMLDivElement | undefined;

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

  return (
    <div class="flex justify-between mt-4 mx-2 relative">
      <div class="bg-white max-w-[25%] rounded-lg py-2 overflow-auto max-h-[90vh] px-6 translate-x-[64px] shadow-md">
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
      <div class="relative flex flex-col items-center space-y-4 mb-4 max-h-[90vh] overflow-auto w-full">
        <MainTitle class="my-2">Bài đăng</MainTitle>
        {/* desktop padding x 16, mobile padding x 10 - margin y 8 */}
        <div class="flex rounded-md bg-white divide-x border">
          <button
            class={`p-2 hover:bg-gray-200 ${
              isMobile() ? "" : "bg-sky-200 hover:bg-sky-200"
            }`}
            onClick={() => setMobile(false)}
          >
            Máy tính
          </button>
          <button
            class={`p-2 hover:bg-gray-200 ${
              isMobile() ? "bg-sky-200 hover:bg-sky-200" : ""
            }`}
            onClick={() => setMobile(true)}
          >
            Điện thoại
          </button>
        </div>
        <div
          ref={postContainer}
          style={{
            width: isMobile() ? "320px" : "500px",
            padding: isMobile() ? "10px" : "16px",
          }}
          class={`bg-white rounded-lg shadow-md`}
        >
          <For each={pendingPost}>
            {(confession, index) => {
              return (
                <>
                  <PreviewPostConfession
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
                  <br />
                </>
              );
            }}
          </For>
        </div>
        <div class="flex space-x-2">
          <Button class="bg-gray-500 hover:bg-gray-300" onClick={handleCancel}>
            Hủy
          </Button>
          <Button
            class="bg-sky-500 hover:bg-sky-400"
            onClick={() => {
              alert("Copy thành công!");
              navigator.clipboard.writeText(postContainer!.innerText);
            }}
          >
            Copy
          </Button>
          <Button>Đăng lên Trang</Button>
        </div>
      </div>
      <div class="flex bg-white px-8 mr-2 rounded-lg shadow-md min-w-[20%] max-h-[90vh]">
        <PostSetting />
      </div>
    </div>
  );
};

export default Posting;
