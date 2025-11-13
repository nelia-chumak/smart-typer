import { AppRoute } from 'common/enums/enums';
import { FC, JSX } from 'common/types/types';
import { RRDLink } from 'components/external/external';

type Props = {
  to: AppRoute;
  children: JSX.Element | JSX.Element[];
  className?: string;
};

const Link: FC<Props> = ({ children, to, className, ...props }) => (
  <RRDLink to={to} className={className} {...props}>
    {children}
  </RRDLink>
);

export { Link };
