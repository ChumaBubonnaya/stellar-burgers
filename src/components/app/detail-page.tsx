import { clsx } from 'clsx';

import styles from './detail-page.module.css';

export const DetailPage = ({
  children,
  title,
}: {
  children: React.JSX.Element;
  title?: string;
}): React.JSX.Element => (
  <main className={styles.detailPageWrap}>
    {title && (
      <h1 className={clsx(styles.detailHeader, 'text text_type_main-large mb-6')}>
        {title}
      </h1>
    )}
    {children}
  </main>
);
