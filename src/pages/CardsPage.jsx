// src/pages/CardsPage.jsx

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import CardDisplay from '../components/CardDisplay';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Button from '@mui/joy/Button';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import ModalClose from '@mui/joy/ModalClose';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Textarea from '@mui/joy/Textarea';
import Divider from '@mui/joy/Divider';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Card from '@mui/joy/Card';
import useMediaQuery from '@mui/system/useMediaQuery';

const TYPES = ['attack', 'control', 'defense', 'guard_pass', 'recovery', 'sweep', 'takedown'];
const CONTEXTS = ['gi', 'mma', 'nogi'];
const BELTS = ['black', 'blue', 'brown', 'gray', 'green', 'orange', 'purple', 'white', 'yellow'];
const PERSPECTIVES = ['bottom', 'neutral', 'top'];

const TYPE_COLORS = {
  takedown:   'neutral',
  guard_pass: 'primary',
  sweep:      'warning',
  attack:     'danger',
  recovery:   'success',
  control:    'neutral',
  defense:    'success',
};

const EMPTY_FORM = {
  name_en: '', name_pt: '', type: 'attack', context: 'gi',
  minimum_belt: 'white', notes_en: '', notes_pt: '',
  illustration_url: '', position_id: '', perspective: 'neutral',
};

