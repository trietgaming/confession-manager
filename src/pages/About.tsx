import { Component } from "solid-js";
import MainTitle from "ui-components/MainTitle";

const About: Component = () => {
  return (
    <div class="flex flex-col items-center text-2xl space-y-6">
      <MainTitle class="my-4">Về chúng tôi</MainTitle>
      <div>
        Confession Manager là ứng dụng quản lí confession miễn phí, mã nguồn mở
        được phát triển bởi Trương Minh Triết (trietgaming).
      </div>
      <h1 class="font-bold text-3xl">Thông tin về chúng tôi</h1>
      <ul class="space-y-4">
        <li>Họ và tên: Trương Minh Triết</li>
        <li>
          Email:{" "}
          <a
            href="mailto:triet123vn@gmail.com"
            class="text-blue-500"
            target="_blank"
          >
            triet123vn@gmail.com
          </a>
        </li>
        <li>
          Github:{" "}
          <a
            class="text-blue-500"
            href="https://github.com/trietgaming"
            target="_blank"
          >
            https://github.com/trietgaming
          </a>
        </li>
        <li>
          Facebook:{" "}
          <a
            href="https://www.facebook.com/trietgameme/"
            class="text-blue-500"
            target="_blank"
          >
            https://www.facebook.com/trietgameme/
          </a>
        </li>
      </ul>
      <div>Cảm ơn bạn đã sử dụng ứng dụng!</div>
    </div>
  );
};

export default About;
