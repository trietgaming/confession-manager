export default class Confession {
  public row: number;
  public raw: string[];
  public ref?: HTMLLIElement;
  public in: gapi.client.sheets.Sheet;

  constructor(raw: string[], row: number, sheet: gapi.client.sheets.Sheet) {
    this.row = row;
    this.raw = raw;
    this.in = sheet;
  }
  public getData = () => this.raw[1];
  public getTimestamp = () => this.raw[0];
}
