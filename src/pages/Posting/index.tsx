import ConfessionComponent from "components/ConfessionComponent";
import View from "pages/_ConfessionView";
import { Component, For } from "solid-js";
import { confessions } from "store/index";
import MainTitle from "ui-components/MainTitle";

const Posting: Component = () => {
  return (
    <div class="flex justify-between mt-4 mx-2 translate-x-[64px]">
      <div class="bg-white w-[30%] rounded-lg p-2 overflow-auto max-h-[90vh]">
        <View
          key="accepted"
          postPage
          ascending
          metadata={{
            accepted: {
              title: "Confession đã duyệt",
              actions: {
                primary: {
                  key: "post",
                  title: "Đăng",
                },
              },
            },
          }}
        />
      </div>
      <div class="bg-white w-[60%] rounded-lg p-2">?</div>
    </div>
  );
};

export default Posting;
