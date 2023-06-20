import { CURRENT_CONFESSION_PAGE_ID_METADATA_KEY } from "app-constants";
import {
  accessibleFacebookPages,
  confessionSpreadsheet,
  currentConfessionPage,
  setCurrentConfessionPage,
} from "store/index";

export default function initCurrentPage() {
  if (
    currentConfessionPage() !== undefined ||
    !confessionSpreadsheet.spreadsheetId ||
    !confessionSpreadsheet.developerMetadata ||
    !accessibleFacebookPages.length
  )
    return;

  for (const metadata of confessionSpreadsheet.developerMetadata) {
    if (
      metadata.visibility === "PROJECT" &&
      metadata.metadataKey === CURRENT_CONFESSION_PAGE_ID_METADATA_KEY
    ) {
      const pageIndex = accessibleFacebookPages.findIndex(
        (page) => page.id === metadata.metadataValue
      );
      const page = accessibleFacebookPages[pageIndex];
      if (!page) {
        alert(
          "Tài khoản hiện tại của bạn không phải là quản trị viên của trang Facebook đăng tải những Confession thuộc bảng tính này. Bạn có thể đăng nhập tài khoản tương ứng, chọn bảng tính khác, hoặc chọn trang Facebook khác trong cài đặt."
        );
        return setCurrentConfessionPage(null);
      }
      if (page) {
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

            return setCurrentConfessionPage(_page);
          }
        );
      }
    }
  }
  if (currentConfessionPage() === undefined) setCurrentConfessionPage(null);
}
