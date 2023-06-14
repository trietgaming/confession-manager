import ConfessionComponent from "components/ConfessionComponent";
import {
  Component,
  For,
  createEffect,
  createSignal,
  Show,
  batch,
  createMemo,
} from "solid-js";
import {
  confessionMetadata,
  confessionSpreadsheet,
  confessions,
  pendingChanges,
  scrollY,
} from "store";
import {
  ActionButtonMetadata,
  Confessions,
  HandleAction,
  SheetTypeKeys,
} from "types";
// import cachedConfesison from "../../caching/confession";
import LoadingCircle from "ui-components/LoadingCircle";
import { FETCH_TRIGGER_Y_OFFSET, MAX_CFS_PER_LOAD } from "../../constants";
import getLastRowPositionHasValue from "methods/getLastRowPositionHasValue";
import Confession from "classes/Confesison";

const VIEW_METADATA: {
  [key in keyof Confessions]: {
    title: string;
    actions: {
      primary: ActionButtonMetadata;
      secondary: ActionButtonMetadata;
    };
  };
} = {
  accepted: {
    title: "Các Confession đã duyệt (chưa đăng)",
    actions: {
      primary: {
        title: "Bỏ duyệt",
        key: "cancels",
        handler: () => {},
      },
      secondary: {
        title: "Từ chối",
        key: "declines",
        handler: () => {},
      },
    },
  },
  declined: {
    title: "Các Confession đã từ chối",
    actions: {
      primary: {
        title: "Duyệt",
        key: "accepts",
        handler: () => {},
      },
      secondary: {
        title: "Bỏ từ chối",
        key: "cancels",
        handler: () => {},
      },
    },
  },
  pending: {
    title: "Các Confession đang chờ duyệt",
    actions: {
      primary: {
        title: "Duyệt",
        key: "accepts",
        handler: () => {},
      },
      secondary: {
        title: "Từ chối",
        key: "declines",
        handler: () => {},
      },
    },
  },
};

const View: Component<{
  key: keyof Confessions;
}> = (props) => {
  const metadata = VIEW_METADATA[props.key];
  const [nextFirstCfsRow, setNextFirstCfsRow] = createSignal(
    confessions[props.key].length
      ? confessions[props.key][confessions[props.key].length - 1].row + 1
      : 2
  ); // first row is the frozen row which is the form item, not response
  const [isFetching, setFetching] = createSignal(false);
  const [isEnd, setEnd] = createSignal(false);

  let cfsContainer: HTMLUListElement | undefined;

  const handleScroll = async () => {
    if (isFetching() || isEnd()) return;
    if (
      scrollY() + window.innerHeight >=
      cfsContainer!.clientHeight -
        FETCH_TRIGGER_Y_OFFSET +
        cfsContainer!.offsetTop
    ) {
      setFetching(true);
      const currentFirstCfsRow = nextFirstCfsRow();
      const currentSheet =
        confessionMetadata[(props.key + "Sheet") as SheetTypeKeys]!;

      const range: string = `'${
        currentSheet.properties!.title
      }'!A${currentFirstCfsRow}:B${currentFirstCfsRow + MAX_CFS_PER_LOAD - 1}`;

      try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: confessionSpreadsheet!.spreadsheetId!,
          range,
        });
        const values = response.result.values;
        if (!values) setEnd(true);
        else {
          const nextConfessions: Confession[] = [];
          for (let i = 0; i < MAX_CFS_PER_LOAD; ++i) {
            const value = values[i];
            if (!value || !value.length) continue;
            nextConfessions.push(
              new Confession(value, i + currentFirstCfsRow, currentSheet)
            );
          }
          batch(() => {
            for (const nextConfession of nextConfessions) {
              confessions[props.key].push(nextConfession);
            }

            setNextFirstCfsRow((last) => last + MAX_CFS_PER_LOAD);
          });
          // cachedConfesison.set(confessions());
        }
      } catch (err: any) {
        if (err?.result?.error.status === "INVALID_ARGUMENT") {
          setEnd(true);
        } else console.error(err);
      }
      setFetching(false);
    }
  };

  createEffect(handleScroll);
  createEffect(() => {
    setNextFirstCfsRow(
      confessions[props.key].length
        ? confessions[props.key][confessions[props.key].length - 1].row + 1
        : 2
    );
    handleScroll();
  });

  const handleAction: HandleAction = (actionType, confession) => {
    pendingChanges[actionType]?.push(confession);
    handleScroll();
    confession.ref!.hidden = true;
  };

  return (
    <div class="flex flex-col">
      <h1 class="text-center my-8 text-4xl font-bold w-full">
        {metadata.title}
      </h1>
      <ul class="self-center" ref={cfsContainer}>
        <For
          each={confessions[props.key]}
          fallback={<h3>Hiện tại không có confession nào...</h3>}
        >
          {(confession) => {
            return (
              <ConfessionComponent
                primaryAction={metadata.actions.primary}
                secondaryAction={metadata.actions.secondary}
                confession={confession}
                handleAction={handleAction}
              ></ConfessionComponent>
            );
          }}
        </For>
        <div class="w-full flex justify-center">
          <Show when={isFetching()}>
            <LoadingCircle />
          </Show>
          <Show when={isEnd()}>
            <h3 class="my-4">Hết...</h3>
          </Show>
        </div>
      </ul>
    </div>
  );
};

export default View;
