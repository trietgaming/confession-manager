import PendingConfession from "components/PendingConfession";
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
  confessionSpreadsheet,
  pendingChanges,
  scrollY,
  setPendingChanges,
} from "store";
import { Confession, HandleAction } from "types";
import confessionCached from "../../caching/confession";
import LoadingCircle from "ui-components/LoadingCircle";
import { FETCH_TRIGGER_Y_OFFSET, MAX_CFS_PER_LOAD } from "../../constants";

const Dashboard: Component = () => {
  const [confessions, setConfessions] = createSignal<Confession[]>(
    confessionCached.get()
  );
  const [lastestCfsRow, setLastestCfsRow] = createSignal(1);
  const [isFetching, setFetching] = createSignal(false);
  const [isEnd, setEnd] = createSignal(false);

  let cfsContainer: HTMLUListElement | undefined;

  const handleScroll = createMemo(() => async () => {
    if (isFetching() || isEnd()) return;
    if (
      scrollY() + window.innerHeight >=
      cfsContainer!.clientHeight -
        FETCH_TRIGGER_Y_OFFSET +
        cfsContainer!.offsetTop
    ) {
      setFetching(true);
      const range: string[] = [];
      for (let i = 1; i <= MAX_CFS_PER_LOAD; ++i) {
        range.push(`A${i + lastestCfsRow()}:B${i + lastestCfsRow()}`);
      }
      try {
        const response = await gapi.client.sheets.spreadsheets.values.batchGet({
          spreadsheetId: confessionSpreadsheet()!.spreadsheetId!,
          ranges: range,
        });
        const result = response.result;
        const valueRanges = result.valueRanges;
        if (!valueRanges) return setEnd(true);

        const nextConfessions: Confession[] = [];
        for (const valueRange of valueRanges) {
          if (!valueRange.values) continue;
          nextConfessions.push({
            data: valueRange.values[0][1],
            date: valueRange.values[0][0],
            /// @ts-ignore next-line
            row: +valueRange.range[valueRange.range.length - 1],
          });
        }
        batch(() => {
          setConfessions((confessions) => {
            return [...confessions, ...nextConfessions];
          });
          setLastestCfsRow((last) => last + MAX_CFS_PER_LOAD);
        });
        confessionCached.set(confessions());
      } catch (err: any) {
        if (err?.result?.error.status === "INVALID_ARGUMENT") {
          setEnd(true);
        } else console.error(err);
      }
      setFetching(false);
    }
  })();

  createEffect(handleScroll);

  const handleAction = createMemo<HandleAction>(
    () => (actionType, confession) => {
      /// @ts-ignore
      setPendingChanges(actionType, (prev) => [...prev, confession]);
      handleScroll();
    }
  )();

  return (
    <div class="flex flex-col">
      <h1 class="text-center my-8 text-4xl font-bold w-full">
        Các Confession đang chờ duyệt
      </h1>
      <ul class="self-center" ref={cfsContainer}>
        <For
          each={confessions()}
          fallback={<h3>Hiện tại không có confession nào...</h3>}
        >
          {(confession) => {
            return (
              <PendingConfession
                confession={confession}
                handleAction={handleAction}
              ></PendingConfession>
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

export default Dashboard;
