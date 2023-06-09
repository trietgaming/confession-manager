import { IS_SHEETS_INITED_METADATA_KEY, SHEETS_INITED_TYPES } from "app-constants";
import { confessionMetadata, confessionSpreadsheet } from "store/index";

export const checkSheetInited = () => {
  if (!confessionSpreadsheet || !confessionSpreadsheet.developerMetadata)
    return false;
  const metadata = confessionSpreadsheet!.developerMetadata!.find(
    (metadata) => metadata.metadataKey === IS_SHEETS_INITED_METADATA_KEY
  );
  return (
    metadata &&
    ((metadata.metadataValue === SHEETS_INITED_TYPES.FRESH &&
      !!confessionMetadata.archivedSheet) ||
      metadata.metadataValue === SHEETS_INITED_TYPES.FILTERED)
  ) || false;
};