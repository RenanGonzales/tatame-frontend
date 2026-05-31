// src/components/CardDisplay.jsx

import { useTranslation } from 'react-i18next';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';

const TYPE_PALETTE = {
  takedown:   { bg: '#e8f5e9', border: '#2e7d32', header: '#1b5e20', text: '#003300' },
  guard_pass: { bg: '#e3f2fd', border: '#1565c0', header: '#0d47a1', text: '#00244a' },
  sweep:      { bg: '#fff8e1', border: '#f9a825', header: '#f57f17', text: '#4a3000' },
  attack:     { bg: '#ffebee', border: '#c62828', header: '#b71c1c', text: '#4a0000' },
  recovery:   { bg: '#f3e5f5', border: '#6a1b9a', header: '#4a148c', text: '#1a0030' },
  control:    { bg: '#e0f2f1', border: '#00695c', header: '#004d40', text: '#001a17' },
  defense:    { bg: '#fce4ec', border: '#880e4f', header: '#560027', text: '#1a0010' },
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

export default function CardDisplay({ card, positionName }) {
  const { t, i18n } = useTranslation();
  const isPt = i18n.language.startsWith('pt');
  const palette = TYPE_PALETTE[card.type] || TYPE_PALETTE.Control;
  const beltColor = BELT_COLORS[card.minimum_belt] || '#ccc';
  const isLightBelt = ['white', 'yellow'].includes(card.minimum_belt);

  const name = isPt ? card.name_pt : card.name_en;
  const notes = isPt ? card.notes_pt : card.notes_en;

  return (
    <Box sx={{
      width: 280,
      minHeight: 400,
      borderRadius: '10px',
      border: `3px solid ${palette.border}`,
      background: palette.bg,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: `0 4px 20px ${palette.border}44`,
      userSelect: 'none',
    }}>

      {/* Header — name + belt dot */}
      <Box sx={{
        bgcolor: palette.header,
        px: 1.5, py: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Typography
          level="title-sm"
          sx={{ color: '#fff', fontWeight: 700, fontSize: 14, letterSpacing: 0.3 }}
        >
          {name}
        </Typography>
        <Box sx={{
          width: 14, height: 14,
          borderRadius: '50%',
          bgcolor: beltColor,
          border: isLightBelt ? '1px solid #aaa' : 'none',
          flexShrink: 0,
        }} />
      </Box>

      {/* Position bar */}
      <Box sx={{
        px: 1.5, py: 0.6,
        bgcolor: palette.header + 'cc',
        borderBottom: `1px solid ${palette.border}33`,
      }}>
        <Typography level="body-xs" sx={{
          color: '#fff', fontWeight: 700,
          fontSize: 10, textTransform: 'uppercase', letterSpacing: 1,
          opacity: 0.85,
        }}>
          {positionName || '—'}
        </Typography>
      </Box>

      {/* Illustration */}
      <Box sx={{
        width: '100%',
        height: 180,
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
            alt={name}
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
        <Typography level="body-xs" sx={{
          color: palette.text, fontWeight: 700,
          fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8,
        }}>
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
          sx={{
            color: palette.text, opacity: 0.8,
            fontSize: 11, lineHeight: 1.5,
            fontStyle: notes ? 'normal' : 'italic',
          }}
        >
          {notes || '—'}
        </Typography>
      </Box>
    </Box>
  );
}