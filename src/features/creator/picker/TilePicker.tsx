import styles from './TilePicker.module.css';
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { select, selectedSelector } from '../explorer/explorerSlice';
import { ObjTypes, Tileset, Vector2 } from '../../../types/globalTypes';
import { SquareButton } from '../../../common/squareButton/SquareButton';
import { pickedTilesetContentSelector } from './pickerSlice';

function getImage(selected: Tileset | undefined): HTMLImageElement | null {
  if (!selected || !selected.image) return null;
  const img = new Image();
  img.src = selected.image.url;
  return img;
}

const ZOOM_INCREMENT = 0.2;

export function TilePicker({ size }: { size: { width: number; height: number } }) {
  const dispatch = useAppDispatch();
  const selected = useAppSelector(selectedSelector);
  const picked: Tileset | undefined = useAppSelector(pickedTilesetContentSelector);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [zoom, setZoom] = useState<null | number>(null);
  const [offset, setOffset] = useState<Vector2>({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState<Vector2>({ x: 0, y: 0 });
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = getImage(picked);
    if (img)
      img.onload = () => {
        setImage(img);
      };
  }, [picked]);

  useEffect(() => {
    // INIT
    const img = image;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas;
    const c = canvas.getContext('2d');
    if (!c) return;
    if (!img || !picked || !picked.image) {
      c.clearRect(0, 0, width, height);
      return;
    }
    if (picked.filters.includes('pixelated')) c.imageSmoothingEnabled = false;
    else c.imageSmoothingEnabled = true;

    // DRAWING IMG
    c.clearRect(0, 0, width, height);
    if (!zoom) {
      setZoom(Math.max(img.width / width, img.height / height));
      return;
    }

    const w = img.width / zoom;
    const h = img.height / zoom;
    const x = offset.x + (w - width) / -2;
    const y = offset.y + (h - height) / -2;
    c.drawImage(img, x, y, w, h);

    // DRAW GRID
    const grid = picked.grid;
    if (showGrid) {
      //OFFSET GRID
      c.globalAlpha = 0.2;
      c.lineWidth = 1;
      c.strokeStyle = 'yellow';
      if (grid.offset.bottom !== 0 || grid.offset.left !== 0 || grid.offset.right !== 0 || grid.offset.top !== 0)
        for (let row = 0; row < grid.rows; row++)
          for (let col = 0; col < grid.columns; col++) {
            const offX = x + (col * (grid.width + grid.offset.left + grid.offset.right) + grid.offset.left) / zoom;
            const offY = y + (row * (grid.height + grid.offset.top + grid.offset.bottom) + grid.offset.top) / zoom;
            c.strokeRect(offX, offY, grid.width / zoom, grid.height / zoom);
          }

      // GRID
      c.strokeStyle = 'white';
      c.globalAlpha = 0.8;
      c.lineWidth = 1;
      for (let col = 0; col <= grid.columns; col++) {
        const gridX = x + (col * (grid.width + grid.offset.left + grid.offset.right)) / zoom;
        c.beginPath();
        c.moveTo(gridX, y);
        c.lineTo(gridX, y + h);
        c.stroke();
      }
      for (let row = 0; row <= grid.rows; row++) {
        const gridY = y + (row * (grid.height + grid.offset.top + grid.offset.bottom)) / zoom;
        c.beginPath();
        c.moveTo(x, gridY);
        c.lineTo(x + w, gridY);
        c.stroke();
      }
      c.globalAlpha = 1;
    }
    // MOUSE BOX
    const col = Math.round((mousePos.x - x) / (w / grid.columns) - 0.5);
    const row = Math.round((mousePos.y - y) / (h / grid.rows) - 0.5);
    if (col >= 0 && row >= 0 && col < grid.columns && row < grid.rows) {
      const mouseX = x + col * (w / grid.columns);
      const mouseY = y + row * (h / grid.rows);
      c.strokeStyle = 'white';
      c.lineWidth = 5;
      c.strokeRect(mouseX, mouseY, w / grid.columns, h / grid.rows);
      c.fillStyle = 'white';
      c.font = '13px Segoe UI, sans-serif';
      c.fillText(`x: ${col} y: ${row}`, mouseX + 5, mouseY - 10);
    }
  }, [canvasRef, size, picked, zoom, offset, mousePos, image, showGrid]);

  function handleWheel(e: React.WheelEvent) {
    if (zoom && picked && picked.image && canvasRef.current) {
      const newZoom = e.deltaY > 0 ? zoom * (1 + ZOOM_INCREMENT) : zoom * (1 - ZOOM_INCREMENT);
      const { width, height } = canvasRef.current;
      const w = picked.image.width / zoom;
      const h = picked.image.height / zoom;
      const x = offset.x + (w - width) / -2;
      const y = offset.y + (h - height) / -2;
      const offX = mousePos.x - (x + w / 2) - (((mousePos.x - (x + w / 2)) / w) * picked.image.width) / newZoom;
      const offY = mousePos.y - (y + h / 2) - (((mousePos.y - (y + h / 2)) / h) * picked.image.height) / newZoom;
      setZoom(newZoom);
      setOffset({ x: offset.x + offX, y: offset.y + offY });
    }
  }
  let startPos: Vector2 = { x: 0, y: 0 };
  function handleMouseDown(e: React.MouseEvent) {
    if (e.button === 1) {
      //MIDDLE CLICK
      startPos = { x: e.clientX, y: e.clientY };
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    }
    // else if (e.button === 0 && picked)
    // dispatch(
    //   pick({
    //     name: picked.name,
    //     tileset: picked.id,
    //     sprite: {pos:undefined, },
    //     tags: [],
    //     type: ObjTypes.TILE_BASIC,
    //   }),
    // );
  }
  function handleDrag(e: MouseEvent) {
    const x = offset.x + (e.clientX - startPos.x);
    const y = offset.y + (e.clientY - startPos.y);
    setOffset({ x: x, y: y });
  }
  function handleMouseUp(e: MouseEvent) {
    window.removeEventListener('mousemove', handleDrag);
    window.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'default';
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }

  if (picked && picked.image)
    return (
      <>
        <div className={styles.title}>
          <span>TILE PICKER</span>
          <SquareButton
            icon='debug-restart'
            onClick={() => {
              setOffset({ x: 0, y: 0 });
              setZoom(null);
            }}
            title='reset zoom'
          />
          <SquareButton
            icon='edit'
            onClick={() => {
              if ((!selected && picked) || (selected && picked && selected.id !== picked.id))
                dispatch(select({ type: ObjTypes.TILESET, id: picked.id }));
            }}
            title='edit tileset'
          />
          <SquareButton
            icon='symbol-numeric'
            isActive={showGrid}
            onClick={() => {
              setShowGrid(!showGrid);
            }}
            title='show grid'
          />
          <SquareButton
            icon='info'
            isActive={showControls}
            onClick={() => {
              setShowControls(!showControls);
            }}
            title='show controls'
          />
        </div>
        <div className={styles.canvasContainer}>
          <canvas
            ref={canvasRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            className={styles.canvas}
            width={Math.max(0, size.width - 20)}
            height={Math.max(0, size.height - 40 - 10)}
          />
          {showControls ? (
            <div className={styles.controls}>
              <p className='icon icon-info' />
              <p>TODO</p>
              <p>{`scroll -> zoom`}</p>
              <p>{`middle -> pan the viewport`}</p>
              <p>{`left -> pick a tile`}</p>
            </div>
          ) : null}
        </div>
      </>
    );
  else
    return (
      <>
        <div className={styles.title}>
          <span>TILE PICKER</span>
        </div>
        <div className={styles.placeholder}>
          {picked && !picked.image ? 'The selected tileset has no image' : 'Select a tileset using right click'}
        </div>
      </>
    );
}
