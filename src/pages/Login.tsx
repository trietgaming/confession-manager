import { Component } from "solid-js";
import Button from "ui-components/Button";
import handleLogin from "methods/handleLogin";
import { A } from "@solidjs/router";
import AppLogo from "ui-components/AppLogo";
import GOOGLE_SIGN_IN_BUTTON_URL from "assets/images/google-sign-in-btn.png?url";

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
        <img
          src={GOOGLE_SIGN_IN_BUTTON_URL}
          alt="Đăng nhập với Google"
          onClick={handleLogin}
          class="hover:cursor-pointer px-7 py-5 text-center inline-flex items-center"
        ></img>
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
