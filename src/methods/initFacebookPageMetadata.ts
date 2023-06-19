import {
  CONFESSION_LASTEST_HASHTAG_NUMBER_METADATA_KEY,
  CONFESSION_PAGE_HASHTAG_METADATA_KEY,
  CONFESSION_PAGE_REPLY_HASHTAG_METADATA_KEY,
  CURRENT_CONFESSION_PAGE_ID_METADATA_KEY,
} from "app-constants";
import {
  confessionSpreadsheet,
  setConfessionPageMetadata,
  setCurrentConfessionPage,
} from "store/index";

export default function initFacebookPageMetadata() {
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
