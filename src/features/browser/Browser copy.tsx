import React, { useState } from 'react';
import { nanoid } from 'nanoid';
import styles from './Browser.module.css';
import { SquareButton } from '../../common/squareButton/SquareButton';
import {
  addRule,
  addSmartTile,
  addTileset,
  rulesSelector,
  smartTilesSelector,
  tilesetsSelector,
  selectedSelector,
  select,
} from './browserSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { ID, Rule, SmartTile, Tileset } from './browserTypes';
import { TilesetPreview } from '../../common/tilesetPreview/TilesetPreview';

export function Browser() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector(selectedSelector);

  const [showRules, setShowRules] = useState(false);
  const rules = useAppSelector(rulesSelector);
  let rulesContent = null;
  if (rules)
    rulesContent = rules.map((rule: Rule) => {
      const isSelected = selected && selected.type === rule.type && selected.id === rule.id;
      return (
        <div
          key={rule.id}
          className={`${styles.ruleCard} ${isSelected ? styles.selectedCard : ''}`}
          onClick={() => {
            dispatch(select(rule));
          }}
        >
          {rule.name.substring(0, 2).toUpperCase()}
        </div>
      );
    });

  const [showSmartTiles, setShowSmartTiles] = useState(false);
  const smartTiles = useAppSelector(smartTilesSelector);
  let smartTilesContent = null;
  if (smartTiles)
    smartTilesContent = smartTiles.map((smartTile: SmartTile) => {
      const isSelected = selected && selected.type === smartTile.type && selected.id === smartTile.id;
      return (
        <div
          key={smartTile.id}
          className={`${styles.smartTileCard} ${isSelected ? styles.selectedCard : ''}`}
          onClick={() => {
            dispatch(select(smartTile));
          }}
        >
          {smartTile.name.substring(0, 2).toUpperCase()}
        </div>
      );
    });

  const [showTilesets, setShowTilesets] = useState(false);
  const [expanded, setExpanded] = useState<ID[]>([]);
  const tilesets = useAppSelector(tilesetsSelector);
  let tilesetsContent = null;
  let tilesetsPreview = null;
  if (tilesets) {
    tilesetsContent = tilesets.map((tileset: Tileset) => {
      const isSelected = selected && selected.type === tileset.type && selected.id === tileset.id;
      return (
        <div
          key={tileset.id}
          className={`${styles.tilesetCard} ${isSelected ? styles.selectedCard : ''}`}
          onClick={() => {
            dispatch(select(tileset));
          }}
          onDoubleClick={() => {
            if (expanded.includes(tileset.id)) setExpanded([...expanded].filter((id) => id !== tileset.id));
            else setExpanded([...expanded, tileset.id]);
          }}
        >
          {tileset.name.substring(0, 2).toUpperCase()}
        </div>
      );
    });
    tilesetsPreview = tilesets.map((tileset: Tileset) => {
      if (expanded.includes(tileset.id))
        return (
          <TilesetPreview filters={tileset.filters} grid={tileset.grid} showGrid={false} sprite={tileset.sprite} />
        );
      else return null;
    });
  }

  const [width, setWidth] = useState(300);
  let lastWidth = width;
  let lastPos: number = 0;

  function handleDragStart(e: React.MouseEvent<HTMLDivElement>) {
    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    lastPos = e.clientX;
    lastWidth = width;
  }

  function handleDragEnd() {
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
  }

  function handleDragMove(e: MouseEvent) {
    lastWidth = lastWidth + e.clientX - lastPos;
    setWidth(lastWidth);
    lastPos = e.clientX;
  }

  return (
    <div className={styles.container} style={{ width: `${width}px` }}>
      <div className={styles.title}>
        <span>BROWSER</span>
        <div className={styles.spacer} />
        <SquareButton icon='tag' onClick={() => {}} title='filter' />
      </div>
      <div className={styles.scrollable}>
        <div className={styles.group}>
          <button
            className={styles.groupLabel}
            onClick={() => {
              setShowRules(!showRules);
            }}
          >
            <div className={styles.expandIcon}>
              <div className={`${showRules ? 'icon-chevron-down' : 'icon-chevron-right'} icon`} />
            </div>
            <span>RULES</span>
            <div className={styles.spacer} />
            <SquareButton
              title='add'
              onClick={() => {
                setShowRules(true);
                dispatch(addRule(nanoid()));
              }}
              icon='add'
            />
          </button>
          <div className={styles.groupContent} hidden={!showRules || !rules.length}>
            {rulesContent}
          </div>
        </div>
        <div className={styles.group}>
          <button
            className={styles.groupLabel}
            onClick={() => {
              setShowSmartTiles(!showSmartTiles);
            }}
          >
            <div className={styles.expandIcon}>
              <div className={`${showSmartTiles ? 'icon-chevron-down' : 'icon-chevron-right'} icon`} />
            </div>
            <span>SMART TILES</span>
            <div className={styles.spacer} />
            <SquareButton
              title='add'
              onClick={() => {
                setShowSmartTiles(true);
                dispatch(addSmartTile(nanoid()));
              }}
              icon='add'
            />
          </button>
          <div className={styles.groupContent} hidden={!showSmartTiles || !smartTiles.length}>
            {smartTilesContent}
          </div>
        </div>
        <div className={styles.group}>
          <button
            className={styles.groupLabel}
            onClick={() => {
              setShowTilesets(!showTilesets);
            }}
          >
            <div className={styles.expandIcon}>
              <div className={`${showTilesets ? 'icon-chevron-down' : 'icon-chevron-right'} icon`} />
            </div>
            <span>TILESETS</span>
            <div className={styles.spacer} />
            <SquareButton
              title='add'
              onClick={() => {
                setShowTilesets(true);
                dispatch(addTileset(nanoid()));
              }}
              icon='add'
            />
          </button>
          <div className={styles.groupContent} hidden={!showTilesets || !tilesets.length}>
            {tilesetsContent}
            {tilesetsPreview}
          </div>
        </div>
      </div>
      <div className={styles.resizeBar} onMouseDown={handleDragStart}></div>
    </div>
  );
}
