import { BASE_POST_SETTING_TEMPLATE_OBJ_KEYS } from "app-constants";
import {
  confessionMetadata,
  confessionSpreadsheet,
  postSettingTemplates,
} from "store/index";
import { PostTemplateSettings } from "types";

export default async function initPostTemplates(sheetName?: string) {
  if (!sheetName)
    sheetName = confessionMetadata.postSettingTemplatesSheet?.properties?.title;
  if (!sheetName) return;

  const templates = (
    await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: confessionSpreadsheet.spreadsheetId!,
      range: sheetName!,
    })
  ).result.values!;
  console.log(templates);
  postSettingTemplates.length = 0;
  if (!templates) return;
  for (let i = 0; i < templates.length; ++i) {
    const cells = templates[i];
    if (!cells[0]) continue;
    const template: PostTemplateSettings = {};
    BASE_POST_SETTING_TEMPLATE_OBJ_KEYS.forEach((key, index) => {
      template[key] = cells[index];
    });
    template["_row"] = i + 1;
    postSettingTemplates.push(template);
  }
}
