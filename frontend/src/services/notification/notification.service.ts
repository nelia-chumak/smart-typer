import { NotificationMessage } from 'common/enums/enums';
import { toast } from 'react-toastify';

class Notification {
  public error(message: string): void {
    toast.error(message);
  }

  public success(message: NotificationMessage): void {
    toast.success(message);
  }

  public warning(message: NotificationMessage): void {
    toast.warn(message);
  }

  public info(message: NotificationMessage): void {
    toast.info(message);
  }
}

export { Notification };
