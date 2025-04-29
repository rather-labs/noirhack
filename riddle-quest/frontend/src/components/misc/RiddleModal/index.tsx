import { useEffect, useState } from 'react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { ModalContainer } from '../../ui/Modal';
import { stringToAscii } from '../../../utils/stringToAscii';
import { useSubmitProof } from './hooks/useSubmitProof';
import { ConnectWallet } from '../ConnectWallet';

export const RiddleModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [answer, setAnswer] = useState('');
  const { submit, status, error } = useSubmitProof();

  const handleSubmit = async () => {
    try {
      const guess = stringToAscii(answer);
      const res = await submit(guess);

      console.log(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    console.log(status);

    if (error) {
      console.log(error);
    }
  }, [error, status]);

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose}>
      <ConnectWallet />
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
