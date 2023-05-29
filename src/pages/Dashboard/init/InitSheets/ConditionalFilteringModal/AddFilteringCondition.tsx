import { Component, For, Show, createSignal } from "solid-js";
import Button from "ui-components/Button";
import DownArrowSvg from "ui-components/DownArrowSvg";
import { FilteredSheetMetadata } from ".";
import { RGB, TextFormat } from "types";
import Color from "classes/Color";

type Conditions = {
  backgroundColor?: Color;
  textFormat?: TextFormat;
  foregroundColor?: Color;
};

type ConditionMetadata = {
  key: keyof Conditions;
  title: string;
};

const conditionMetadatas: ConditionMetadata[] = [
  {
    key: "backgroundColor",
    title: "Màu nền",
  },
  {
    key: "foregroundColor",
    title: "Màu chữ",
  },
  {
    key: "textFormat",
    title: "Kiểu chữ",
  },
];

const AddFilteringCondition: Component<{
  metadata: FilteredSheetMetadata;
  handleClose: () => any;
}> = (props) => {
  const [isDropdownShow, setDropdownShow] = createSignal(false);
  const [selectedConditions, setSelectedConditions] = createSignal<
    ConditionMetadata[]
  >([]);

  const handleAddCondition = (metadataObj: ConditionMetadata) => {
    setSelectedConditions((prev) => [...prev, metadataObj]);
    setDropdownShow(false);
  };

  return (
    <div class="w-full p-6 bg-white border border-gray-200 rounded-lg shadow my-2">
      <div class="flex justify-between">
        <h5 class="my-auto">{props.metadata.title}</h5>
        <div class="flex">
          <Button
            onClick={props.handleClose}
            class="my-0 whitespace-nowrap text-sm bg-gray-200 hover:bg-gray-300 ml-2 text-black"
          >
            Hủy
          </Button>
          <div class="block relative">
            <Button
              onClick={() => setDropdownShow((prev) => !prev)}
              class="my-0 whitespace-nowrap text-sm mr-0"
            >
              Thêm điều kiện <DownArrowSvg />
            </Button>
            <Show when={isDropdownShow()}>
              <div class="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44">
                <ul class="py-2 text-sm text-gray-700">
                  <For each={conditionMetadatas}>
                    {(metadata) => (
                      <li>
                        <a
                          onClick={() => handleAddCondition(metadata)}
                          class="hover:cursor-pointer block px-4 py-2 hover:bg-gray-100"
                        >
                          {metadata.title}
                        </a>
                      </li>
                    )}
                  </For>
                </ul>
              </div>
            </Show>
          </div>
        </div>
      </div>
      <For each={selectedConditions()}>
        {(conditionMetadata) => {
          switch (conditionMetadata.key) {
            case "backgroundColor":
              break;
            case "textFormat":
              break;
          }
          return <div class="mt-6">{conditionMetadata.title}</div>;
        }}
      </For>
    </div>
  );
};

export default AddFilteringCondition;
