import * as React from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger } from "./alert-dialog";
import { Button } from './button';
import ReactDOM from "react-dom/client";
import { MessageCircleQuestion } from 'lucide-react';

interface AlertDialogQuestionProps {
  title: string;
  content: string;
  onYes: () => void;
  onNo: () => void;
}

const AlertDialogQuestion = ({ title, content, onYes, onNo }: AlertDialogQuestionProps) => {
	return (
    <AlertDialog open={true}>
      <AlertDialogPortal>
        <AlertDialogOverlay/>
        <AlertDialogContent style={{
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border)'
        }}>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogHeader><MessageCircleQuestion  className="text-blue-600"/></AlertDialogHeader>
          <AlertDialogDescription>
            <div style={{ display: "flex", gap: 25, justifyContent: "flex-start" }}>
              <MessageCircleQuestion  className="text-blue-600"/>
              {content}
            </div>
          </AlertDialogDescription>
          <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
            <AlertDialogCancel asChild className="text-black-600">
              <Button onClick={() => onNo()}>Não</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={() => onYes()}>Sim</Button>
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

// export default AlertDialogQuestion;

export function showQuestionAlert(
  title: string,
  content: string,
  valueId: number,
  closeNo?: (result?: any) => void,
  closeYes?: (result?: any) => void,
) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);

  const handleYes = () => {
    root.unmount();
    container.remove();
    if (closeYes) {
      closeYes(valueId);
    }
  };

  const handleNo = () => {
    root.unmount();
    container.remove();
    if (closeNo) {
      closeNo();
    }
  };

  root.render(<AlertDialogQuestion
            title={title}
            content={content}
            onNo={() => handleNo()}
            onYes={() => handleYes()}
          />);
}

