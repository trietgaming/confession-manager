import { Component } from "solid-js";
import MainTitle from "ui-components/MainTitle";

const Ticket: Component = () => {
  return (
    <div class="flex justify-center max-w-2xl mx-auto mt-2">
      <div class="flex flex-col items-center space-y-4 bg-white rounded-md p-4 shadow-lg w-full ">
        <MainTitle class="my-4">Gửi yêu cầu</MainTitle>
      </div>
    </div>
  );
};

export default Ticket;
