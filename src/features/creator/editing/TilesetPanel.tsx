import styles from './Editing.module.css';
import { Tileset, TilesetFilter } from '../../../app/globalTypes';
import { Propertie } from '../../../common/propertie/Propertie';
import { ImageInput } from '../../../common/imageInput/ImageInput';
import { TilesetPreview } from '../../../common/tilesetPreview/TilesetPreview';
import { useAppDispatch } from '../../../app/hooks';
import { update } from '../../explorer/explorerSlice';
import { CheckboxInput } from '../../../common/checkboxInput/CheckboxInput';
import { GridSetter } from './modal/grid/GridSetter';
import { useState } from 'react';
import { TagsDisplay } from '../../../common/tags/TagsDisplay';
import { TagInput } from '../../../common/tags/TagInput';
import { Modal } from './modal/Modal';
import { ActionCreators } from 'redux-undo';

export function TilesetPanel({ selected }: { selected: Tileset }) {
  const dispatch = useAppDispatch();
  const [showGrid, setShowGrid] = useState(true);
  const [isBlurred, setIsBlurred] = useState(false);

  function setFilter(filter: TilesetFilter, value: boolean): TilesetFilter[] {
    const filters = [...selected.filters];
    if (value) return Array.from(new Set([...filters, filter]));
    else if (filters.includes(filter)) {
      filters.splice(filters.indexOf(filter), 1);
      return filters;
    } else return filters;
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.subContainer} ${isBlurred ? styles.blurred : ''}`}>
        <h1>Tileset</h1>
        <Propertie name='Import image' about='Upload the tilesheet image for the tileset'>
          <ImageInput
            onChange={(imageData) => {
              //TODO
              if (selected.image) window.URL.revokeObjectURL(selected.image.url);
              dispatch(
                update({
                  target: selected,
                  changes: {
                    image: imageData,
                    grid: {
                      columns: 0,
                      height: 0,
                      width: 0,
                      rows: 0,
                      offset: { bottom: 0, left: 0, right: 0, top: 0 },
                    },
                  },
                }),
              );
              dispatch(ActionCreators.clearHistory());
            }}
          />
        </Propertie>
        <Propertie name='Preview'>
          <>
            <CheckboxInput
              value={showGrid}
              title='Show the grid'
              onChange={(bool) => {
                setShowGrid(bool);
              }}
            />
            <TilesetPreview
              sprite={selected.image}
              showGrid={showGrid}
              grid={selected.grid}
              filters={selected.filters}
            />
            {selected.image ? (
              <p>
                <i>
                  Image size: <b>{selected.image.width}</b> x <b>{selected.image.height}</b>
                </i>
              </p>
            ) : null}
          </>
        </Propertie>
        <Propertie name='Grid' about='Set the grid layout size\nDesc TODO'>
          <GridSetter selected={selected} />
        </Propertie>
        <Propertie
          name='Filters'
          about='Add filters to your tileset for display purpose\nChoose whether or not the image should be pixelated'
        >
          <CheckboxInput
            title='Pixelated'
            value={selected.filters.includes('pixelated')}
            onChange={(value) => {
              dispatch(update({ target: selected, changes: { filters: setFilter('pixelated', value) } }));
            }}
          />
        </Propertie>
        <Propertie name='Tags'>
          <>
            <TagsDisplay
              tags={selected.tags}
              onChange={(tags) => {
                dispatch(update({ target: selected, changes: { tags: tags } }));
              }}
            />
            <TagInput
              tags={selected.tags}
              onChange={(tags) => {
                dispatch(update({ target: selected, changes: { tags: tags } }));
              }}
            />
          </>
        </Propertie>
      </div>
    </div>
  );
}
