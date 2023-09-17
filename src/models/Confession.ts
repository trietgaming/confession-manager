import { hiddenConfessionRows } from "./../store/index";

export default class Confession {
  public row: number;
  public raw: string[];
  public in: gapi.client.sheets.Sheet;

  public readonly hidden: () => boolean = () =>
    !!hiddenConfessionRows.hidden[this.row];
  public setHidden: (hidden: boolean) => void = (hidden) =>
    (hiddenConfessionRows.hidden[this.row] = hidden);

  constructor(raw: string[], row: number, sheet: gapi.client.sheets.Sheet) {
    this.row = row;
    this.raw = raw;
    this.in = sheet;
  }
  public getData = () => this.raw[1];
  public getTimestamp = () => this.raw[0];
}
