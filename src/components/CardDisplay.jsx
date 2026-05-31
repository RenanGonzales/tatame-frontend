// src/components/CardDisplay.jsx

import { useTranslation } from 'react-i18next';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';

const TYPE_PALETTE = {
  Sweep:    { bg: '#fff8e1', border: '#f9a825', header: '#f57f17', text: '#4a3000' },
  Attack:   { bg: '#ffebee', border: '#c62828', header: '#b71c1c', text: '#4a0000' },
  Recovery: { bg: '#e3f2fd', border: '#1565c0', header: '#0d47a1', text: '#00244a' },
  Control:  { bg: '#f3e5f5', border: '#6a1b9a', header: '#4a148c', text: '#1a0030' },
  Defense:  { bg: '#e8f5e9', border: '#2e7d32', header: '#1b5e20', text: '#003300' },
};

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

export default function CardDisplay({ card }) {
  const { t } = useTranslation();
  const palette = TYPE_PALETTE[card.type] || TYPE_PALETTE.Control;
  const beltColor = BELT_COLORS[card.minimum_belt] || '#ccc';
  const isLightBelt = ['white', 'yellow'].includes(card.minimum_belt);

  return (
    <Box sx={{
      width: 240,
      minHeight: 340,
      borderRadius: '10px',
      border: `3px solid ${palette.border}`,
      background: palette.bg,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: `0 4px 20px ${palette.border}44`,
      userSelect: 'none',
    }}>

      {/* Header */}
      <Box sx={{
        bgcolor: palette.header,
        px: 1.5, py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Typography
          level="title-sm"
          sx={{ color: '#fff', fontWeight: 700, fontSize: 13, letterSpacing: 0.3 }}
        >
          {card.name}
        </Typography>
        {/* Belt dot */}
        <Box sx={{
          width: 14, height: 14,
          borderRadius: '50%',
          bgcolor: beltColor,
          border: isLightBelt ? '1px solid #aaa' : 'none',
          flexShrink: 0,
        }} />
      </Box>

      {/* Illustration */}
      <Box sx={{
        width: '100%',
        height: 150,
        bgcolor: palette.border + '22',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: `2px solid ${palette.border}44`,
      }}>
        {card.illustration_url ? (
          <img
            src={card.illustration_url}
            alt={card.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Typography level="body-xs" sx={{ color: palette.border, opacity: 0.5 }}>
            {t('cards.no_illustration')}
          </Typography>
        )}
      </Box>

      {/* Type + Context bar */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 1.5, py: 0.75,
        bgcolor: palette.border + '18',
        borderBottom: `1px solid ${palette.border}33`,
      }}>
        <Typography level="body-xs" sx={{ color: palette.text, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
          {t(`types.${card.type}`)}
        </Typography>
        <Typography level="body-xs" sx={{ color: palette.text, fontSize: 10, opacity: 0.7 }}>
          {card.context}
        </Typography>
      </Box>

      {/* Notes */}
      <Box sx={{ flex: 1, px: 1.5, py: 1 }}>
        <Typography
          level="body-xs"
          sx={{ color: palette.text, opacity: 0.8, fontSize: 11, lineHeight: 1.5, fontStyle: card.notes ? 'normal' : 'italic' }}
        >
          {card.notes || '—'}
        </Typography>
      </Box>

      {/* Footer — belt + status */}
      <Box sx={{
        px: 1.5, py: 1,
        bgcolor: palette.border + '18',
        borderTop: `1px solid ${palette.border}33`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Mini belt */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          height: 12,
          borderRadius: '2px',
          overflow: 'hidden',
          width: 60,
          border: isLightBelt ? '1px solid #ccc' : 'none',
        }}>
          <Box sx={{ flex: 1, height: '100%', bgcolor: beltColor }} />
          <Box sx={{
            width: 18, height: '100%',
            bgcolor: '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
            gap: '2px', px: '3px',
          }}>
            {Array.from({ length: card.stripes || 0 }).map((_, i) => (
              <Box key={i} sx={{ width: 3, height: '65%', bgcolor: '#fff', borderRadius: '1px' }} />
            ))}
          </Box>
        </Box>

        {/* Status badges */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {card.rusty && (
            <Box sx={{
              fontSize: 9, px: 0.75, py: 0.25,
              bgcolor: '#f57f17', color: '#fff',
              borderRadius: '3px', fontWeight: 700,
              letterSpacing: 0.5, textTransform: 'uppercase',
            }}>
              {t('cards.rusty')}
            </Box>
          )}
          {card.studying && (
            <Box sx={{
              fontSize: 9, px: 0.75, py: 0.25,
              bgcolor: '#1565c0', color: '#fff',
              borderRadius: '3px', fontWeight: 700,
              letterSpacing: 0.5, textTransform: 'uppercase',
            }}>
              {t('cards.studying')}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}