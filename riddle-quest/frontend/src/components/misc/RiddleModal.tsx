// src/components/RiddleModal.tsx
import React, { useState } from "react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { ModalContainer } from "../ui/Modal";
import generate_proof from "../../circuit/generate_proof";
import { string_to_ascii } from "../../utils/string_to_ascii";

export const RiddleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = async () => {
    console.log("Answer submitted:", answer);

    try {
      const guess = string_to_ascii(answer);
      const expected_hash =
        "0x26a9cd878299aae15aa2e27d41fab958fbe7f0730d81e834c5315bdbf3eecb04";

      const proof = await generate_proof(guess, expected_hash);

      console.log(proof);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col space-y-4">
        <p className="text-lg font-medium">
          What has keys but can't open locks?
        </p>

        <Input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer"
        />

        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </ModalContainer>
  );
};
