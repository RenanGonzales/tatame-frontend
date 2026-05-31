import Box from '@mui/joy/Box';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 4,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}