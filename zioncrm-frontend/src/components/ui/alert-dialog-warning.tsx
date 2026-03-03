import * as React from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger } from "./alert-dialog";
import { Button } from './button';
import ReactDOM from "react-dom/client";
import { TriangleAlert } from "lucide-react";

interface AlertDialogWarningProps {
  title: string;
  content: string;
  onOk: () => void;
}

const AlertDialogWarning = ({ title, content, onOk }: AlertDialogWarningProps) => {
	return (
    <AlertDialog open={true}>
      <AlertDialogPortal>
        <AlertDialogOverlay/>
        <AlertDialogContent style={{
          backgroundColor: 'var(--theme-card)',
          borderColor: 'var(--theme-border)'
        }}>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription><div style={{ display: "flex", gap: 25, justifyContent: "flex-start" }}>
              <TriangleAlert className="text-orange-600"/>
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

// export default AlertDialogWarning;

export function showWarningAlert(
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

  root.render(<AlertDialogWarning
            title={title}
            content={content}
            onOk={() => onOk()}
          />);
}
