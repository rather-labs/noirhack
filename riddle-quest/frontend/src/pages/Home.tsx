import { useState } from "react";
import { RiddleModal } from "../components/misc/RiddleModal";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(true);
  return (
    <>
      {modalOpen && (
        <RiddleModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      )}

      <div className="flex min-h-screen items-center justify-center bg-black">
        <h1 className="text-2xl font-semibold opacity-0">Placeholder</h1>
      </div>
    </>
  );
}
