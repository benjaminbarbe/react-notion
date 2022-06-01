import * as React from "react";
import { ThumbnailValueType, BlockType, ContentValueType, MapImageUrl } from "../types";

const types = ["video", "image", "embed", "figma"];
const reponsiveWidth = [213, 320, 640, 768, 1024, 1366, 1600, 1920, 2560];

const Asset: React.FC<{
  block: BlockType;
  mapImageUrl: MapImageUrl;
}> = ({ block, mapImageUrl }) => {
  const value = block.value as ContentValueType;
  const type = block.value.type;

  if (!types.includes(type)) {
    return null;
  }

  const format = value.format;
  const {
    display_source = undefined,
    block_aspect_ratio = undefined,
    block_height = 1,
    block_width = 1
  } = format ?? {};

  const aspectRatio = block_aspect_ratio || block_height / block_width;

  if (type === "embed" || type === "video" || type === "figma") {
    return (
      <iframe
        className="notion-image-inset"
        src={
          type === "figma" ? value.properties.source[0][0] : display_source
        }
      />
    );
  }

  if (block.value.type === "image") {
    const src = mapImageUrl(value.properties.source[0][0], block);
    const caption = value.properties.caption?.[0][0];
    const style: any = {};

    let thumbnails: ThumbnailValueType[] = [];

    if (block_aspect_ratio) {
      style["aspectRatio"] = `${1 / aspectRatio}`;
    }

    const blockWidth = value.format?.block_width;

    reponsiveWidth.forEach(width => {
      if (!blockWidth || (value.format && width < value.format.block_width)) {
        thumbnails.push({
          src: `${src}&width=${width}`,
          width: width,
        } as ThumbnailValueType);
      }
    });

    if (blockWidth) {
      thumbnails.push({
        src: src,
        width: blockWidth,
      } as ThumbnailValueType);

      style["maxWidth"] = `${blockWidth}px`;
    }
    
    return (
      <picture>
        <source
          srcSet={thumbnails.map((thumb) => {
            return `${thumb.src} ${thumb.width}w`;
          }).join(', ')}
          type="image/png"
          sizes="(min-width: 1280px) 40vw, (min-width: 1024px) 60vw, (min-width: 768px) 80vw, 100vw"
        />
        <img
          src={thumbnails[0].src}
          alt={caption}
          loading="lazy"
          decoding="async"
          style={style}
        />
      </picture>
    );
  }

  return null;
};

export default Asset;
