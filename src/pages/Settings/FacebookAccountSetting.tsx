import { Component, Show } from "solid-js";
import {
  doubleTitleContainerClass,
  settingContainerClass,
  titleIconClass,
} from ".";
import { FACEBOOK_API_SCOPES, PAPER_PLANE_ICON_URL } from "app-constants";
import FacebookPageSelector from "components/FacebookPageSelector";
import Button from "ui-components/Button";
import FacebookButton from "components/FacebookButton";
import { accessibleFacebookPages } from "store/index";
import FacebookAccountManager from "controllers/FacebookAccountManager";

const FacebookAccountSetting: Component = () => {
  return (
    <>
      <div class={settingContainerClass}>
        <div class={doubleTitleContainerClass}>
          <img
            src="https://upload.wikimedia.org/wikipedia/en/0/04/Facebook_f_logo_%282021%29.svg"
            alt="FB"
            class={titleIconClass}
          />
          <p>Tài khoản Facebook</p>
        </div>
        <FacebookButton />
      </div>
      <Show when={accessibleFacebookPages.length}>
        <div class={settingContainerClass}>
          <div class={doubleTitleContainerClass}>
            <img
              src={PAPER_PLANE_ICON_URL}
              alt="FB Page"
              class={titleIconClass}
            />
            <p>Trang Facebook của Confession</p>
          </div>
          <FacebookPageSelector />
        </div>
        <div class={settingContainerClass}>
          <p class="mr-2">
            Không tìm thấy trang cần tìm? Hãy <b>chỉnh sửa cài đặt</b> đăng nhập
            Facebook:
          </p>
          <Button
            class="whitespace-nowrap"
            onClick={() => {
              FB.login(
                (response) => {
                  FacebookAccountManager.fetchFacebookUserFromAuthResponse(
                    response
                  );
                },
                {
                  auth_type: "reauthorize",
                  scope: FACEBOOK_API_SCOPES,
                }
              );
            }}
          >
            Chỉnh sửa
          </Button>
        </div>
      </Show>
    </>
  );
};

export default FacebookAccountSetting;
