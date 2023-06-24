import { Component } from "solid-js";
import AppLogo from "ui-components/AppLogo";
import handleLogin from "methods/handleLogin";
import { A } from "@solidjs/router";
import { BELL_ICON_URL, GOOGLE_SHEET_FAVICON_URL } from "app-constants";

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
          <A href="/donation" class="text-blue-500">
            Ủng hộ chúng tôi
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
            <button
              onClick={handleLogin}
              class="flex items-center space-x-4 shadow-md p-6 rounded-md bg-gray-200 hover:bg-gray-300 hover:cursor-pointer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                alt="Đăng nhập với Google"
                class="w-7 h-7"
              />
              <div class="pr-2 font-semibold">Đăng nhập</div>
            </button>
          </div>
        </div>
      </div>
      <div class="text-3xl bg-green-50">
        <div class="flex h-[100vh] items-center px-[18%] justify-between">
          <div class="flex flex-col items-center space-y-12 max-w-[50%] text-center px-4">
            <img
              src={GOOGLE_SHEET_FAVICON_URL}
              alt="Sheet"
              width={128}
              height={128}
            />
            <div class="font-bold text-4xl whitespace-nowrap">
              Tích hợp Google Trang tính
            </div>
            <div>
              Xem, duyệt, từ chối confession ngay trên ứng dụng với giao diện
              đẹp mắt
            </div>
          </div>
          <div class="flex flex-col items-center space-y-12 max-w-[50%] text-center px-4">
            <img
              src="https://upload.wikimedia.org/wikipedia/en/0/04/Facebook_f_logo_%282021%29.svg"
              width={128}
              height={128}
              alt="FB"
            />
            <p class="font-bold text-4xl whitespace-nowrap">
              Tích hợp Facebook
            </p>
            <p>Đăng bài, đồng bộ confession mới nhất ngay trên ứng dụng</p>
          </div>
        </div>
      </div>
      <div class="text-3xl bg-white">
        <div class="flex h-[100vh] items-center px-[18%] justify-between">
          <div class="flex flex-col items-center space-y-12">
            <p class="font-bold text-4xl whitespace-nowrap">
              Phân chia dữ liệu của bạn rõ ràng
            </p>
            <p>Dễ dàng quản lí</p>
          </div>
          <div class="flex flex-col items-center space-y-4 font-semibold">
            <div>Lưu Confession trong 4 trang tính</div>
            <ul class="text-gray-600 space-y-6">
              <li>Đang chờ</li>
              <li>Đã duyệt</li>
              <li>Đã từ chối</li>
              <li>Đã đăng</li>
            </ul>
          </div>
        </div>
      </div>
      <div class="text-3xl bg-sky-50">
        <div class="flex h-[100vh] items-center px-[18%] justify-between">
          <div class="flex flex-col items-center space-y-4 font-semibold">
            <ul class="space-y-6 font-normal">
              <li>Tự động đánh hashtag theo thứ tự</li>
              <li>Tự động chèn liên kết gửi biểu mẫu</li>
              <li>Đăng bài ngay lên trang</li>
              <li>Tùy chọn tiêu đề, kết bài,...</li>
              <li>Hỗ trợ trả lời Confession</li>
              <li>Dễ dàng sắp xếp nội dung đăng</li>
              <li>...</li>
            </ul>
          </div>
          <div class="flex flex-col items-center space-y-12">
            <p class="font-bold text-4xl whitespace-nowrap">
              Tùy chọn đăng bài đa dạng
            </p>
            <p>Nội dung bài đăng theo ý muốn</p>
          </div>
        </div>
      </div>
      <div class="text-3xl bg-pink-50">
        <div class="flex h-[100vh] items-center px-[18%] justify-center">
          <div class="flex flex-col items-center space-y-12">
            <img src={BELL_ICON_URL} alt="Bell" width={128} height={128} />
            <p class="font-bold text-4xl whitespace-nowrap">
              Thông báo đến thiết bị
            </p>
            <p>
              Nhận thông báo cho thiết bị mỗi khi có confession vừa được gửi.
            </p>
          </div>
        </div>
      </div>
      <div class="text-3xl bg-white">
        <div class="flex h-[100vh] items-center px-[18%] justify-center">
          <div class="flex flex-col items-center space-y-12">
            <button
              onClick={handleLogin}
              class="flex items-center space-x-8 shadow-lg py-8 px-16 rounded-md bg-gray-100 hover:bg-gray-300 hover:cursor-pointer"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                alt="Đăng nhập với Google"
                class="w-20 h-20"
              />
              <div class="pr-2 font-semibold text-5xl">Đăng nhập ngay</div>
            </button>
            <p class="font-bold text-4xl whitespace-nowrap">
              Miễn phí, an toàn, mã nguồn mở
            </p>
            <p class="text-center">
              Ứng dụng được phát triển một cách phi lợi nhuận, không quảng cáo, không lưu trữ bất kì dữ liệu nào của bạn.
              Xem mã nguồn tại Github của ứng dụng
            </p>
          </div>
        </div>
      </div>
      <footer class="flex py-6 px-[15%] items-center justify-between">
        <div class="flex flex-col items-center space-y-1">
          <div class="flex items-center space-x-4">
            <AppLogo />
            <div>Confession Manager</div>
          </div>
          <div class="text-sm text-gray-500">trietgaming • 2023</div>
          <A class="text-sm text-blue-500" href="/about">
            Về chúng tôi
          </A>
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
