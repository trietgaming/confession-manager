import { CURRENT_CONFESSION_PAGE_ID_METADATA_KEY } from "app-constants";
import fetchAndInitSpreadsheet from "methods/fetchAndInitSpreadsheet";
import refreshSpreadsheet from "methods/refreshSpreadsheet";
import updateSpreadsheetMetadata from "methods/updateSpreadsheetMetadata";
import { Component, For, JSX, createMemo, createSignal } from "solid-js";
import {
  accessibleFacebookPages,
  confessionSpreadsheet,
  currentConfessionPage,
  setCurrentConfessionPage,
} from "store/index";

const FacebookPageSelector: Component = () => {
  const [isLoading, setLoading] = createSignal(false);
  const defaultSelectedIndex = createMemo(() =>
    accessibleFacebookPages.indexOf(currentConfessionPage()!)
  );
  const handleSelect: JSX.EventHandlerUnion<
    HTMLSelectElement,
    InputEvent
  > = async (e) => {
    const page = accessibleFacebookPages[+e.currentTarget.value];
    setLoading(true);
    try {
      await updateSpreadsheetMetadata([
        {
          key: CURRENT_CONFESSION_PAGE_ID_METADATA_KEY,
          value: page.id,
        },
      ]);
      setCurrentConfessionPage(page);
    } catch (err) {
      alert("Đã có lỗi xảy ra");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <select
      value={defaultSelectedIndex()}
      disabled={isLoading() || currentConfessionPage() === undefined}
      onInput={handleSelect}
      class="bg-gray-50 border border-gray-500 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 max-w-md text-ellipsis block p-2.5"
    >
      <option hidden>Chọn trang Facebook của bạn</option>;
      <For each={accessibleFacebookPages}>
        {(page, index) => {
          return <option value={index()}>{page.name}</option>;
        }}
      </For>
    </select>
  );
};

export default FacebookPageSelector;
