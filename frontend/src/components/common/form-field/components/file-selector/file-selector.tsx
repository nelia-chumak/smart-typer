import { FormFieldType } from 'common/enums/enums';
import {
  FC,
  FieldError,
  RefObject,
  UseFormRegisterReturn,
} from 'common/types/types';
import { RBForm } from 'components/external/external';

type Props = {
  placeholder?: string;
  register?: Partial<UseFormRegisterReturn>;
  error?: FieldError;
  className?: string;
  value?: string;
  readOnly: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
  hidden?: boolean;
};

const FileSelector: FC<Props> = ({
  placeholder,
  register,
  error,
  className,
  readOnly,
  value,
  hidden,
  inputRef,
}) => (
  <RBForm.Control
    {...register}
    type={FormFieldType.FILE}
    placeholder={placeholder}
    isInvalid={!!error}
    className={className}
    readOnly={readOnly}
    value={value}
    hidden={hidden}
    ref={inputRef}
  />
);

export { FileSelector };
