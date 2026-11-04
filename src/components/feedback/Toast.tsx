import { Button } from "../common/Button";
import { Icon } from "../common/Icon";

interface ToastProps {
  title: string;
  message: string;
  onClose: () => void;
}

export function Toast({ title, message, onClose }: ToastProps) {
  return (
    <div className="success-toast" role="status">
      <div className="toast-icon">
        <Icon name="check" />
      </div>
      <div>
        <strong>{title}</strong>
        <span>{message}</span>
      </div>
      <Button icon="x" label="Cerrar" onClick={onClose} />
    </div>
  );
}
