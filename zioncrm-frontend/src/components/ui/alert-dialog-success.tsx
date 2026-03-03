import * as React from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger } from "./alert-dialog";
import { Button } from './button';
import ReactDOM from "react-dom/client";
import { CircleCheckBig, TriangleAlert } from "lucide-react";

interface AlertDialogSuccessProps {
  title: string;
  content: string;
  onOk: () => void;
}

const AlertDialogSuccess = ({ title, content, onOk }: AlertDialogSuccessProps) => {
	return (
    <AlertDialog open={true}>
      <AlertDialogPortal>
        <AlertDialogOverlay/>
        <AlertDialogContent style={{
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border)'
        }}>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            <div style={{ display: "flex", gap: 25, justifyContent: "flex-start" }}>
              <CircleCheckBig className="text-green-600"/>
              {content}
            </div>  
          </AlertDialogDescription>
          <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
            <AlertDialogCancel asChild className="text-white-600">
              <Button onClick={() => onOk()}>Ok</Button>
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};


export function showSuccessAlert(
  title: string,
  content: string,
  closeOk?: (result?: any) => void,
) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);

  const onOk = () => {
    root.unmount();
    container.remove();
    if (closeOk) {
      closeOk();
    }
  };

  root.render(<AlertDialogSuccess
            title={title}
            content={content}
            onOk={() => onOk()}
          />);
}
