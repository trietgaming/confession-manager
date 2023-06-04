import columnToLetter from "methods/columnToLetter";
import { Component, createEffect, createMemo, onMount } from "solid-js";
import { confessionMetadata } from "store/index";
import { PreviewSheetKeys } from "types";
import { MAX_CELL_HEIGHT, MAX_CELL_WIDTH } from ".";

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
  const columns = [];
  for (let i = 1; i <= numCol(); ++i) columns.push(columnToLetter(i));

  let canvasRef: HTMLCanvasElement | undefined;

  onMount(async () => {
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
    const p = 1;
    const ellipsis = "...";
    const ellipsisWidth = ctx.measureText(ellipsis).width;

    createEffect(async () => {
      ctx.save();
      const currentScrollY = props.scrollY;
      const currentScrollX = props.scrollX;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(-(currentScrollX - p) + 0.5, -(currentScrollY - p) + 0.5);

      const startY = MAX_CELL_HEIGHT * ~~(currentScrollY / MAX_CELL_HEIGHT);
      const endY = Math.min(startY + window.innerHeight, tableBorderHeight);
      const startX = MAX_CELL_WIDTH * ~~(currentScrollX / MAX_CELL_WIDTH);
      const endX = Math.min(startX + window.innerWidth, tableBorderWidth);
      console.log({
        startX,
        endX,
        startY,
        endY,
      });

      ctx.beginPath();
      // Horizontal Lines
      for (let y = startY; y <= endY; y += MAX_CELL_HEIGHT) {
        ctx.moveTo(0 + p, y + p);

        ctx.lineTo(endX + p, y + p);
      }
      // Vertical Lines
      for (let x = startX; x <= endX; x += MAX_CELL_WIDTH) {
        ctx.moveTo(x + p, 0 + p);

        ctx.lineTo(x + p, endY + p);
      }

      for (
        let i = startY / MAX_CELL_HEIGHT,
          n = Math.round(endY / MAX_CELL_HEIGHT);
        i < n;
        ++i
      ) {
        const row = data()[i];
        if (!row) continue;
        for (let j = 0, m = row.length; j < m; ++j) {
          let cell = row[j];
          if (!cell) continue;
          if (ctx.measureText(cell).width > MAX_CELL_WIDTH) {
            let l = 0;
            let r = cell.length - 1;
            let croppedText = "";

            while (l < r) {
              const mid = ~~((l + r) / 2);
              const substring = cell.slice(0, mid + 1);
              const substringWidth = ctx.measureText(substring).width;

              if (substringWidth <= MAX_CELL_WIDTH - ellipsisWidth - 4 * p) {
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
            MAX_CELL_WIDTH * j + 4 * p,
            MAX_CELL_HEIGHT * (i + 1) - 2 * p
          );
        }
      }

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
