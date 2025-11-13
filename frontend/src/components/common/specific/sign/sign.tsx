import {
  ContentWrapperShadow,
  ContentWrapperSize,
  HttpErrorMessage,
} from 'common/enums/enums';
import { FC, JSX, SyntheticEvent } from 'common/types/types';
import { ContentWrapper } from 'components/common/common';
import { RBForm } from 'components/external/external';
import { AlternativeRoute as AlternativeRouteProp } from './common/common';
import {
  AlternativeRoute,
  AuthError,
  GoogleButton,
  SubmitButton,
} from './components/components';

import logo from 'assets/img/logo.png';
import styles from './styles.module.scss';

type Props = {
  header: string;
  description: string;
  submitText: string;
  children: JSX.Element | JSX.Element[];
  onSubmit: (e: SyntheticEvent) => void;
  isSubmitDisabled?: boolean;
  alternativeRoute?: AlternativeRouteProp;
  authError?: HttpErrorMessage | null;
};

const Sign: FC<Props> = ({
  header,
  description,
  submitText,
  children,
  onSubmit,
  isSubmitDisabled = false,
  alternativeRoute,
  authError,
}) => {
  return (
    <div className={styles.container}>
      <img src={logo} alt="logo" className={styles.logo}></img>
      <h3>{header}</h3>
      <span>{description}</span>

      <ContentWrapper
        size={ContentWrapperSize.SMALL}
        shadow={ContentWrapperShadow.LIGHT}
      >
        <RBForm className={styles.form}>
          <>
            {!!authError && <AuthError error={authError} />}
            <div className={styles.formFields}>{children}</div>
            <SubmitButton
              isDisabled={isSubmitDisabled}
              onSubmit={onSubmit}
              label={submitText}
            />
            {!!alternativeRoute && (
              <AlternativeRoute
                label={alternativeRoute.label}
                path={alternativeRoute.path}
                linkText={alternativeRoute.linkText}
              />
            )}
            <div className={styles.orSeparator}>
              <hr className={styles.line} />
              <span>or</span>
              <hr className={styles.line} />
            </div>
            <GoogleButton />
          </>
        </RBForm>
      </ContentWrapper>
    </div>
  );
};

export { Sign };
