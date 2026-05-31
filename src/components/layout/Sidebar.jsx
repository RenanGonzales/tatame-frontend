import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import Typography from '@mui/joy/Typography';
import Box from '@mui/joy/Box';
import Divider from '@mui/joy/Divider';
import Button from '@mui/joy/Button';

const MENU_ITEMS = [
  { label: 'Map',           path: '/map'       },
  { label: 'Positions',     path: '/positions' },
  { label: 'Build Game',    path: '/build'     },
  { label: 'My Game',       path: '/my-game'   },
  { label: 'Favorites',     path: '/favorites' },
  { label: 'Post Training', path: '/training'  },
  { label: 'History',       path: '/history'   },
  { label: 'Profile',       path: '/profile'   },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <Box sx={{
      width: 220,
      height: '100vh',
      borderRight: '1px solid',
      borderColor: 'divider',
      display: 'flex',
      flexDirection: 'column',
      p: 2,
      gap: 1,
    }}>
      <Box sx={{ py: 1, px: 1 }}>
        <Typography level="h4" fontWeight="xl" textColor="primary.600">
          TATAME
        </Typography>
        <Typography level="body-xs" textColor="neutral.400">
          BJJ Game Mapping
        </Typography>
      </Box>

      <Divider />

      <Box sx={{ px: 1, py: 0.5 }}>
        <Typography level="body-sm" fontWeight="lg">{user?.name}</Typography>
        <Typography level="body-xs" textColor="neutral.400" sx={{ textTransform: 'capitalize' }}>
          {user?.belt} belt · {user?.stripes} {user?.stripes === 1 ? 'stripe' : 'stripes'}
        </Typography>
      </Box>

      <Divider />

      <List size="sm" sx={{ flex: 1, gap: 0.5 }}>
        {MENU_ITEMS.map((item) => (
          <ListItem key={item.path}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{ borderRadius: 'sm' }}
            >
              {item.label}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      <Button
        variant="plain"
        color="neutral"
        size="sm"
        onClick={logout}
      >
        Logout
      </Button>
    </Box>
  );
}