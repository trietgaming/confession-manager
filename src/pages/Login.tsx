import { Component } from "solid-js";
import Button from "ui-components/Button";
import handleLogin from "methods/handleLogin";
import { A } from "@solidjs/router";
import AppLogo from "ui-components/AppLogo";

const Login: Component = () => {
  return (
    <div class="flex flex-col justify-between h-full">
      <div class="flex space-x-4 justify-center items-center text-center mt-10 text-4xl font-bold">
        <AppLogo class="w-16 h-16" />
        <h1>CONFESSION MANAGER</h1>
      </div>
      <div class="flex px-4 flex-col items-center justify-center">
        <h1 class="text-2xl">Đăng nhập tài khoản Google của bạn để sử dụng</h1>
        <p class="my-10">
          Vui lòng cung cấp đầy đủ quyền để các chức năng hoạt động bình thường
        </p>
        <Button
          onClick={handleLogin}
          class="text-xl text-white bg-[#4285F4] hover:bg-[#4285F4]/90 px-7 py-5 text-center inline-flex items-center"
        >
          <svg
            class="w-6 h-6 mr-4 -ml-1"
            aria-hidden="true"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
          Đăng nhập với Google
        </Button>
      </div>
      <div class="flex justify-evenly mb-10">
        <A href="/about" class="px-4 py-2 hover:text-blue-700 text-blue-600">
          Về chúng tôi
        </A>
      </div>
    </div>
  );
};

export default Login;
