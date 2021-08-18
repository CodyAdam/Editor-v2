import styles from './TilePicker.module.css';
import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../../app/hooks';
import { selectedContentSelector } from '../explorerSlice';
import { ObjTypes, SmartBrush, Tileset, Vector2 } from '../../../app/globalTypes';
import { SquareButton } from '../../../common/squareButton/SquareButton';

function getImage(selected: Tileset | SmartBrush | undefined | null): HTMLImageElement | null {
  if (!selected || selected.type !== ObjTypes.TILESET || !selected.image) return null;
  const img = new Image();
  img.src = selected.image.url;
  return img;
}

const ZOOM_INCREMENT = 0.2;

export function TilePicker({ size }: { size: { width: number; height: number } }) {
  const selected = useAppSelector(selectedContentSelector);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<null | number>(null);
  const [offset, setOffset] = useState<Vector2>({ x: 0, y: 0 });

  useEffect(() => {
    const img = getImage(selected);
    draw(img);
  }, [canvasRef, size, selected, zoom, offset]);

  function draw(img: HTMLImageElement | null) {
    // INIT
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas;
    const c = canvas.getContext('2d');
    if (!c) return;
    if (!img) {
      c.clearRect(0, 0, width, height);
      return;
    }
    if (selected && selected.type === ObjTypes.TILESET && selected.filters.includes('pixelated'))
      c.imageSmoothingEnabled = false;
    else c.imageSmoothingEnabled = true;

    img.onload = () => {
      // DRAWING
      c.clearRect(0, 0, width, height);
      if (!zoom) {
        setZoom(Math.max(img.width / width, img.height / height));
      } else {
        const w = img.width / zoom;
        const h = img.height / zoom;
        const x = offset.x + (w - width) / -2;
        const y = offset.y + (h - height) / -2;
        c.drawImage(img, x, y, w, h);
      }
    };
  }

  function reset() {
    setOffset({ x: 0, y: 0 });
    setZoom(null);
  }

  function handleWheel(e: React.WheelEvent) {
    if (zoom) setZoom(e.deltaY > 0 ? zoom * (1 + ZOOM_INCREMENT) : zoom * (1 - ZOOM_INCREMENT));
  }

  let startPos: Vector2 = { x: 0, y: 0 };
  function handleMouseDown(e: React.MouseEvent) {
    if (e.button === 1) {
      //MIDDLE CLICK
      startPos = { x: e.clientX, y: e.clientY };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseleave', handleMouseUp);
    }
  }

  function handleMouseMove(e: MouseEvent) {
    const x = offset.x + (e.clientX - startPos.x);
    const y = offset.y + (e.clientY - startPos.y);
    setOffset({ x: x, y: y });
  }
  function handleMouseUp(e: MouseEvent) {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    window.removeEventListener('mouseleave', handleMouseUp);
  }

  if (selected && selected.type === ObjTypes.TILESET)
    if (selected.image)
      return (
        <div className={styles.container}>
          <SquareButton onClick={reset} title='reset' className={styles.button} icon='debug-restart' />
          <canvas
            ref={canvasRef}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            className={styles.canvas}
            width={Math.max(0, size.width - 20)}
            height={Math.max(0, size.height - 40 - 20)}
          />
        </div>
      );
    else return <div className={styles.container}>The selected tileset has no image</div>;
  else return <div className={styles.container}>Select a tileset</div>;
}
