import { Component } from "solid-js";
import MainTitle from "ui-components/MainTitle";
import ConfessionSpreadsheetSetting from "./ConfessionSpreadsheetSetting";
import FacebookAccountSetting from "./FacebookAccountSetting";
import PageMetadataSetting from "./PageMetadataSetting";

export const settingContainerClass = "flex justify-between items-center";
export const doubleTitleContainerClass = "flex items-center space-x-4";
export const titleIconClass = "w-8 h-8";
export const middleTitleClass =
  "overflow-hidden whitespace-nowrap text-ellipsis max-w-[40%] text-blue-500";

const Settings: Component = () => {
  return (
    <div class="flex justify-center w-full">
      <div class="flex flex-col space-y-6 h-full w-full max-w-7xl bg-white mt-2 drop-shadow-md rounded-lg pb-8">
        <MainTitle>Cài đặt</MainTitle>
        <div class="flex space-x-6 h-full px-8 w-full max-w-7xl rounded-lg">
          <div class="flex flex-col space-y-6 h-full px-8 w-full max-w-[50%] mt-2">
            <FacebookAccountSetting />
            <hr />
            <PageMetadataSetting />
          </div>
          <div class="flex flex-col space-y-6 h-full px-8 w-full max-w-[50%] bg-white mt-2">
            <ConfessionSpreadsheetSetting />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
