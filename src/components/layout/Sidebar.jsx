// src/components/layout/Sidebar.jsx

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import Button from '@mui/joy/Button';
import Drawer from '@mui/joy/Drawer';
import IconButton from '@mui/joy/IconButton';
import useMediaQuery from '@mui/system/useMediaQuery';

const BELT_COLORS = {
  white:  '#f0f0f0',
  gray:   '#9e9e9e',
  yellow: '#f9c74f',
  orange: '#f4845f',
  green:  '#4caf50',
  blue:   '#1565c0',
  purple: '#9c27b0',
  brown:  '#795548',
  black:  '#212121',
};

function BeltDisplay({ belt, stripes, name }) {
  const { t } = useTranslation();
  const color = BELT_COLORS[belt] || '#ccc';
  const isLight = ['white', 'yellow'].includes(belt);

  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      <Typography level="body-sm" fontWeight="lg" sx={{ mb: 0.75 }}>
        {name}
      </Typography>
      <Box sx={{
        display: 'flex', alignItems: 'center', height: 18,
        borderRadius: '3px', overflow: 'hidden', width: '100%', maxWidth: 160,
        border: '1px solid', borderColor: isLight ? '#ccc' : 'transparent',
      }}>
        <Box sx={{ flex: 1, height: '100%', bgcolor: color }} />
        <Box sx={{
          width: 48, height: '100%', bgcolor: '#111', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
          gap: '4px', px: '6px',
        }}>
          {Array.from({ length: stripes }).map((_, i) => (
            <Box key={i} sx={{ width: 5, height: '65%', bgcolor: '#fff', borderRadius: '1px', opacity: 0.9 }} />
          ))}
        </Box>
      </Box>
      <Typography level="body-xs" textColor="neutral.400" sx={{ mt: 0.5, textTransform: 'capitalize' }}>
        {t('nav.belt')} {t(`belts.${belt}`)} · {stripes} {stripes === 1 ? t('nav.stripe') : t('nav.stripes')}
      </Typography>
    </Box>
  );
}

function NavList({ onNavigate, onCollapse }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const MENU_ITEMS = [
    { label: t('nav.map'),           path: '/map'       },
    { label: t('nav.positions'),     path: '/positions' },
    { label: t('nav.build_game'),    path: '/build'     },
    { label: t('nav.my_game'),       path: '/my-game'   },
    { label: t('nav.favorites'),     path: '/favorites' },
    { label: t('nav.post_training'), path: '/training'  },
    { label: t('nav.history'),       path: '/history'   },
    { label: t('nav.cards'),         path: '/cards'     },
    { label: t('nav.profile'),       path: '/profile'   },
  ];

  const handleNav = (path) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2, gap: 1 }}>
      <Box sx={{ py: 1, px: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography level="h4" fontWeight="xl" textColor="primary.600">
            TATAME
          </Typography>
          <Typography level="body-xs" textColor="neutral.400">
            {t('nav.subtitle')}
          </Typography>
        </Box>
        {onCollapse && (
          <IconButton size="sm" variant="plain" color="neutral" onClick={onCollapse} sx={{ mt: 0.5 }}>
            ←
          </IconButton>
        )}
      </Box>

      <Divider />
      <BeltDisplay belt={user?.belt} stripes={user?.stripes} name={user?.name} />
      <Divider />

      <List size="sm" sx={{ flex: 1, gap: 0.5 }}>
        {MENU_ITEMS.map((item) => (
          <ListItem key={item.path}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNav(item.path)}
              sx={{ borderRadius: 'sm' }}
            >
              {item.label}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      <Button variant="plain" color="neutral" size="sm" onClick={logout}>
        {t('nav.logout')}
      </Button>
    </Box>
  );
}

export default function Sidebar({ onCollapse, collapsed }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 1280px)');

  if (isMobile) {
    return (
      <>
        <Box sx={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 56, bgcolor: 'background.surface',
          borderBottom: '1px solid', borderColor: 'divider',
          display: 'flex', alignItems: 'center', px: 2,
          zIndex: 1000,
        }}>
          <Button
            variant="plain" color="neutral"
            onClick={() => setDrawerOpen(true)}
            sx={{ fontSize: '22px', minWidth: 'auto', px: 1 }}
          >
            ☰
          </Button>
          <Typography level="h4" fontWeight="xl" textColor="primary.600" sx={{ ml: 1 }}>
            TATAME
          </Typography>
        </Box>

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} size="sm">
          <NavList onNavigate={() => setDrawerOpen(false)} />
        </Drawer>
      </>
    );
  }

  return (
    <Box sx={{
      width: 220, height: '100vh',
      borderRight: '1px solid', borderColor: 'divider',
      flexShrink: 0,
    }}>
      <NavList onCollapse={onCollapse} />
    </Box>
  );
}