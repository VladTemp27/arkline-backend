import React, { useState } from "react";
import ModalEmail from "./ModalEmail";
import SubmitAlert from "./SubmitAlert";
import ModalSubmittedList from "./ModalSubmittedList";
import Navbar from "../layout/Navbar/Navbar";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitAlertOpen, setIsSubmitAlertOpen] = useState(false);
  const [isSubmittedListOpen, setIsSubmittedListOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const submitTicket = (data) => {
    console.log("Ticket Submitted", data);
    setIsModalOpen(false);
    setIsSubmitAlertOpen(true);

    setTimeout(() => {
      setIsSubmitAlertOpen(false);
    }, 1500);
  };

  return (
    <div className="app">
      <Navbar />

      <div className="center-content pt-[48px]">
        <h1 className="title">NOAH Ticket ark</h1>

        <button className="create-button" onClick={openModal}>
          Create a Ticket
        </button>

        <button className="btnhistory" onClick={() => setIsHistoryOpen(true)}>
          Ticket History
        </button>
      </div>

      {isModalOpen && (
        <ModalEmail onClose={closeModal} onSubmit={submitTicket} />
      )}

      {isSubmitAlertOpen && (
        <SubmitAlert
          className="transition-opacity duration-500 opacity-100"
          onClose={() => setIsSubmitAlertOpen(false)}
        />
      )}

      {isSubmittedListOpen && (
        <ModalSubmittedList onClose={() => setIsSubmittedListOpen(false)} />
      )}

      {isHistoryOpen && (
        <ModalSubmittedList onClose={() => setIsHistoryOpen(false)} />
      )}
    </div>
  );
}
