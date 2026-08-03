import React, { useState } from 'react';

export default function ImageThumb({ src, alt }) {
  const [broken, setBroken] = useState(!src);

  if (broken) {
    return <div className="thumb-fallback">No image</div>;
  }

  return <img src={src} alt={alt} onError={() => setBroken(true)} />;
}
