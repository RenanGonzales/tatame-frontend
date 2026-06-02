// src/pages/BuildGamePage.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import CardDisplay from '../components/CardDisplay';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import Divider from '@mui/joy/Divider';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Switch from '@mui/joy/Switch';
import Chip from '@mui/joy/Chip';
import useMediaQuery from '@mui/system/useMediaQuery';

const STANDING_TYPES = ['takedown', 'guard_pass', 'attack'];

const SLOT_TYPES = {
  attack:  ['attack'],
  defense: ['control', 'defense', 'recovery'],
  sweep:   ['sweep'],
};

const STYLES = ['Gi', 'No-Gi', 'MMA'];

function EmptySlot({ onClick }) {
  return (
    <Box onClick={onClick} sx={{
      width: 210, height: 300,
      border: '2px dashed', borderColor: 'neutral.300',
      borderRadius: '10px', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0,
      transition: 'all 0.15s',
      '&:hover': { borderColor: 'primary.400', bgcolor: 'primary.softBg' },
    }}>
      <Typography level="h3" textColor="neutral.400">+</Typography>
    </Box>
  );
}

function MiniCard({ card, deckEntry, isPt, onRemove, positionName, onClickStatus }) {
  const { t } = useTranslation();
  const rusty = deckEntry?.rusty;
  const studying = deckEntry?.studying;

  const statusLabel = rusty
    ? (isPt ? 'Enferrujado' : 'Rusty')
    : studying
    ? (isPt ? 'Estudando' : 'Studying')
    : null;

  const statusColor = rusty ? 'warning' : 'primary';

  return (
    <Box sx={{ position: 'relative', width: 210, height: 300, flexShrink: 0 }}>
      {/* Clickable overlay for status */}
      <Box
        onClick={onClickStatus}
        sx={{
          position: 'absolute', inset: 0, zIndex: 1,
          cursor: 'pointer', borderRadius: '10px',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
        }}
      />
      <Box sx={{ zoom: 0.75, width: 280, height: 400, pointerEvents: 'none' }}>
        <CardDisplay card={card} positionName={positionName} />
      </Box>
      {/* Status badge */}
      {statusLabel && (
        <Box sx={{ position: 'absolute', top: 6, left: 6, zIndex: 2 }}>
          <Chip size="sm" color={statusColor} variant="solid" sx={{ fontSize: '9px' }}>
            {statusLabel}
          </Chip>
        </Box>
      )}
      {/* Remove button */}
      <Button size="sm" variant="soft" color="danger"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        sx={{
          position: 'absolute', bottom: 6, right: 6, zIndex: 2,
          minWidth: 24, height: 24, p: 0,
          borderRadius: '4px', fontSize: '11px', opacity: 0.85,
        }}>✕</Button>
    </Box>
  );
}

