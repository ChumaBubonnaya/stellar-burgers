import {
  Input,
  Button,
  PasswordInput,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';

import type { RegisterUIProps } from './type';

import styles from '../common.module.css';

export const RegisterUI = ({
  pending = false,
  errorText,
  email,
  setEmail,
  handleSubmit,
  password,
  setPassword,
  userName,
  setUserName,
}: RegisterUIProps): React.JSX.Element => (
  <main className={styles.container}>
    <div className={clsx('pt-6', styles.wrapCenter)}>
      <h3 className="pb-6 text text_type_main-medium">Регистрация</h3>
      <form
        className={clsx('pb-15', styles.form)}
        name="register"
        onSubmit={handleSubmit}
      >
        <fieldset disabled={pending} className={styles.fields}>
          <>
            <div className="pb-6">
              <Input
                required
                type="text"
                placeholder="Имя"
                onChange={(e) => setUserName(e.target.value)}
                value={userName}
                name="name"
                error={false}
                errorText=""
                size="default"
              />
            </div>
            <div className="pb-6">
              <Input
                required
                type="email"
                placeholder="E-mail"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                name={'email'}
                error={false}
                errorText=""
                size={'default'}
              />
            </div>
            <div className="pb-6">
              <PasswordInput
                required
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                name="password"
              />
            </div>
            <div className={clsx('pb-6', styles.button)}>
              <Button type="primary" size="medium" htmlType="submit">
                Зарегистрироваться
              </Button>
            </div>
            {pending && (
              <p role="status" className="text text_type_main-default">
                Загрузка…
              </p>
            )}
            {errorText && (
              <p className={clsx(styles.error, 'text text_type_main-default pb-6')}>
                {errorText}
              </p>
            )}
          </>
        </fieldset>
      </form>
      <div className={clsx(styles.question, 'text text_type_main-default pb-6')}>
        Уже зарегистрированы?
        <Link to="/login" className={clsx('pl-2', styles.link)}>
          Войти
        </Link>
      </div>
    </div>
  </main>
);
