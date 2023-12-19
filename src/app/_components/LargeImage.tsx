'use client'

import { FaTimes } from "react-icons/fa";

export default function LargeImage({imageUrl, handleView}: {
  imageUrl: string;
  handleView: (arg: boolean) => void;
}) {

  return (
    <div className="large-image-overlay">
      <div className="large-image-modal">
        <FaTimes className="large-modal-close" onClick={() => handleView(false)} />
        <div className="large-image" style={{backgroundImage: `url(${imageUrl})`}} />
      </div>
    </div>
  )
}