import {
  BASE_POST_SETTING_TEMPLATE_OBJ_KEYS,
  DEFAULT_DIVIDER,
} from "app-constants";
import AppSpreadsheetManager from "controllers/AppSpreadsheetManager";
import initPostTemplates from "methods/initPostTemplates";
import { plusSvgPathDraw } from "pages/_Init/InitSheets/ConditionalFilteringModal/ConditionSelector";
import { Component, For, Show, batch, createSignal } from "solid-js";
import { reconcile } from "solid-js/store";
import {
  confesisonForm,
  confessionMetadata,
  confessionSpreadsheet,
  postSettingTemplates,
} from "store/index";
import { PostTemplateSettings } from "types";
import Button from "ui-components/Button";
import MainTitle from "ui-components/MainTitle";
import Modal from "ui-components/Modal";
import Toggle from "ui-components/Toggle";
import { usePostingContext } from "./Context";
import ConfessionsManager from "controllers/ConfessionsManager";

const inputClasss =
  "block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:outline-blue-500";

const PostSetting: Component = () => {
  const [isModalShow, setModalShow] = createSignal(false);
  const [isSaving, setSaving] = createSignal(false);
  const { postTemplateSettings, setPostTemplateSettings } =
    usePostingContext()!;

  const PostSettingToggle: Component<{
    key: keyof PostTemplateSettings;
    not?: boolean;
  }> = (props) => {
    return (
      <Toggle
        checked={
          (props.not
            ? !postTemplateSettings[props.key]
            : postTemplateSettings[props.key]) as boolean
        }
        handleToggle={() => setPostTemplateSettings(props.key, (prev) => !prev)}
      />
    );
  };

  const handleCreateTemplate = async () => {
    if (!postTemplateSettings._name || !postTemplateSettings._name.length)
      return;
    setSaving(true);
    const _store = { ...postTemplateSettings };
    await ConfessionsManager.createNewPostTemplate(_store);
    batch(() => {
      setPostTemplateSettings(
        postSettingTemplates.findLast(
          (template) => template._name === postTemplateSettings._name
        )!
      );
      setSaving(false);
      setModalShow(false);
    });
  };

  const handleSaveClick = async () => {
    if (postTemplateSettings._row !== undefined) {
      const value = { ...postTemplateSettings };
      setSaving(true);
      try {
        await gapi.client.sheets.spreadsheets.values.update(
          {
            spreadsheetId: confessionSpreadsheet.spreadsheetId!,
            includeValuesInResponse: true,
            valueInputOption: "USER_ENTERED",
            range: `${confessionMetadata.postSettingTemplatesSheet?.properties?.title}!${postTemplateSettings._row}:${postTemplateSettings._row}`,
          },
          {
            majorDimension: "ROWS",
            values: [
              BASE_POST_SETTING_TEMPLATE_OBJ_KEYS.map((key) => {
                return `${value[key] || ""}`;
              }),
            ],
            range: `${confessionMetadata.postSettingTemplatesSheet?.properties?.title}!${postTemplateSettings._row}:${postTemplateSettings._row}`,
          }
        );
        postSettingTemplates[value._row! - 1] = value;
      } catch (err) {
        alert("đã có lỗi xảy ra");
        console.error(err);
      }
      setSaving(false);
    } else {
      setModalShow(true);
    }
  };

  const handleDeleteTemplate = async () => {
    setSaving(true);

    try {
      const response = await gapi.client.sheets.spreadsheets.batchUpdate(
        {
          spreadsheetId: confessionSpreadsheet.spreadsheetId!,
        },
        {
          includeSpreadsheetInResponse: true,
          requests: [
            {
              deleteDimension: {
                range: {
                  dimension: "ROWS",
                  startIndex: postTemplateSettings._row! - 1,
                  endIndex: postTemplateSettings._row,
                  sheetId:
                    confessionMetadata.postSettingTemplatesSheet?.properties
                      ?.sheetId,
                },
              },
            },
          ],
        }
      );
      await AppSpreadsheetManager.refresh(response.result.updatedSpreadsheet);
      await initPostTemplates(
        confessionMetadata.postSettingTemplatesSheet?.properties?.title
      );
      setPostTemplateSettings(reconcile({}));
    } catch (err) {
      alert("đã có lỗi xảy ra");
      console.error(err);
    }

    setSaving(false);
  };

  return (
    <>
      <MainTitle class="my-4">Tùy chỉnh</MainTitle>
      <div class="flex rounded-md border w-max">
        <button
          class="p-1 hover:bg-gray-200"
          onclick={() => setPostTemplateSettings(reconcile({}))}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24px"
            height="24px"
          >
            <path d={plusSvgPathDraw} />
          </svg>
        </button>
        <For each={postSettingTemplates}>
          {(template) => {
            return (
              <>
                <button
                  class={`p-1 border-l hover:bg-gray-200 rounded-md min-w-[1.75em] ${
                    postTemplateSettings._row === template._row &&
                    "bg-blue-400 hover:bg-blue-400"
                  }`}
                  onClick={() => setPostTemplateSettings(template)}
                >
                  {template._name}
                </button>
              </>
            );
          }}
        </For>
      </div>
      <div class="flex justify-between items-center">
        <h3 class="text-md font-semibold">Hiện giờ, phút, giây?</h3>
        <PostSettingToggle key="showTime" />
      </div>
      <div class="flex justify-between items-center">
        <h3 class="text-md font-semibold max-w-[70%]">
          Hiện ngày, tháng, năm?
        </h3>
        <PostSettingToggle key="showDate" />
      </div>
      <div>
        <h3 class="text-lg font-semibold">Tiêu đề bài viết</h3>
        <textarea
          placeholder="Confession hôm nay..."
          class={inputClasss}
          value={postTemplateSettings.header || ""}
          onInput={(e) =>
            setPostTemplateSettings("header", e.currentTarget.value)
          }
        />
      </div>
      <div>
        <h3 class="text-lg font-semibold">Kết bài</h3>
        <textarea
          placeholder="Cảm ơn đã đọc, lưu ý: ..."
          class={inputClasss}
          value={postTemplateSettings.footer || ""}
          onInput={(e) =>
            setPostTemplateSettings("footer", e.currentTarget.value)
          }
        />
      </div>
      <div class="flex justify-between">
        <h3 class="text-md font-semibold">Phân chia các mục?</h3>
        <PostSettingToggle key="dividerEnabled" />
      </div>
      <Show when={postTemplateSettings.dividerEnabled}>
        <div>
          <h3 class="text-lg font-semibold">Đường chia</h3>
          <input
            value={postTemplateSettings.divider || ""}
            placeholder={`Mặc định: ${DEFAULT_DIVIDER}`}
            type="text"
            onInput={(e) =>
              setPostTemplateSettings("divider", e.currentTarget.value)
            }
            class={inputClasss}
          />
        </div>
      </Show>
      <div class="flex justify-between">
        <h3 class="text-md font-semibold">Chèn liên kết biểu mẫu?</h3>
        <Toggle
          checked={postTemplateSettings.formLinkEnabled}
          handleToggle={() => {
            setPostTemplateSettings("formLinkEnabled", (prev) => !prev);
            if (
              (!postTemplateSettings.embed ||
                postTemplateSettings.embed.length === 0) &&
              postTemplateSettings.formLinkEnabled
            ) {
              setPostTemplateSettings("embed", confesisonForm.responderUri);
            } else if (
              postTemplateSettings.embed === confesisonForm.responderUri &&
              !postTemplateSettings.formLinkEnabled
            )
              setPostTemplateSettings("embed", undefined);
          }}
        />
      </div>
      <Show when={postTemplateSettings.formLinkEnabled}>
        <Show when={!postTemplateSettings.formLinkAtFooterDisabled}>
          <div>
            <h3 class="text-lg font-semibold">Chú thích liên kết biểu mẫu</h3>
            <input
              placeholder="Gửi confession tại đây: "
              type="text"
              value={postTemplateSettings.formLinkTitle || ""}
              class={inputClasss}
              onInput={(e) =>
                setPostTemplateSettings("formLinkTitle", e.currentTarget.value)
              }
            />
          </div>
        </Show>
        <div class="flex justify-between">
          <h3 class="text-md font-semibold">Đặt biểu mẫu ở cuối bài?</h3>
          <PostSettingToggle key="formLinkAtFooterDisabled" not />
        </div>
      </Show>
      <div>
        <h3 class="text-lg font-semibold">Link đính kèm</h3>
        <input
          value={
            postTemplateSettings.embed !== undefined
              ? postTemplateSettings.embed
              : postTemplateSettings.formLinkEnabled
              ? confesisonForm.responderUri
              : ""
          }
          onInput={(e) =>
            setPostTemplateSettings("embed", e.currentTarget.value)
          }
          placeholder="Mặc định là liên kết biểu mẫu (nếu bật)"
          type="text"
          class={inputClasss}
        />
      </div>
      <div class="flex justify-center space-x-2">
        <Show when={postTemplateSettings._row !== undefined}>
          <Button
            class="bg-red-500 hover:bg-red-800"
            onClick={handleDeleteTemplate}
            disabled={isSaving()}
          >
            Xóa
          </Button>
        </Show>

        <Button onClick={handleSaveClick} disabled={isSaving()}>
          Lưu cài đặt cho lần sau
        </Button>
      </div>
      <Modal
        title="Lưu cài đặt"
        isShow={isModalShow()}
        handleClose={() => {
          setModalShow(false);
          if (!postTemplateSettings._row)
            setPostTemplateSettings("_name", undefined);
        }}
        handleSubmit={handleCreateTemplate}
        loading={isSaving()}
        submitDisabled={
          !postTemplateSettings._name || !postTemplateSettings._name.length
        }
      >
        <h3 class="text-lg font-semibold">Tên cài đặt</h3>
        <input
          onInput={(e) =>
            setPostTemplateSettings("_name", e.currentTarget.value)
          }
          placeholder="Cài đặt X"
          type="text"
          class={inputClasss}
          maxLength={20}
          value={postTemplateSettings._name || ""}
        />
      </Modal>
    </>
  );
};

export default PostSetting;
