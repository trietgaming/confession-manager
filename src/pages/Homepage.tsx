import { Component } from "solid-js";
import AppLogo from "ui-components/AppLogo";
import handleLogin from "methods/handleLogin";
import { A } from "@solidjs/router";

const Homepage: Component = () => {
  return (
    <div class="h-full flex flex-col">
      <div class="flex p-4 justify-between bg-white h-[8vh]">
        <div class="flex items-center space-x-4 font-semibold text-lg">
          <AppLogo class="w-10 h-10" />
          <div>Confession Manager</div>
        </div>
        <div class="flex space-x-6 my-auto">
          <A href="/about" class="text-blue-500">
            Về chúng tôi
          </A>
          <a
            target="_blank"
            href="https://github.com/trietgaming/confession-manager"
            class="text-blue-500"
          >
            Github
          </a>
        </div>
        <button
          onClick={handleLogin}
          class="flex items-center space-x-4 shadow-md p-2 rounded-md bg-gray-100 hover:bg-gray-300 hover:cursor-pointer"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            alt="Đăng nhập với Google"
            class="w-7 h-7"
          />
          <div class="pr-2 font-semibold">Đăng nhập</div>
        </button>
      </div>
      <div class="text-3xl">
        <div
          class="flex h-[92vh] items-center px-[18%] justify-between"
          style={{ "background-image": 'url("/homepage-background.png")' }}
        >
          <div class="flex flex-col items-center space-y-12">
            <AppLogo class="w-64 h-64" />
            <p class="font-bold text-4xl whitespace-nowrap">
              Confession Manager
            </p>
          </div>
          <div class="flex flex-col items-center space-y-4 font-semibold">
            <div>Quản lí Confession ngay trên trình duyệt</div>
            <div class="text-lg text-gray-600">
              Tự động hóa những công việc thủ công lằn nhằn
            </div>
          </div>
        </div>
      </div>
      <footer class="flex py-6 px-[15%] items-center justify-between">
        <div class="flex flex-col items-center">
          <div class="flex items-center space-x-4">
            <AppLogo />
            <div>Confession Manager</div>
          </div>
          <div class="text-sm text-gray-500">trietgaming • 2023</div>
        </div>
        <div class="flex flex-col text-center">
          <div>Pháp lý</div>
          <ul class="text-blue-500">
            <li>
              <a href="/privacy-policy" target="_blank">
                Chính sách quyền riêng tư
              </a>
            </li>
            <li>
              <a href="/terms-of-service" target="_blank">
                Điều khoản và điều kiện
              </a>
            </li>
          </ul>
        </div>
        <div class="flex flex-col text-center">
          <div>Xã hội</div>
          <ul class="text-blue-500">
            <li>
              <a
                href="https://github.com/trietgaming/confession-manager"
                target="_blank"
              >
                Github
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/confessionmanager"
                target="_blank"
              >
                Facebook
              </a>
            </li>
          </ul>
        </div>
        <div class="flex flex-col text-center">
          <div>Liên hệ</div>
          <a
            class="text-blue-500"
            href="mailto:triet123vn@gmail.com"
            target="_blank"
          >
            triet123vn@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
