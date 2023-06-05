import columnToLetter from "methods/columnToLetter";
import { Component, createEffect, createMemo, onMount } from "solid-js";
import { confessionMetadata } from "store/index";
import { PreviewSheetKeys } from "types";
import { INDEX_WIDTH, MAX_CELL_HEIGHT, MAX_CELL_WIDTH } from ".";

const TableComponent: Component<{
  sheetValues: { [key in PreviewSheetKeys]: string[][] } | null;
  sheetKey: PreviewSheetKeys;
  scrollY: number;
  scrollX: number;
  outerContainer: HTMLDivElement;
}> = (props) => {
  const numCol = createMemo(
    () =>
      confessionMetadata[props.sheetKey]?.properties?.gridProperties
        ?.columnCount || 0
  );
  const data = createMemo(() =>
    props.sheetValues ? props.sheetValues[props.sheetKey] : []
  );
  // const columns = [];
  // for (let i = 1; i <= numCol(); ++i) columns.push(columnToLetter(i));

  let canvasRef: HTMLCanvasElement | undefined;

  createEffect(async () => {
    const PIXEL_RATIO = window.devicePixelRatio;
    const canvas = canvasRef as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    canvas.width = props.outerContainer.clientWidth * PIXEL_RATIO;
    canvas.height = props.outerContainer.clientHeight * PIXEL_RATIO;
    canvas.style.width = props.outerContainer.clientWidth + "px";
    canvas.style.height = props.outerContainer.clientHeight + "px";

    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 1;
    ctx.font = "14px Arial";
    ctx.scale(PIXEL_RATIO, PIXEL_RATIO);

    const tableBorderWidth = numCol() * MAX_CELL_WIDTH + 2;
    const tableBorderHeight = data().length * MAX_CELL_HEIGHT;
    // padding
    const p = 1;
    // text padding
    const tp = 4 * p;
    const ellipsis = "...";
    const ellipsisWidth = ctx.measureText(ellipsis).width;

    createEffect(async () => {
      ctx.save();
      const currentScrollY = props.scrollY;
      const currentScrollX = props.scrollX;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(-(currentScrollX - p) + 0.5, -(currentScrollY - p) + 0.5);

      const flooredStartY =
        MAX_CELL_HEIGHT * ~~(currentScrollY / MAX_CELL_HEIGHT);
      const flooredStartX =
        MAX_CELL_WIDTH * ~~(currentScrollX / MAX_CELL_WIDTH);
      const startY = MAX_CELL_HEIGHT * (currentScrollY / MAX_CELL_HEIGHT);
      const endY = Math.min(startY + window.innerHeight, tableBorderHeight);
      const startX = MAX_CELL_WIDTH * (currentScrollX / MAX_CELL_WIDTH);
      const endX = Math.min(startX + window.innerWidth + 100, tableBorderWidth);
      console.log(
        JSON.stringify({
          startX,
          endX,
          startY,
          endY,
        })
      );

      const tableBottomY = endY + 2 * MAX_CELL_HEIGHT;
      const tableRightX = endX + MAX_CELL_WIDTH;
      ctx.beginPath();

      // Horizontal Lines

      for (
        let y = flooredStartY + 2 * MAX_CELL_HEIGHT;
        y <= tableBottomY;
        y += MAX_CELL_HEIGHT
      ) {
        ctx.moveTo(flooredStartX, y + p);

        ctx.lineTo(endX + INDEX_WIDTH - p, y + p);
      }

      // Vertical Lines

      for (
        let x = flooredStartX + INDEX_WIDTH + MAX_CELL_WIDTH;
        x <= tableRightX;
        x += MAX_CELL_WIDTH
      ) {
        ctx.moveTo(x + p, flooredStartY);

        ctx.lineTo(x + p, tableBottomY);
      }

      const startIndex = ~~(startY / MAX_CELL_HEIGHT);
      const endIndex = ~~(endY / MAX_CELL_HEIGHT);

      // Data
      for (let i = startIndex; i <= endIndex; ++i) {
        const row = data()[i];
        if (!row) continue;
        for (let j = 0, m = row.length; j < m; ++j) {
          let cell = row[j];
          if (!cell) continue;
          if (ctx.measureText(cell).width > MAX_CELL_WIDTH - tp) {
            let l = 0;
            let r = cell.length - 1;
            let croppedText = "";

            while (l < r) {
              const mid = ~~((l + r) / 2);
              const substring = cell.slice(0, mid + 1);
              const substringWidth = ctx.measureText(substring).width;

              if (substringWidth <= MAX_CELL_WIDTH - ellipsisWidth - tp) {
                croppedText = substring;
                l = mid + 1;
              } else {
                r = mid - 1;
              }
            }
            cell = croppedText + ellipsis;
          }
          ctx.fillText(
            cell,
            MAX_CELL_WIDTH * j + tp + INDEX_WIDTH,
            MAX_CELL_HEIGHT * (i + 2) - tp
          );
        }
      }
      // Indexes & header
      /// Row header (1-n)
      ctx.clearRect(
        startX - 2 * p,
        startY + p,
        INDEX_WIDTH + tp,
        tableBottomY - startY + 2 * p
      );
      for (let i = startIndex; i <= endIndex; ++i) {
        ctx.fillText(i + 1 + "", startX + tp, MAX_CELL_HEIGHT * (i + 2) - tp);
      }

      /// Col header (A - Z^n)
      ctx.clearRect(
        startX - 2 * p,
        startY + p,
        tableRightX - startX + 2 * p + INDEX_WIDTH,
        MAX_CELL_HEIGHT
      );
      for (
        let i = ~~(startX / MAX_CELL_WIDTH), n = ~~(endX / MAX_CELL_WIDTH);
        i <= n;
        ++i
      ) {
        ctx.fillText(
          columnToLetter(i),
          MAX_CELL_WIDTH * (i - 1) + tp + INDEX_WIDTH,
          startY + MAX_CELL_HEIGHT - tp
        );
      }
      // clear intersection of col and row header
      ctx.clearRect(
        startX - 2 * p,
        startY - tp,
        INDEX_WIDTH + 2 * p,
        MAX_CELL_HEIGHT + tp
      );

      /// header horizontal
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX + INDEX_WIDTH + p, startY);
      ctx.moveTo(startX, startY + MAX_CELL_HEIGHT + p);
      ctx.lineTo(endX + INDEX_WIDTH - p, startY + MAX_CELL_HEIGHT + p);

      ///header vertical
      ctx.moveTo(startX + p, 0 + p);
      ctx.lineTo(startX + p, tableBottomY);
      ctx.moveTo(startX + INDEX_WIDTH + p, 0 + p);
      ctx.lineTo(startX + INDEX_WIDTH + p, tableBottomY);

      ctx.stroke();

      ctx.restore();
    });
  });

  return (
    <canvas
      ref={canvasRef}
      class="fixed pointer-events-none z-0"
      style={"image-rendering: pixelated"}
    />
  );
};

export default TableComponent;