async function autoTranslate(text, from, to) {
  try {
    const res = await fetch(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`
    );
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
  } catch {
    return '';
  }
}

export default function CardsPage() {
  const { t, i18n } = useTranslation();
  const isPt = i18n.language.startsWith('pt');
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [cards, setCards]                         = useState([]);
  const [positions, setPositions]                 = useState([]);
  const [filterPos, setFilterPos]                 = useState('all');
  const [filterPerspective, setFilterPerspective] = useState('all');
  const [filterType, setFilterType]               = useState('all');
  const [loading, setLoading]                     = useState(true);

  const [modalOpen, setModalOpen]     = useState(false);
  const [viewModal, setViewModal]     = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected, setSelected]       = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [translating, setTranslating] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const positionName = (id) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return '—';
    return isPt ? pos.name_pt : pos.name_en;
  };

  useEffect(() => {
    api.get('/positions/').then((posRes) => {
      const sorted = [...posRes.data].sort((a, b) =>
        (isPt ? a.name_pt : a.name_en).localeCompare(isPt ? b.name_pt : b.name_en)
      );
      setPositions(sorted);
      if (sorted.length > 0) fetchCards(sorted);
      setLoading(false);
    });
  }, []);

  const fetchCards = async (pos = positions) => {
    const all = await Promise.all(
      pos.map(p => api.get(`/positions/${p.id}/cards/`).then(r => r.data))
    );
    setCards(all.flat());
  };

  const filteredCards = cards.filter(c => {
    const matchPos   = filterPos === 'all' || c.position_id === Number(filterPos);
    const matchPersp = filterPerspective === 'all' || (c.perspective ?? 'neutral') === filterPerspective;
    const matchType  = filterType === 'all' || c.type === filterType;
    return matchPos && matchPersp && matchType;
  });

  const handleOpenCreate = () => {
    setSelected(null);
    setForm({ ...EMPTY_FORM, position_id: positions[0]?.id || '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (card) => {
    setSelected(card);
    setForm({
      name_en: card.name_en || '', name_pt: card.name_pt || '',
      type: card.type, context: card.context,
      minimum_belt: card.minimum_belt,
      notes_en: card.notes_en || '', notes_pt: card.notes_pt || '',
      illustration_url: card.illustration_url || '',
      position_id: card.position_id,
      perspective: card.perspective || 'neutral',
    });
    setModalOpen(true);
  };

  const handleTranslate = async (sourceField, targetField, sourceLang, targetLang) => {
    if (!form[sourceField]) return;
    setTranslating(true);
    const translated = await autoTranslate(form[sourceField], sourceLang, targetLang);
    set(targetField, translated);
    setTranslating(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name_en: form.name_en, name_pt: form.name_pt,
        type: form.type, context: form.context,
        minimum_belt: form.minimum_belt,
        notes_en: form.notes_en || null,
        notes_pt: form.notes_pt || null,
        illustration_url: form.illustration_url || null,
        perspective: form.perspective,
      };
      if (selected) {
        await api.put(`/positions/${form.position_id}/cards/${selected.id}`, payload);
      } else {
        await api.post(`/positions/${form.position_id}/cards/`, payload);
      }
      await fetchCards();
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await api.delete(`/positions/${selected.position_id}/cards/${selected.id}`);
    await fetchCards();
    setDeleteModal(false);
    setSelected(null);
  };

  if (loading) return <Typography>{t('common.loading')}</Typography>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography level="h3">{t('nav.cards')}</Typography>
        <Button size="sm" onClick={handleOpenCreate}>
          + {t('cards.new_card')}
        </Button>
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Select
          size="sm"
          value={filterPos}
          onChange={(_, v) => setFilterPos(v)}
          sx={{ minWidth: 160 }}
        >
          <Option value="all">{t('cards.all_positions')}</Option>
          {[...positions].sort((a, b) =>
            (isPt ? a.name_pt : a.name_en).localeCompare(isPt ? b.name_pt : b.name_en)
          ).map(p => (
            <Option key={p.id} value={p.id}>
              {isPt ? p.name_pt : p.name_en}
            </Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filterType}
          onChange={(_, v) => setFilterType(v)}
          sx={{ minWidth: 140 }}
        >
          <Option value="all">{t('cards.all_types')}</Option>
          {TYPES.map(type => (
            <Option key={type} value={type}>{t(`types.${type}`)}</Option>
          ))}
        </Select>

        <Select
          size="sm"
          value={filterPerspective}
          onChange={(_, v) => setFilterPerspective(v)}
          sx={{ minWidth: 160 }}
        >
          <Option value="all">{t('cards.all_perspectives')}</Option>
          <Option value="bottom">{t('cards.bottom')}</Option>
          <Option value="neutral">{t('cards.neutral')}</Option>
          <Option value="top">{t('cards.top')}</Option>
        </Select>
      </Box>

      {/* Desktop Table */}
      {!isMobile && (
        <Sheet variant="outlined" sx={{ borderRadius: 'sm', overflow: 'auto' }}>
          <Table hoverRow stickyHeader>
            <thead>
              <tr>
                <th>{t('cards.name')}</th>
                <th>{t('cards.type')}</th>
                <th>{t('cards.position')}</th>
                <th>{t('cards.context')}</th>
                <th>{t('cards.minimum_belt')}</th>
                <th>{t('cards.perspective')}</th>
                <th style={{ width: 120 }}>{t('cards.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <Typography level="body-sm" textColor="neutral.400" sx={{ p: 2 }}>
                      {t('cards.no_cards')}
                    </Typography>
                  </td>
                </tr>
              ) : filteredCards.map(card => (
                <tr key={card.id}>
                  <td>{isPt ? card.name_pt : card.name_en}</td>
                  <td>
                    <Chip size="sm" color={TYPE_COLORS[card.type] || 'neutral'}>
                      {t(`types.${card.type}`)}
                    </Chip>
                  </td>
                  <td>{positionName(card.position_id)}</td>
                  <td>{t(`cards.contexts.${card.context}`)}</td>
                  {console.log(card.context)}
                  <td style={{ textTransform: 'capitalize' }}>{t(`belts.${card.minimum_belt}`)}</td>
                  <td>{t(`cards.${card.perspective ?? 'neutral'}`)}</td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="sm" variant="plain" color="neutral"
                        onClick={() => { setSelected(card); setViewModal(true); }}>
                        👁
                      </IconButton>
                      <IconButton size="sm" variant="plain" color="neutral"
                        onClick={() => handleOpenEdit(card)}>
                        ✎
                      </IconButton>
                      <IconButton size="sm" variant="plain" color="danger"
                        onClick={() => { setSelected(card); setDeleteModal(true); }}>
                        ✕
                      </IconButton>
                    </Box>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>
      )}

      {/* Mobile Cards */}
      {isMobile && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {filteredCards.length === 0 ? (
            <Typography level="body-sm" textColor="neutral.400">
              {t('cards.no_cards')}
            </Typography>
          ) : filteredCards.map(card => (
            <Card key={card.id} variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography level="title-sm">
                    {isPt ? card.name_pt : card.name_en}
                  </Typography>
                  <Typography level="body-xs" textColor="neutral.400">
                    {positionName(card.position_id)} · {t(`cards.${card.perspective ?? 'neutral'}`)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="sm" variant="plain" color="neutral"
                    onClick={() => { setSelected(card); setViewModal(true); }}>
                    👁
                  </IconButton>
                  <IconButton size="sm" variant="plain" color="neutral"
                    onClick={() => handleOpenEdit(card)}>
                    ✎
                  </IconButton>
                  <IconButton size="sm" variant="plain" color="danger"
                    onClick={() => { setSelected(card); setDeleteModal(true); }}>
                    ✕
                  </IconButton>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                <Chip size="sm" color={TYPE_COLORS[card.type] || 'neutral'}>
                  {t(`types.${card.type}`)}
                </Chip>
                <Chip size="sm" variant="outlined">
                  {t(`cards.contexts.${card.context}`)}
                </Chip>
                <Chip size="sm" variant="outlined" sx={{ textTransform: 'capitalize' }}>
                  {t(`belts.${card.minimum_belt}`)}
                </Chip>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalDialog sx={{ width: '100%', maxWidth: 520, overflow: 'auto', maxHeight: '90vh' }}>
          <ModalClose />
          <Typography level="h4">
            {selected ? t('common.edit') : t('cards.new_card')}
          </Typography>
          <Divider />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>

            <FormControl>
              <FormLabel>Name (EN)</FormLabel>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Input sx={{ flex: 1 }} value={form.name_en}
                  onChange={e => set('name_en', e.target.value)}
                  placeholder="e.g. Triangle Choke" />
                <Button size="sm" variant="outlined" color="neutral"
                  loading={translating}
                  onClick={() => handleTranslate('name_en', 'name_pt', 'en', 'pt')}>
                  PT →
                </Button>
              </Box>
            </FormControl>

            <FormControl>
              <FormLabel>Nome (PT)</FormLabel>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Input sx={{ flex: 1 }} value={form.name_pt}
                  onChange={e => set('name_pt', e.target.value)}
                  placeholder="ex: Triângulo" />
                <Button size="sm" variant="outlined" color="neutral"
                  loading={translating}
                  onClick={() => handleTranslate('name_pt', 'name_en', 'pt', 'en')}>
                  EN →
                </Button>
              </Box>
            </FormControl>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl>
                <FormLabel>{t('cards.type')}</FormLabel>
                <Select value={form.type} onChange={(_, v) => set('type', v)}>
                  {TYPES.map(type => (
                    <Option key={type} value={type}>{t(`types.${type}`)}</Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t('cards.position')}</FormLabel>
                <Select value={form.position_id} onChange={(_, v) => set('position_id', v)}>
                  {[...positions].sort((a, b) =>
                    (isPt ? a.name_pt : a.name_en).localeCompare(isPt ? b.name_pt : b.name_en)
                  ).map(p => (
                    <Option key={p.id} value={p.id}>
                      {isPt ? p.name_pt : p.name_en}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
              <FormControl>
                <FormLabel>{t('cards.context')}</FormLabel>
                <Select value={form.context} onChange={(_, v) => set('context', v)}>
                  {CONTEXTS.map(c => (
                    <Option key={c} value={c}>{t(`cards.contexts.${c}`)}</Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t('cards.minimum_belt')}</FormLabel>
                <Select value={form.minimum_belt} onChange={(_, v) => set('minimum_belt', v)}>
                  {BELTS.map(b => (
                    <Option key={b} value={b} sx={{ textTransform: 'capitalize' }}>
                      {t(`belts.${b}`)}
                    </Option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t('cards.perspective')}</FormLabel>
                <Select value={form.perspective} onChange={(_, v) => set('perspective', v)}>
                  {PERSPECTIVES.map(p => (
                    <Option key={p} value={p}>{t(`cards.${p}`)}</Option>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <FormControl>
              <FormLabel>Notes (EN)</FormLabel>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Textarea sx={{ flex: 1 }} minRows={2} value={form.notes_en}
                  onChange={e => set('notes_en', e.target.value)} />
                <Button size="sm" variant="outlined" color="neutral"
                  loading={translating}
                  onClick={() => handleTranslate('notes_en', 'notes_pt', 'en', 'pt')}>
                  PT →
                </Button>
              </Box>
            </FormControl>

            <FormControl>
              <FormLabel>Observações (PT)</FormLabel>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Textarea sx={{ flex: 1 }} minRows={2} value={form.notes_pt}
                  onChange={e => set('notes_pt', e.target.value)} />
                <Button size="sm" variant="outlined" color="neutral"
                  loading={translating}
                  onClick={() => handleTranslate('notes_pt', 'notes_en', 'pt', 'en')}>
                  EN →
                </Button>
              </Box>
            </FormControl>

            <FormControl>
              <FormLabel>{t('cards.illustration')} (URL)</FormLabel>
              <Input value={form.illustration_url}
                onChange={e => set('illustration_url', e.target.value)}
                placeholder="https://..." />
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="plain" color="neutral" onClick={() => setModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button loading={saving} onClick={handleSave}>
                {t('common.save')}
              </Button>
            </Box>
          </Box>
        </ModalDialog>
      </Modal>

      {/* View Modal */}
      <Modal open={viewModal} onClose={() => setViewModal(false)}>
        <ModalDialog sx={{ background: 'transparent', border: 'none', boxShadow: 'none', p: 0 }}>
          <ModalClose sx={{ color: '#fff', top: -32, right: 0 }} />
          {selected && (
            <CardDisplay
              card={selected}
              positionName={positionName(selected.position_id)}
            />
          )}
        </ModalDialog>
      </Modal>

      {/* Delete Modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)}>
        <ModalDialog variant="outlined" role="alertdialog" sx={{ maxWidth: 400 }}>
          <ModalClose />
          <Typography level="h4">{t('common.delete')}</Typography>
          <Divider />
          <Typography level="body-sm" sx={{ mt: 1 }}>
            {t('cards.confirm_delete')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="plain" color="neutral" onClick={() => setDeleteModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button color="danger" onClick={handleDelete}>
              {t('common.delete')}
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </Box>
  );
}