import { CONFESSION_LASTEST_HASHTAG_NUMBER_METADATA_KEY, CONFESSION_PAGE_HASHTAG_METADATA_KEY, CONFESSION_PAGE_REPLY_HASHTAG_METADATA_KEY, CURRENT_CONFESSION_PAGE_ID_METADATA_KEY } from "app-constants";
import {
  currentConfessionPage,
  confessionSpreadsheet,
  accessibleFacebookPages,
  setCurrentConfessionPage,
  setConfessionPageMetadata,
} from "store/index";

export default class FacebookPageManager {
  static initCurrentPage() {
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

  static initFacebookPageMetadata() {
    if (!confessionSpreadsheet || !confessionSpreadsheet.developerMetadata)
      return false;
    for (const metadata of confessionSpreadsheet.developerMetadata) {
      if (metadata.visibility === "PROJECT") {
        switch (metadata.metadataKey) {
          case CONFESSION_PAGE_HASHTAG_METADATA_KEY:
            setConfessionPageMetadata("hashtag", metadata.metadataValue || "");
            break;
          case CONFESSION_LASTEST_HASHTAG_NUMBER_METADATA_KEY:
            setConfessionPageMetadata(
              "lastestConfessionNumber",
              +metadata.metadataValue!
            );
            break;
          case CONFESSION_PAGE_REPLY_HASHTAG_METADATA_KEY:
            setConfessionPageMetadata(
              "replyHashtag",
              metadata.metadataValue || ""
            );
            break;
        }
      }
    }
  }
}
