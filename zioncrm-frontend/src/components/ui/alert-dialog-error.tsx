import * as React from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger } from "./alert-dialog";
import { Button } from './button';
import ReactDOM from "react-dom/client";
import { OctagonAlert } from "lucide-react";

interface AlertDialogErrorProps {
  title: string;
  content: string;
  onOk: () => void;
}

const AlertDialogError = ({ title, content, onOk }: AlertDialogErrorProps) => {
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
              <OctagonAlert className="text-red-600"/>
              {content}
            </div>
          </AlertDialogDescription> 
          <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
            <AlertDialogCancel asChild className="text-white-600">
              <Button variant="default" onClick={() => onOk()}>Ok</Button>
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

// export default AlertDialogError;

export function showErrorAlert(
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

  root.render(<AlertDialogError
            title={title}
            content={content}
            onOk={() => onOk()}
          />);
}
