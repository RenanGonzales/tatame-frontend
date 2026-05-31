import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Box from '@mui/joy/Box';
import Card from '@mui/joy/Card';
import Typography from '@mui/joy/Typography';
import Input from '@mui/joy/Input';
import Button from '@mui/joy/Button';
import Link from '@mui/joy/Link';
import Alert from '@mui/joy/Alert';
import FormLabel from '@mui/joy/FormLabel';
import FormControl from '@mui/joy/FormControl';
import IconButton from '@mui/joy/IconButton';

export default function LoginPage() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/map');
    } catch {
      setError(t('auth.invalid_credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.body',
      p: 2,
    }}>
      {/* Language toggle */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', gap: 1 }}>
        <Button
          size="sm"
          variant={i18n.language.startsWith('en') ? 'solid' : 'outlined'}
          color="neutral"
          onClick={() => i18n.changeLanguage('en')}
        >
          EN
        </Button>
        <Button
          size="sm"
          variant={i18n.language.startsWith('pt') ? 'solid' : 'outlined'}
          color="neutral"
          onClick={() => i18n.changeLanguage('pt')}
        >
          PT
        </Button>
      </Box>

      <Card sx={{
        width: '100%',
        maxWidth: 400,
        p: { xs: 3, sm: 4 },
        gap: 2,
      }}>
        <Box sx={{ mb: 1 }}>
          <Typography level="h3" fontWeight="xl" textColor="primary.600">
            TATAME
          </Typography>
          <Typography level="body-sm" textColor="neutral.400">
            {t('auth.signin')}
          </Typography>
        </Box>

        {error && <Alert color="danger" size="sm">{error}</Alert>}

        <FormControl>
          <FormLabel>{t('auth.email')}</FormLabel>
          <Input
            type="email"
            value={form.email}
            onChange={e => set('email', e.target.value)}
            placeholder={t('auth.email_placeholder')}
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('auth.password')}</FormLabel>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={e => set('password', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder={t('auth.password_placeholder')}
            endDecorator={
                <Button
                size="sm"
                variant="plain"
                color="neutral"
                onClick={() => setShowPassword(p => !p)}
              >
                {showPassword ? t('auth.hide') : t('auth.show')}
              </Button>
            }
          />
        </FormControl>

        <Button
          fullWidth
          loading={loading}
          onClick={handleSubmit}
        >
          {t('auth.signin')}
        </Button>

        <Typography level="body-sm" textAlign="center">
          {t('auth.no_account')}{' '}
          <Link component={RouterLink} to="/register">{t('auth.signup')}</Link>
        </Typography>
      </Card>
    </Box>
  );
}