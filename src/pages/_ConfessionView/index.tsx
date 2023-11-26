import ConfessionComponent from "components/ConfessionComponent";
import {
  Component,
  For,
  Show,
  batch,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import {
  confessionMetadata,
  confessionSpreadsheet,
  confessions,
  pendingChanges,
  scrollY,
  sheetsLastRow,
} from "store";
import {
  ActionButtonMetadata,
  Confessions,
  HandleAction,
  SheetTypeKeys,
} from "types";
// import cachedConfesison from "../../caching/confession";
import Confession from "models/Confession";
import { Portal } from "solid-js/web";
import LoadingCircle from "ui-components/LoadingCircle";
import { FETCH_TRIGGER_Y_OFFSET, MAX_CFS_PER_LOAD } from "../../constants";

const VIEW_METADATA: {
  [key in keyof Confessions]?: {
    title: string;
    actions: {
      primary?: ActionButtonMetadata;
      secondary?: ActionButtonMetadata;
    };
  };
} = {
  accepted: {
    title: "Các Confession đã duyệt (chưa đăng)",
    actions: {
      primary: {
        title: "Bỏ duyệt",
        key: "cancels",
      },
      secondary: {
        title: "Từ chối",
        key: "declines",
      },
    },
  },
  declined: {
    title: "Các Confession đã từ chối",
    actions: {
      primary: {
        title: "Duyệt",
        key: "accepts",
      },
      secondary: {
        title: "Bỏ từ chối",
        key: "cancels",
      },
    },
  },
  pending: {
    title: "Các Confession đang chờ duyệt",
    actions: {
      primary: {
        title: "Duyệt",
        key: "accepts",
      },
      secondary: {
        title: "Từ chối",
        key: "declines",
      },
    },
  },
};

const View: Component<{
  key: keyof Confessions;
  ascending?: boolean;
  postPage?: boolean;
  metadata?: typeof VIEW_METADATA;
  handleChange?: HandleAction;
}> = (props) => {
  const sheetType = (props.key + "Sheet") as SheetTypeKeys;
  const metadata =
    (props.metadata && props.metadata[props.key]) || VIEW_METADATA[props.key]!;
  const currentSheet = confessionMetadata[sheetType]!;

  const [isAscending, setAscending] = createSignal(!!props.ascending);
  const currentConfessions = createMemo(
    () => confessions[props.key][+isAscending()]
  );

  const nextFirstCfsRow = createMemo(() =>
    currentConfessions().length
      ? currentConfessions()[currentConfessions().length - 1].row +
        (isAscending() ? 1 : -1)
      : isAscending()
      ? 2
      : sheetsLastRow[sheetType]! || -1
  ); // first row is the frozen row which is the form item, not response
  const [isFetching, setFetching] = createSignal(false);
  const [isEnd, setEnd] = createSignal(false);

  let cfsContainer: HTMLUListElement | undefined;

  createEffect(() => {
    if (!isAscending() && sheetsLastRow[sheetType] === undefined) {
      setFetching(true);
    } else {
      setFetching(false);
    }
    // Fetch real data to make sure it's end
    if (!currentConfessions().length) setEnd(false);
  });

  const handleScroll = async () => {
    if (isFetching() || isEnd()) return;
    const currentFirstCfsRow = nextFirstCfsRow();
    if (
      currentFirstCfsRow <= 1 ||
      (sheetsLastRow[sheetType] !== undefined &&
        currentFirstCfsRow > sheetsLastRow[sheetType]!)
    )
      return setEnd(true);

    if (
      scrollY() + window.innerHeight >=
      cfsContainer!.clientHeight -
        FETCH_TRIGGER_Y_OFFSET +
        cfsContainer!.offsetTop
    ) {
      setFetching(true);
      if (isAscending()) {
        let _nextFirstCfsRow = currentFirstCfsRow + MAX_CFS_PER_LOAD;

        const range: string = `'${
          currentSheet.properties!.title
        }'!A${currentFirstCfsRow}:B${_nextFirstCfsRow - 1}`;

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
                currentConfessions().push(nextConfession);
              }

              // setNextFirstCfsRow(_nextFirstCfsRow);
            });
            // cachedConfesison.set(confessions());
          }
        } catch (err: any) {
          if (err?.result?.error.status === "INVALID_ARGUMENT") {
            setEnd(true);
          } else console.error(err);
        }
      } else {
        let _nextFirstCfsRow = currentFirstCfsRow - MAX_CFS_PER_LOAD;
        console.log(_nextFirstCfsRow);
        if (_nextFirstCfsRow <= 1) {
          _nextFirstCfsRow = 1;
          setEnd(true);
        }
        const range: string = `'${currentSheet.properties!.title}'!A${
          _nextFirstCfsRow + 1
        }:B${currentFirstCfsRow}`;

        try {
          const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: confessionSpreadsheet!.spreadsheetId!,
            range,
          });
          const values = response.result.values;
          if (!values) setEnd(true);
          else {
            const nextConfessions: Confession[] = [];
            for (
              let i = currentFirstCfsRow - _nextFirstCfsRow - 1, start = i;
              i >= 0;
              --i
            ) {
              const value = values[i];
              if (!value || !value.length) continue;
              nextConfessions.push(
                new Confession(
                  value,
                  currentFirstCfsRow - (start - i),
                  currentSheet
                )
              );
            }
            batch(() => {
              for (const nextConfession of nextConfessions) {
                currentConfessions().push(nextConfession);
              }

              // setNextFirstCfsRow(_nextFirstCfsRow);
            });
            // cachedConfesison.set(confessions());
          }
        } catch (err: any) {
          if (err?.result?.error.status === "INVALID_ARGUMENT") {
            setEnd(true);
          } else console.error(err);
        }
      }

      setFetching(false);
    }
  };

  createEffect(handleScroll);

  const handleAction: HandleAction =
    props.handleChange ||
    ((actionType, confession) => {
      pendingChanges[actionType]?.push(confession);
      handleScroll();
      confession.setHidden(true);
    });

  const handleSort = (_isAscending: boolean) => {
    batch(() => {
      setAscending(_isAscending);
      setEnd(false);
    });
    window.scrollTo({
      top: 0,
    });
    handleScroll();
  };

  return (
    <div class="flex flex-col">
      {props.postPage ? (
        <h2 class="text-2xl text-center font-bold mt-14">
          Confession đã duyệt
        </h2>
      ) : (
        <h1 class="text-center my-8 text-4xl font-bold w-full">
          {metadata.title}
        </h1>
      )}
      <Portal>
        <div
          class={`fixed flex items-center space-x-2 ${
            props.postPage ? "left-20" : "right-4"
          } translate-y-[80px] top-0`}
        >
          <button
            onclick={() => handleSort(true)}
            class={`rounded-lg p-1 disabled:text-white ${
              isAscending() ? "bg-blue-300" : "bg-gray-200"
            }`}
            disabled={isFetching()}
          >
            Cũ nhất trước
          </button>
          <button
            onclick={() => handleSort(false)}
            class={`rounded-lg p-1 disabled:text-white ${
              isAscending() ? "bg-gray-200" : "bg-blue-300"
            }`}
            disabled={isFetching()}
          >
            Mới nhất trước
          </button>
        </div>
      </Portal>
      <ul class="self-center" ref={cfsContainer}>
        <For
          each={currentConfessions()}
          fallback={
            <h3 hidden={isFetching()}>Hiện tại không có confession nào...</h3>
          }
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
