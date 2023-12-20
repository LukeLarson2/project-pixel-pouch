"use client";

import { FaTimes } from "react-icons/fa";

import "../_stylesheets/changeSub.css";

export default function ChangeSubscription({
  handleShowModal,
}: {
  handleShowModal: (value: boolean) => void;
}) {
  return (
    <div className="change-sub-overlay">
      <div className="change-sub-modal">
        <h1>Change Subscription</h1>
        <FaTimes onClick={() => handleShowModal(false)} />
      </div>
    </div>
  );
}
