import { IOption } from 'common/interfaces/interfaces';
import { JSX } from 'common/types/external/external';
import { ReactSelect } from 'components/external/external';

import { VoidCallback } from 'common/types/types';
import { getStyles } from './get-styles';

type Props<T> = {
  options: readonly IOption<T>[];
  value: IOption<T>;
  onChange: VoidCallback<IOption<T>>;
  placeholder?: string;
};

const Select = <T extends unknown>({
  options,
  value,
  onChange,
  placeholder,
}: Props<T>): JSX.Element => {
  const handleChange = (newValue: unknown): void => {
    if (newValue && !Array.isArray(newValue)) {
      onChange(newValue as IOption<T>);
    }
  };
  return (
    <ReactSelect
      options={options}
      value={value}
      onChange={handleChange}
      styles={getStyles()}
      placeholder={placeholder}
    />
  );
};

export { Select };