function SlotRow({ label, cards, deckEntries, totalSlots, onOpenLibrary, onRemove, onAddSlot, isPt, positionName, onClickStatus }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography level="body-xs" fontWeight="lg" textColor="neutral.500"
        sx={{ mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {Array.from({ length: totalSlots }).map((_, i) => {
          const card = cards[i];
          const entry = card ? deckEntries.find(e => e.id === card.deck_id) : null;
          return card ? (
            <MiniCard key={card.deck_id} card={card} deckEntry={entry}
              isPt={isPt} positionName={positionName}
              onRemove={() => onRemove(card.deck_id)}
              onClickStatus={() => onClickStatus(entry)} />
          ) : (
            <EmptySlot key={`empty-${i}`} onClick={onOpenLibrary} />
          );
        })}
        <Button size="sm" variant="outlined" color="neutral"
          onClick={onAddSlot} sx={{ alignSelf: 'center', height: 36 }}>
          + Slot
        </Button>
      </Box>
    </Box>
  );
}

function PositionAccordion({ pos, perspective, deckEntries, allCards, slotCounts, onOpenLibrary, onRemove, onAddSlot, isPt, posName, t, onClickStatus }) {
  const [expanded, setExpanded] = useState(false);
  const label = perspective === 'top' ? t('build.top') : t('build.bottom');

  const slotTypes = perspective === 'bottom' ? SLOT_TYPES : { attack: SLOT_TYPES.attack, defense: SLOT_TYPES.defense };

  const hasCards = Object.values(slotTypes).some(types =>
    deckEntries.some(e => types.includes(e.card.type) && e.card.position_id === pos.id && e.card.perspective === perspective)
  );

  const getDeckCards = (types) =>
    deckEntries
      .filter(e => types.includes(e.card.type) && e.card.position_id === pos.id && e.card.perspective === perspective)
      .map(e => ({ ...e.card, deck_id: e.id }));

  return (
    <Box sx={{ mb: 1, border: '1px solid', borderColor: expanded ? 'primary.200' : 'divider', borderRadius: 'sm', overflow: 'hidden' }}>
      <Box onClick={() => setExpanded(!expanded)} sx={{
        px: 2, py: 1, cursor: 'pointer',
        bgcolor: expanded ? 'primary.softBg' : 'background.surface',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'background 0.15s',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography level="body-sm" fontWeight="lg">{label}</Typography>
          {hasCards && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.400' }} />}
        </Box>
        <Typography level="body-xs" textColor="neutral.400">{expanded ? '▲' : '▼'}</Typography>
      </Box>

      {expanded && (
        <Box sx={{ p: 2 }}>
          {Object.entries(slotTypes).map(([slotType, types]) => {
            const key = `${pos.id}-${perspective}-${slotType}`;
            const cards = getDeckCards(types);
            const total = Math.max(cards.length + 1, slotCounts[key] || 1);
            const labels = { attack: isPt ? 'Ataque' : 'Attack', defense: isPt ? 'Defesa' : 'Defense', sweep: isPt ? 'Raspagem' : 'Sweep' };
            return (
              <SlotRow
                key={slotType}
                label={labels[slotType]}
                cards={cards}
                deckEntries={deckEntries}
                totalSlots={total}
                onOpenLibrary={() => onOpenLibrary(types, pos.id, perspective, key)}
                onRemove={onRemove}
                onAddSlot={() => onAddSlot(key)}
                isPt={isPt}
                positionName={posName(pos)}
                onClickStatus={onClickStatus}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}

function CollapsiblePosition({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 'md', overflow: 'hidden' }}>
      <Box onClick={() => setOpen(!open)} sx={{
        px: 2, py: 1.5, cursor: 'pointer',
        bgcolor: open ? 'neutral.100' : 'neutral.softBg',
        borderBottom: open ? '1px solid' : 'none',
        borderColor: 'divider',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'background 0.15s',
      }}>
        <Typography level="title-md">{title}</Typography>
        <Typography level="body-sm" textColor="neutral.400">{open ? '▲' : '▼'}</Typography>
      </Box>
      {open && <Box sx={{ p: 2 }}>{children}</Box>}
    </Box>
  );
}

function Section({ title, children, collapsible = false }) {
  const [open, setOpen] = useState(true);
  return (
    <Box sx={{ mb: 4 }}>
      <Box
        onClick={collapsible ? () => setOpen(!open) : undefined}
        sx={{
          px: 2, py: 1, mb: open ? 2 : 0,
          bgcolor: 'primary.700', borderRadius: 'sm',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          cursor: collapsible ? 'pointer' : 'default',
        }}
      >
        <Typography level="title-sm" textColor="#fff" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {title}
        </Typography>
        {collapsible && (
          <Typography level="body-sm" textColor="rgba(255,255,255,0.6)">{open ? '▲' : '▼'}</Typography>
        )}
      </Box>
      {open && children}
    </Box>
  );
}

export default function BuildGamePage() {
  const { t, i18n } = useTranslation();
  const isPt = i18n.language.startsWith('pt');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [games, setGames]               = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [positions, setPositions]       = useState([]);
  const [allCards, setAllCards]         = useState([]);
  const [deckEntries, setDeckEntries]   = useState([]);
  const [slotCounts, setSlotCounts]     = useState({});

  const [libraryOpen, setLibraryOpen]   = useState(false);
  const [librarySlot, setLibrarySlot]   = useState(null);
  const [libraryCards, setLibraryCards] = useState([]);
  const [adding, setAdding]             = useState(false);

  const [statusModal, setStatusModal]   = useState(false);
  const [statusEntry, setStatusEntry]   = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);

  const [saveModal, setSaveModal]       = useState(false);
  const [gameName, setGameName]         = useState('');
  const [gameStyle, setGameStyle]       = useState('Gi');
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);

  useEffect(() => {
    api.get('/games/').then(r => {
      setGames(r.data);
      if (r.data.length > 0) setSelectedGame(r.data[0]);
    });
    loadPositionsAndCards();
  }, []);

  useEffect(() => {
    if (selectedGame) loadDeck();
  }, [selectedGame]);

  const loadPositionsAndCards = async () => {
    const posRes = await api.get('/positions/');
    setPositions(posRes.data);
    const all = await Promise.all(
      posRes.data.map(p => api.get(`/positions/${p.id}/cards/`).then(r => r.data))
    );
    setAllCards(all.flat());
  };

  const loadDeck = async () => {
    if (!selectedGame) return;
    const res = await api.get(`/deck/${selectedGame.id}`);
    setDeckEntries(res.data);
  };

  const posName = (pos) => isPt ? pos.name_pt : pos.name_en;

  const getStandingCards = () =>
    deckEntries
      .filter(e => STANDING_TYPES.includes(e.card.type))
      .map(e => ({ ...e.card, deck_id: e.id }));

  const openLibrary = (types, positionId, perspective, key) => {
    const inDeck = deckEntries.map(e => e.card_id);
    const available = allCards.filter(c =>
      types.includes(c.type) &&
      (!positionId || c.position_id === positionId) &&
      (!perspective || c.perspective === perspective || c.perspective === 'neutral') &&
      !inDeck.includes(c.id)
    );
    setLibrarySlot({ types, positionId, perspective, key });
    setLibraryCards(available);
    setLibraryOpen(true);
  };

  const handleAddCard = async (card) => {
    if (!selectedGame || !librarySlot || adding) return;
    setAdding(true);
    try {
      await api.post('/deck/', { card_id: card.id, game_id: selectedGame.id, slot_order: 0 });
      await loadDeck();
      setLibraryOpen(false);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (deckId) => {
    await api.delete(`/deck/${deckId}`);
    await loadDeck();
  };

  const handleClickStatus = (entry) => {
    setStatusEntry({ ...entry });
    setStatusModal(true);
  };

  const handleSaveStatus = async () => {
    if (!statusEntry) return;
    setStatusSaving(true);
    try {
      await api.patch(`/deck/${statusEntry.id}`, {
        rusty: statusEntry.rusty,
        studying: statusEntry.studying,
      });
      await loadDeck();
      setStatusModal(false);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleSave = async () => {
    if (!gameName.trim()) return;
    setSaving(true);
    try {
      const fullName = `${gameName} (${gameStyle})`;
      if (selectedGame) {
        await api.put(`/games/${selectedGame.id}`, { name: fullName });
        const r = await api.get('/games/');
        setGames(r.data);
        setSelectedGame(r.data.find(g => g.id === selectedGame.id));
      } else {
        const res = await api.post('/games/', { name: fullName });
        setSelectedGame(res.data);
      }
      setSaved(true);
      setSaveModal(false);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const addSlot = (key) => setSlotCounts(prev => ({ ...prev, [key]: (prev[key] || 1) + 1 }));

  const standingCards = getStandingCards();
  const standingTotal = Math.max(standingCards.length + 1, slotCounts['standing'] || 1);
  const guardPositions = positions.filter(p => p.hierarchy_level === 2);
  const dominantPositions = positions.filter(p => p.hierarchy_level === 4);
  const passPositions = positions.filter(p => p.hierarchy_level === 3);
  const cols = isMobile ? 1 : 3;

  const accordionProps = (pos, perspective) => ({
    pos, perspective, deckEntries, allCards, slotCounts,
    onOpenLibrary: openLibrary, onRemove: handleRemove,
    onAddSlot: addSlot, isPt, posName, t,
    onClickStatus: handleClickStatus,
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography level="h3">{t('nav.build_game')}</Typography>
      </Box>

      {/* Em Pé */}
      <Section title={t('build.standing')} collapsible>
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 'md', p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {standingCards.map(card => {
              const pos = positions.find(p => p.id === card.position_id);
              const entry = deckEntries.find(e => e.id === card.deck_id);
              return (
                <MiniCard key={card.deck_id} card={card} deckEntry={entry} isPt={isPt}
                  positionName={pos ? posName(pos) : ''}
                  onRemove={() => handleRemove(card.deck_id)}
                  onClickStatus={() => handleClickStatus(entry)} />
              );
            })}
            {Array.from({ length: standingTotal - standingCards.length }).map((_, i) => (
              <EmptySlot key={`empty-${i}`} onClick={() => openLibrary(STANDING_TYPES, null, 'neutral', 'standing')} />
            ))}
            <Button size="sm" variant="outlined" color="neutral"
              onClick={() => addSlot('standing')} sx={{ alignSelf: 'center', height: 36 }}>
              + Slot
            </Button>
          </Box>
        </Box>
      </Section>

      {/* Passagem de Guarda */}
      <Section title={t('build.guard_pass')} collapsible>
        {passPositions.map(pos => (
          <CollapsiblePosition key={pos.id} title={posName(pos)}>
            <PositionAccordion {...accordionProps(pos, 'top')} />
            <PositionAccordion {...accordionProps(pos, 'bottom')} />
          </CollapsiblePosition>
        ))}
      </Section>

      {/* Guarda */}
      <Section title={t('build.guard')} collapsible>
        {guardPositions.map(pos => (
          <CollapsiblePosition key={pos.id} title={posName(pos)}>
            <PositionAccordion {...accordionProps(pos, 'top')} />
            <PositionAccordion {...accordionProps(pos, 'bottom')} />
          </CollapsiblePosition>
        ))}
      </Section>

      {/* Posições de Controle */}
      <Section title={t('build.control')} collapsible>
        {dominantPositions.map(pos => (
          <CollapsiblePosition key={pos.id} title={posName(pos)}>
            <PositionAccordion {...accordionProps(pos, 'top')} />
            <PositionAccordion {...accordionProps(pos, 'bottom')} />
          </CollapsiblePosition>
        ))}
      </Section>

      {/* Salvar */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, mb: 6 }}>
        <Button size="lg" color={saved ? 'success' : 'primary'}
          onClick={() => setSaveModal(true)} sx={{ minWidth: 160 }}>
          {saved ? t('build.saved') : t('build.save_game')}
        </Button>
      </Box>

      {/* Modal Status */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)}>
        <ModalDialog sx={{ maxWidth: 360 }}>
          <ModalClose />
          <Typography level="h4">
            {statusEntry ? (isPt ? statusEntry.card?.name_pt : statusEntry.card?.name_en) : ''}
          </Typography>
          <Divider sx={{ my: 1 }} />
          {statusEntry && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography level="body-sm">{isPt ? 'Estudando' : 'Studying'}</Typography>
                <Switch
                  checked={statusEntry.studying}
                  onChange={e => setStatusEntry(prev => ({ ...prev, studying: e.target.checked, rusty: e.target.checked ? false : prev.rusty }))}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography level="body-sm">{isPt ? 'Enferrujado' : 'Rusty'}</Typography>
                <Switch
                  checked={statusEntry.rusty}
                  onChange={e => setStatusEntry(prev => ({ ...prev, rusty: e.target.checked, studying: e.target.checked ? false : prev.studying }))}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
                <Button variant="plain" color="neutral" onClick={() => setStatusModal(false)}>
                  {t('common.cancel')}
                </Button>
                <Button loading={statusSaving} onClick={handleSaveStatus}>
                  {t('common.save')}
                </Button>
              </Box>
            </Box>
          )}
        </ModalDialog>
      </Modal>

      {/* Modal Salvar */}
      <Modal open={saveModal} onClose={() => setSaveModal(false)}>
        <ModalDialog sx={{ maxWidth: 400 }}>
          <ModalClose />
          <Typography level="h4">{t('build.save_game')}</Typography>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl>
              <FormLabel>{t('build.game_name')}</FormLabel>
              <Input value={gameName} onChange={e => setGameName(e.target.value)}
                placeholder={t('build.game_name_placeholder')} />
            </FormControl>
            <FormControl>
              <FormLabel>{t('build.style')}</FormLabel>
              <Select value={gameStyle} onChange={(_, v) => setGameStyle(v)}>
                {STYLES.map(s => <Option key={s} value={s}>{s}</Option>)}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="plain" color="neutral" onClick={() => setSaveModal(false)}>
                {t('common.cancel')}
              </Button>
              <Button loading={saving} onClick={handleSave} disabled={!gameName.trim()}>
                {t('common.save')}
              </Button>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>

      {/* Biblioteca de Cartas */}
      <Modal open={libraryOpen} onClose={() => setLibraryOpen(false)}>
        <ModalDialog sx={{ width: '95vw', maxWidth: 900, maxHeight: '85vh', overflow: 'auto' }}>
          <ModalClose />
          <Typography level="h4">{t('build.select_card')}</Typography>
          <Divider sx={{ my: 1 }} />
          {libraryCards.length === 0 ? (
            <Typography level="body-sm" textColor="neutral.400" sx={{ py: 2 }}>
              {t('build.no_cards')}
            </Typography>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2, mt: 1 }}>
              {libraryCards.map(card => {
                const pos = positions.find(p => p.id === card.position_id);
                return (
                  <Box key={card.id} onClick={() => handleAddCard(card)}
                    sx={{ cursor: 'pointer', transition: 'transform 0.15s', '&:hover': { transform: 'scale(1.02)' } }}>
                    <CardDisplay card={card} positionName={pos ? posName(pos) : ''} />
                  </Box>
                );
              })}
            </Box>
          )}
        </ModalDialog>
      </Modal>
    </Box>
  );
}