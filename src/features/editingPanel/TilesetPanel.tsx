import { Tileset, TilesetFilter } from '../browser/browserTypes';
import styles from './Panel.module.css';
import { Propertie } from '../../common/propertie/Propertie';
import { ImageInput } from '../../common/fileInput/ImageInput';
import { ImagePreview } from '../../common/fileInput/ImagePreview';
import { useAppDispatch } from '../../app/hooks';
import { updateTileset } from '../browser/browserSlice';
import { CheckboxInput } from '../../common/checkboxInput/CheckboxInput';

export function TilesetPanel({ selected }: { selected: Tileset }) {
  const dispatch = useAppDispatch();
  const imageData = selected.image;

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
      <h1>Tileset</h1>
      <Propertie name='Tileset file' about='Upload the tilesheet image for the tileset'>
        <>
          <ImageInput
            onChange={(imageData) => {
              dispatch(updateTileset({ id: selected.id, changes: { image: imageData } }));
            }}
          />
          <ImagePreview imageData={imageData} filters={selected.filters} />
        </>
      </Propertie>
      <Propertie name='Pixelated' about='Choose whether or not the image should be pixelated\n(for pixel art assets)'>
        <CheckboxInput
          value={selected.filters.includes('pixelated')}
          onChange={(value) => {
            dispatch(updateTileset({ id: selected.id, changes: { filters: setFilter('pixelated', value) } }));
          }}
        />
      </Propertie>
    </div>
  );
}
