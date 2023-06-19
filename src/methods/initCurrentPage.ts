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
      const page = accessibleFacebookPages.find(
        (page) => page.id === metadata.metadataValue
      );
      if (!page) {
        alert(
          "Tài khoản hiện tại của bạn không phải là quản trị viên của trang Facebook đăng tải những Confession thuộc bảng tính này. Bạn có thể đăng nhập tài khoản tương ứng, chọn bảng tính khác, hoặc chọn trang Facebook khác trong cài đặt."
        );
      }
      return setCurrentConfessionPage(page || null);
    }
  }
  if (currentConfessionPage() === undefined) setCurrentConfessionPage(null);
}
