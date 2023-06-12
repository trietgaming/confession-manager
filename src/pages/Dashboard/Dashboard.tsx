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
  confessionMetadata,
  confessionSpreadsheet,
  confessions,
  pendingChanges,
  scrollY,
  setPendingChanges,
} from "store";
import { Confession, HandleAction } from "types";
// import cachedConfesison from "../../caching/confession";
import LoadingCircle from "ui-components/LoadingCircle";
import { FETCH_TRIGGER_Y_OFFSET, MAX_CFS_PER_LOAD } from "../../constants";

const Dashboard: Component = () => {
  const [nextFirstCfsRow, setNextFirstCfsRow] = createSignal(2); // 1: title of row, 2: first reply of the table
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

      const range: string = `'${
        confessionMetadata!.pendingSheet!.properties!.title
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
            nextConfessions.push({
              data: value[1],
              date: value[0],
              row: i + currentFirstCfsRow,
            });
          }
          batch(() => {
            for (const nextConfession of nextConfessions) {
              confessions.pending.push(nextConfession);
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

  const handleAction: HandleAction = (actionType, confession, ref) => {
    /// @ts-ignore
    setPendingChanges(actionType, (prev) => [...prev, { confession, ref }]);
    handleScroll();
    ref.hidden = true;
  };

  return (
    <div class="flex flex-col">
      <h1 class="text-center my-8 text-4xl font-bold w-full">
        Các Confession đang chờ duyệt
      </h1>
      <ul class="self-center" ref={cfsContainer}>
        <For
          each={confessions.pending}
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
