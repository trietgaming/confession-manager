export default class AppSpreadsheet implements gapi.client.sheets.Spreadsheet {
  dataSources?: gapi.client.sheets.DataSource[];
  dataSourceSchedules?: gapi.client.sheets.DataSourceRefreshSchedule[];
  developerMetadata?: gapi.client.sheets.DeveloperMetadata[];
  namedRanges?: gapi.client.sheets.NamedRange[];
  properties?: gapi.client.sheets.SpreadsheetProperties;
  sheets?: gapi.client.sheets.Sheet[];
  spreadsheetId?: string;
  spreadsheetUrl?: string;

  constructor(spreadsheet: gapi.client.sheets.Spreadsheet) {
    this.dataSources = spreadsheet.dataSources;
    this.dataSourceSchedules = spreadsheet.dataSourceSchedules;
    this.developerMetadata = spreadsheet.developerMetadata;
    this.namedRanges = spreadsheet.namedRanges;
    this.properties = spreadsheet.properties;
    this.sheets = spreadsheet.sheets;
    this.spreadsheetId = spreadsheet.spreadsheetId;
    this.spreadsheetUrl = spreadsheet.spreadsheetUrl;
  }

  public refresh() {
    
  }
}
