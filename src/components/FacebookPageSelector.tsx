import { CURRENT_CONFESSION_PAGE_ID_METADATA_KEY } from "app-constants";
import AppSpreadsheetManager from "controllers/AppSpreadsheetManager";
import { Component, For, JSX, createMemo, createSignal } from "solid-js";
import {
  accessibleFacebookPages,
  currentConfessionPage,
  setCurrentConfessionPage,
} from "store/index";

const FacebookPageSelector: Component = () => {
  const [isLoading, setLoading] = createSignal(false);
  const defaultSelectedIndex = createMemo(() =>
    accessibleFacebookPages.findIndex(
      (page) => page.id === currentConfessionPage()?.id
    )
  );
  const handleSelect: JSX.EventHandlerUnion<
    HTMLSelectElement,
    InputEvent
  > = async (e) => {
    const page = accessibleFacebookPages[+e.currentTarget.value];
    setLoading(true);
    try {
      await AppSpreadsheetManager.updateMetadata([
        {
          key: CURRENT_CONFESSION_PAGE_ID_METADATA_KEY,
          value: page.id,
        },
      ]);
      if (!page.pictureUrl)
        FB.api(
          `/${page.id}/picture?access_token=${page.access_token}`,
          "get",
          { redirect: 0 },
          function (response: {
            data?: {
              height: number;
              is_silhouette: boolean;
              url: string;
              width: 50;
            };
            error?: any;
          }) {
            let _page = { ...page };
            console.log(response);
            if (!response.error) {
              _page.pictureUrl = response.data!.url;
            }

            setCurrentConfessionPage(_page);
          }
        );
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
