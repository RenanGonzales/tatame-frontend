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

const TYPES = ['Sweep', 'Attack', 'Recovery', 'Control', 'Defense'];
const CONTEXTS = ['Gi', 'No-Gi', 'MMA'];
const BELTS = ['white', 'gray', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'black'];

const TYPE_COLORS = {
  Sweep:    'warning',
  Attack:   'danger',
  Recovery: 'primary',
  Control:  'neutral',
  Defense:  'success',
};

const EMPTY_FORM = {
  name_en: '', name_pt: '', type: 'Attack', context: 'Gi',
  minimum_belt: 'white', notes_en: '', notes_pt: '',
  illustration_url: '', position_id: '',
};

const LIBRE_TRANSLATE_URL = 'https://libretranslate.com/translate';

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
  const [cards, setCards]         = useState([]);
  const [positions, setPositions] = useState([]);
  const [filterPos, setFilterPos] = useState('all');
  const [loading, setLoading]     = useState(true);

  const [modalOpen, setModalOpen]     = useState(false);
  const [viewModal, setViewModal]     = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected, setSelected]       = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [translating, setTranslating] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const isPt = i18n.language.startsWith('pt');

  const positionName = (id) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return '—';
    return isPt ? pos.name_pt : pos.name_en;
  };

  useEffect(() => {
    api.get('/positions/').then((posRes) => {
      setPositions(posRes.data);
      if (posRes.data.length > 0) fetchCards(posRes.data);
      setLoading(false);
    });
  }, []);

  const fetchCards = async (pos = positions) => {
    const all = await Promise.all(
      pos.map(p => api.get(`/positions/${p.id}/cards/`).then(r => r.data))
    );
    setCards(all.flat());
  };

  const filteredCards = filterPos === 'all'
    ? cards
    : cards.filter(c => c.position_id === Number(filterPos));

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
        notes_en: form.notes_en, notes_pt: form.notes_pt,
        illustration_url: form.illustration_url || null,
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
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Select
            size="sm"
            value={filterPos}
            onChange={(_, v) => setFilterPos(v)}
            sx={{ minWidth: 160 }}
          >
            <Option value="all">{t('cards.all_positions')}</Option>
            {positions.map(p => (
              <Option key={p.id} value={p.id}>
                {isPt ? p.name_pt : p.name_en}
              </Option>
            ))}
          </Select>
          <Button size="sm" onClick={handleOpenCreate}>
            + {t('cards.new_card')}
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <Sheet variant="outlined" sx={{ borderRadius: 'sm', overflow: 'auto' }}>
        <Table hoverRow stickyHeader>
          <thead>
            <tr>
              <th>{t('cards.name')}</th>
              <th>{t('cards.type')}</th>
              <th>{t('cards.position')}</th>
              <th>{t('cards.context')}</th>
              <th>{t('cards.minimum_belt')}</th>
              <th style={{ width: 120 }}>{t('cards.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCards.length === 0 ? (
              <tr>
                <td colSpan={6}>
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
                <td>{card.context}</td>
                <td style={{ textTransform: 'capitalize' }}>{t(`belts.${card.minimum_belt}`)}</td>
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

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalDialog sx={{ width: '100%', maxWidth: 520, overflow: 'auto', maxHeight: '90vh' }}>
          <ModalClose />
          <Typography level="h4">
            {selected ? t('common.edit') : t('cards.new_card')}
          </Typography>
          <Divider />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>

            {/* Name EN */}
            <FormControl>
              <FormLabel>Name (EN)</FormLabel>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Input
                  sx={{ flex: 1 }}
                  value={form.name_en}
                  onChange={e => set('name_en', e.target.value)}
                  placeholder="e.g. Triangle Choke"
                />
                <Button
                  size="sm" variant="outlined" color="neutral"
                  loading={translating}
                  onClick={() => handleTranslate('name_en', 'name_pt', 'en', 'pt')}
                >
                  PT →
                </Button>
              </Box>
            </FormControl>

            {/* Name PT */}
            <FormControl>
              <FormLabel>Nome (PT)</FormLabel>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Input
                  sx={{ flex: 1 }}
                  value={form.name_pt}
                  onChange={e => set('name_pt', e.target.value)}
                  placeholder="ex: Triângulo"
                />
                <Button
                  size="sm" variant="outlined" color="neutral"
                  loading={translating}
                  onClick={() => handleTranslate('name_pt', 'name_en', 'pt', 'en')}
                >
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
                  {positions.map(p => (
                    <Option key={p.id} value={p.id}>
                      {isPt ? p.name_pt : p.name_en}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl>
                <FormLabel>{t('cards.context')}</FormLabel>
                <Select value={form.context} onChange={(_, v) => set('context', v)}>
                  {CONTEXTS.map(c => <Option key={c} value={c}>{c}</Option>)}
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
            </Box>

            {/* Notes EN */}
            <FormControl>
              <FormLabel>Notes (EN)</FormLabel>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Textarea
                  sx={{ flex: 1 }}
                  minRows={2}
                  value={form.notes_en}
                  onChange={e => set('notes_en', e.target.value)}
                />
                <Button
                  size="sm" variant="outlined" color="neutral"
                  loading={translating}
                  onClick={() => handleTranslate('notes_en', 'notes_pt', 'en', 'pt')}
                >
                  PT →
                </Button>
              </Box>
            </FormControl>

            {/* Notes PT */}
            <FormControl>
              <FormLabel>Observações (PT)</FormLabel>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Textarea
                  sx={{ flex: 1 }}
                  minRows={2}
                  value={form.notes_pt}
                  onChange={e => set('notes_pt', e.target.value)}
                />
                <Button
                  size="sm" variant="outlined" color="neutral"
                  loading={translating}
                  onClick={() => handleTranslate('notes_pt', 'notes_en', 'pt', 'en')}
                >
                  EN →
                </Button>
              </Box>
            </FormControl>

            <FormControl>
              <FormLabel>{t('cards.illustration')} (URL)</FormLabel>
              <Input
                value={form.illustration_url}
                onChange={e => set('illustration_url', e.target.value)}
                placeholder="https://..."
              />
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
          {selected && <CardDisplay card={selected} />}
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