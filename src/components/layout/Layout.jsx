// src/components/layout/Layout.jsx

import Box from '@mui/joy/Box';
import useMediaQuery from '@mui/system/useMediaQuery';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />

      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 4,
          mt: { xs: '56px', lg: 0 },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}