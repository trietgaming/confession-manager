import {
  BASE_POST_SETTING_TEMPLATE_OBJ_KEYS,
  DEFAULT_DIVIDER,
} from "app-constants";
import createNewPostTemplate from "methods/createNewPostTemplate";
import initPostTemplates from "methods/initPostTemplates";
import refreshSpreadsheet from "methods/refreshSpreadsheet";
import { plusSvgPathDraw } from "pages/Dashboard/init/InitSheets/ConditionalFilteringModal/ConditionSelector";
import {
  Component,
  Context,
  For,
  Show,
  batch,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";
import { SetStoreFunction, reconcile } from "solid-js/store";
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

const inputClasss =
  "block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 sm:text-md focus:ring-blue-500 focus:outline-blue-500";

const PostSetting: Component<{
  context: Context<{
    storeSetter: SetStoreFunction<PostTemplateSettings>;
    store: PostTemplateSettings;
  }>;
}> = (props) => {
  const [isModalShow, setModalShow] = createSignal(false);
  const [isSaving, setSaving] = createSignal(false);
  const { store, storeSetter } = useContext(props.context);

  const PostSettingToggle: Component<{
    key: keyof PostTemplateSettings;
    not?: boolean;
  }> = (props) => {
    return (
      <Toggle
        checked={(props.not ? !store[props.key] : store[props.key]) as boolean}
        handleToggle={() => storeSetter(props.key, (prev) => !prev)}
      />
    );
  };

  const handleCreateTemplate = async () => {
    if (!store._name || !store._name.length) return;
    setSaving(true);
    const _store = { ...store };
    await createNewPostTemplate(_store);
    batch(() => {
      storeSetter(
        postSettingTemplates.findLast(
          (template) => template._name === store._name
        )!
      );
      setSaving(false);
      setModalShow(false);
    });
  };

  const handleSaveClick = async () => {
    if (store._row !== undefined) {
      const value = { ...store };
      setSaving(true);
      try {
        await gapi.client.sheets.spreadsheets.values.update(
          {
            spreadsheetId: confessionSpreadsheet.spreadsheetId!,
            includeValuesInResponse: true,
            valueInputOption: "USER_ENTERED",
            range: `${confessionMetadata.postSettingTemplatesSheet?.properties?.title}!${store._row}:${store._row}`,
          },
          {
            majorDimension: "ROWS",
            values: [
              BASE_POST_SETTING_TEMPLATE_OBJ_KEYS.map((key) => {
                return `${value[key] || ""}`;
              }),
            ],
            range: `${confessionMetadata.postSettingTemplatesSheet?.properties?.title}!${store._row}:${store._row}`,
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
                  startIndex: store._row! - 1,
                  endIndex: store._row,
                  sheetId:
                    confessionMetadata.postSettingTemplatesSheet?.properties
                      ?.sheetId,
                },
              },
            },
          ],
        }
      );
      await refreshSpreadsheet(response.result.updatedSpreadsheet);
      await initPostTemplates(
        confessionMetadata.postSettingTemplatesSheet?.properties?.title
      );
      storeSetter(reconcile({}));
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
          onclick={() => storeSetter(reconcile({}))}
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
                    store._row === template._row &&
                    "bg-blue-400 hover:bg-blue-400"
                  }`}
                  onClick={() => storeSetter(template)}
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
          value={store.header || ""}
          onInput={(e) => storeSetter("header", e.currentTarget.value)}
        />
      </div>
      <div>
        <h3 class="text-lg font-semibold">Kết bài</h3>
        <textarea
          placeholder="Cảm ơn đã đọc, lưu ý: ..."
          class={inputClasss}
          value={store.footer || ""}
          onInput={(e) => storeSetter("footer", e.currentTarget.value)}
        />
      </div>
      <div class="flex justify-between">
        <h3 class="text-md font-semibold">Phân chia các mục?</h3>
        <PostSettingToggle key="dividerEnabled" />
      </div>
      <Show when={store.dividerEnabled}>
        <div>
          <h3 class="text-lg font-semibold">Đường chia</h3>
          <input
            value={store.divider || ""}
            placeholder={`Mặc định: ${DEFAULT_DIVIDER}`}
            type="text"
            onInput={(e) => storeSetter("divider", e.currentTarget.value)}
            class={inputClasss}
          />
        </div>
      </Show>
      <div class="flex justify-between">
        <h3 class="text-md font-semibold">Chèn liên kết biểu mẫu?</h3>
        <Toggle
          checked={store.formLinkEnabled}
          handleToggle={() => {
            storeSetter("formLinkEnabled", (prev) => !prev);
            if (
              (!store.embed || store.embed.length === 0) &&
              store.formLinkEnabled
            ) {
              storeSetter("embed", confesisonForm.responderUri);
            } else if (
              store.embed === confesisonForm.responderUri &&
              !store.formLinkEnabled
            )
              storeSetter("embed", undefined);
          }}
        />
      </div>
      <Show when={store.formLinkEnabled}>
        <Show when={!store.formLinkAtFooterDisabled}>
          <div>
            <h3 class="text-lg font-semibold">Chú thích liên kết biểu mẫu</h3>
            <input
              placeholder="Gửi confession tại đây: "
              type="text"
              value={store.formLinkTitle || ""}
              class={inputClasss}
              onInput={(e) =>
                storeSetter("formLinkTitle", e.currentTarget.value)
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
            store.embed !== undefined
              ? store.embed
              : store.formLinkEnabled
              ? confesisonForm.responderUri
              : ""
          }
          onInput={(e) => storeSetter("embed", e.currentTarget.value)}
          placeholder="Mặc định là liên kết biểu mẫu (nếu bật)"
          type="text"
          class={inputClasss}
        />
      </div>
      <div class="flex justify-center space-x-2">
        <Show when={store._row !== undefined}>
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
          if (!store._row) storeSetter("_name", undefined);
        }}
        handleSubmit={handleCreateTemplate}
        loading={isSaving()}
        submitDisabled={!store._name || !store._name.length}
      >
        <h3 class="text-lg font-semibold">Tên cài đặt</h3>
        <input
          onInput={(e) => storeSetter("_name", e.currentTarget.value)}
          placeholder="Cài đặt X"
          type="text"
          class={inputClasss}
          maxLength={20}
          value={store._name || ""}
        />
      </Modal>
    </>
  );
};

export default PostSetting;
