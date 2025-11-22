import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticProps } from 'next';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function I18nTest() {
  const { t } = useTranslation('common');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Internationalization Test</h1>
      <div className="mb-6">
        <LanguageSwitcher />
      </div>
      <p className="text-lg mb-4">{t('welcome')}</p>
      <p className="text-gray-600">{t('description')}</p>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};
