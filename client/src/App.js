import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Download, Zap, Shield, Database, Code,
  Save, FolderOpen, RotateCcw, Eye, EyeOff, Link2, ChevronDown, ChevronUp, Lightbulb, Play
} from 'lucide-react';
import { useSchema } from './hooks/useSchema.js';
import { generateAndDownload, previewFiles } from './generators/orchestrator.js';
import { FIELD_TYPES, RELATION_TYPES } from './generators/shared/types.js';
import { validateProjectName, validateEntityName, validateFieldName, validatePort } from './utils/validation.js';
import { formatError } from './utils/errorMessages.js';
import { useAsync } from './hooks/useAsync.js';
import LoadingSpinner from './components/LoadingSpinner.js';
import InteractiveTour from './components/WelcomeTour.js';
import ExampleSelector from './components/ExampleSelector.js';

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg: '#0c0c14',
  surface: '#13131f',
  surfaceHover: '#1a1a2a',
  surfaceDeep: '#0a0a12',
  border: 'rgba(255,255,255,0.08)',
  borderFocus: '#5b6af0',
  accent: '#5b6af0',
  accentSoft: 'rgba(91,106,240,0.15)',
  accentBorder: 'rgba(91,106,240,0.35)',
  express: '#f7df1e',
  expressSoft: 'rgba(247,223,30,0.15)',
  expressBorder: 'rgba(247,223,30,0.35)',
  nestjs: '#e0234e',
  nestjsSoft: 'rgba(224,35,78,0.15)',
  nestjsBorder: 'rgba(224,35,78,0.35)',
  danger: '#ef4444',
  dangerSoft: 'rgba(239,68,68,0.12)',
  dangerBorder: 'rgba(239,68,68,0.3)',
  success: '#22c55e',
  warn: '#f59e0b',
  warnSoft: 'rgba(245,158,11,0.12)',
  warnBorder: 'rgba(245,158,11,0.3)',
  text: '#e8e8f0',
  textMuted: '#7070a0',
  textDim: '#4a4a70',
};

const frameColor  = (fw) => fw === 'nestjs' ? C.nestjs : C.express;
const frameSoft   = (fw) => fw === 'nestjs' ? C.nestjsSoft : C.expressSoft;
const frameBorder = (fw) => fw === 'nestjs' ? C.nestjsBorder : C.expressBorder;

// ─── Primitives ───────────────────────────────────────────────────────────────

const Label = ({ children }) => (
  <div style={{ fontSize: '0.72rem', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
    {children}
  </div>
);

const ErrorMessage = ({ message }) => (
  message ? (
    <div style={{ 
      fontSize: '0.75rem', 
      color: C.danger, 
      marginTop: '0.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem'
    }}>
      ⚠ {message}
    </div>
  ) : null
);

const Input = ({ style, error, ...props }) => (
  <input
    style={{
      width: '100%', padding: '0.55rem 0.7rem',
      background: 'rgba(0,0,0,0.35)', 
      border: `1px solid ${error ? C.danger : C.border}`,
      borderRadius: '7px', color: C.text, fontSize: '0.875rem',
      fontFamily: '"JetBrains Mono", monospace', boxSizing: 'border-box',
      transition: 'border-color 0.15s', ...style,
    }}
    onFocus={(e) => { 
      e.target.style.borderColor = error ? C.danger : C.borderFocus; 
      props.onFocus && props.onFocus(e); 
    }}
    onBlur={(e)  => { 
      e.target.style.borderColor = error ? C.danger : ((style && style.borderColor) || C.border); 
      props.onBlur  && props.onBlur(e); 
    }}
    {...props}
  />
);

const Select = ({ style, ...props }) => (
  <select
    style={{
      width: '100%', padding: '0.55rem 0.7rem',
      background: '#0f0f1e', border: `1px solid ${C.border}`,
      borderRadius: '7px', color: C.text, fontSize: '0.875rem',
      fontFamily: '"JetBrains Mono", monospace', boxSizing: 'border-box',
      cursor: 'pointer', ...style,
    }}
    {...props}
  />
);

const Chip = ({ active, color, children, onClick }) => (
  <button onClick={onClick} style={{
    padding: '0.3rem 0.85rem', borderRadius: '20px', fontSize: '0.78rem',
    fontFamily: '"JetBrains Mono", monospace', cursor: 'pointer',
    border: `1px solid ${active ? color : C.border}`,
    background: active ? `${color}22` : 'transparent',
    color: active ? color : C.textMuted,
    transition: 'all 0.15s',
  }}>
    {children}
  </button>
);

const Btn = ({ children, variant = 'ghost', color, onClick, disabled, style }) => {
  const base = {
    padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.82rem',
    fontFamily: '"JetBrains Mono", monospace', cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    transition: 'all 0.15s', opacity: disabled ? 0.5 : 1, ...style,
  };
  if (variant === 'solid') return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, background: color, border: 'none', color: '#fff', fontWeight: 600 }}>
      {children}
    </button>
  );
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, background: 'transparent', border: `1px solid ${color || C.border}`, color: color || C.textMuted }}>
      {children}
    </button>
  );
};

const Checkbox = ({ checked, onChange, label }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.78rem', color: C.textMuted, whiteSpace: 'nowrap' }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ cursor: 'pointer', accentColor: C.accent }} />
    {label}
  </label>
);

const SectionDivider = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: '1rem 0 0.75rem' }}>
    <div style={{ height: '1px', flex: 1, background: C.border }} />
    <span style={{ fontSize: '0.68rem', color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
    <div style={{ height: '1px', flex: 1, background: C.border }} />
  </div>
);

// ─── Template Panel ───────────────────────────────────────────────────────────

const TemplatePanel = ({ listTemplates, saveTemplate, loadTemplate, deleteTemplate }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [templates, setTemplates] = useState([]);
  const refresh = () => setTemplates(listTemplates());
  const handleOpen  = () => { setOpen(true); refresh(); };
  const handleSave  = () => { if (!name.trim()) return; saveTemplate(name.trim()); setName(''); refresh(); };

  if (!open) return <Btn onClick={handleOpen} color={C.textMuted}><Save size={14} />Templates</Btn>;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.25rem', minWidth: '260px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.85rem', color: C.text, fontWeight: 600 }}>Templates</span>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <Input placeholder="Template name…" value={name} onChange={(e) => setName(e.target.value)} style={{ flex: 1 }} />
        <Btn variant="solid" color={C.accent} onClick={handleSave}><Save size={13} />Save</Btn>
      </div>
      {templates.length === 0 && <p style={{ fontSize: '0.8rem', color: C.textDim, margin: 0 }}>No saved templates yet.</p>}
      {templates.map((t) => (
        <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0', borderTop: `1px solid ${C.border}` }}>
          <span style={{ flex: 1, fontSize: '0.82rem', color: C.text }}>{t.name}</span>
          <Btn color={C.accent} onClick={() => { loadTemplate(t.name); setOpen(false); }}><FolderOpen size={12} />Load</Btn>
          <Btn color={C.danger} onClick={() => { deleteTemplate(t.name); refresh(); }}><Trash2 size={12} /></Btn>
        </div>
      ))}
    </div>
  );
};

// ─── File Preview ─────────────────────────────────────────────────────────────

const FilePreview = ({ schema }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [files, setFiles] = useState({});

  const handleOpen = () => {
    const f = previewFiles(schema);
    setFiles(f);
    setSelected(Object.keys(f)[0] || null);
    setOpen(true);
  };

  if (!open) return <Btn onClick={handleOpen} color={C.textMuted}><Eye size={14} />Preview files</Btn>;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', overflow: 'hidden', marginTop: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: `1px solid ${C.border}` }}>
        <span style={{ fontSize: '0.85rem', color: C.text, fontWeight: 600 }}>File preview — {Object.keys(files).length} files</span>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: C.textMuted, cursor: 'pointer' }}><EyeOff size={14} /></button>
      </div>
      <div style={{ display: 'flex', height: '420px' }}>
        <div style={{ width: '220px', borderRight: `1px solid ${C.border}`, overflowY: 'auto', padding: '0.5rem' }}>
          {Object.keys(files).map((path) => (
            <div key={path} onClick={() => setSelected(path)} style={{
              padding: '0.3rem 0.5rem', borderRadius: '5px', fontSize: '0.72rem',
              cursor: 'pointer', wordBreak: 'break-all',
              color: selected === path ? C.accent : C.textMuted,
              background: selected === path ? C.accentSoft : 'transparent',
            }}>
              {path}
            </div>
          ))}
        </div>
        <pre style={{ flex: 1, margin: 0, padding: '1rem', overflowY: 'auto', fontSize: '0.72rem', color: C.text, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {selected ? files[selected] : ''}
        </pre>
      </div>
    </div>
  );
};

// ─── Enum Values Editor ───────────────────────────────────────────────────────

const EnumValuesEditor = ({ values = [], onChange }) => {
  const [draft, setDraft] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v)) return;
    onChange([...values, v]);
    setDraft('');
  };

  const addBulk = () => {
    const newValues = bulkInput
      .split(/[,\n]/)
      .map(v => v.trim())
      .filter(v => v && !values.includes(v));
    
    if (newValues.length > 0) {
      onChange([...values, ...newValues]);
      setBulkInput('');
      setShowBulkInput(false);
    }
  };

  const remove = (v) => onChange(values.filter((x) => x !== v));

  const loadPreset = (preset) => {
    const presets = {
      status: ['active', 'inactive', 'pending', 'archived'],
      priority: ['low', 'medium', 'high', 'urgent'],
      role: ['admin', 'user', 'moderator', 'guest'],
      size: ['small', 'medium', 'large', 'extra-large'],
      color: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
      category: ['electronics', 'clothing', 'books', 'home', 'sports'],
      orderStatus: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      userType: ['customer', 'vendor', 'admin', 'support'],
      visibility: ['public', 'private', 'restricted', 'draft']
    };
    
    const presetValues = presets[preset] || [];
    const newValues = presetValues.filter(v => !values.includes(v));
    if (newValues.length > 0) {
      onChange([...values, ...newValues]);
    }
  };

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <Label>Enum values</Label>
        <button
          onClick={() => setShowBulkInput(!showBulkInput)}
          style={{
            background: 'none',
            border: `1px solid ${C.border}`,
            borderRadius: '4px',
            color: C.textMuted,
            cursor: 'pointer',
            fontSize: '0.7rem',
            padding: '0.2rem 0.4rem'
          }}
        >
          {showBulkInput ? 'Single' : 'Bulk Add'}
        </button>
      </div>

      {!showBulkInput ? (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
          <Input
            placeholder="add value…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            style={{ flex: 1 }}
          />
          <Btn color={C.accent} onClick={add}><Plus size={13} />Add</Btn>
        </div>
      ) : (
        <div style={{ marginBottom: '0.4rem' }}>
          <textarea
            placeholder="Enter multiple values separated by commas or new lines&#10;Example: active, inactive, pending"
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '0.5rem',
              background: 'rgba(0,0,0,0.35)',
              border: `1px solid ${C.border}`,
              borderRadius: '7px',
              color: C.text,
              fontSize: '0.8rem',
              fontFamily: '"JetBrains Mono", monospace',
              resize: 'vertical',
              marginBottom: '0.4rem'
            }}
          />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <Btn color={C.accent} onClick={addBulk}>Add All</Btn>
            <Btn color={C.textMuted} onClick={() => setShowBulkInput(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      {/* Preset buttons */}
      <div style={{ marginBottom: '0.5rem' }}>
        <Label style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>Quick presets:</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {['status', 'priority', 'role', 'size', 'color', 'orderStatus'].map((preset) => (
            <button
              key={preset}
              onClick={() => loadPreset(preset)}
              style={{
                background: 'none',
                border: `1px solid ${C.border}`,
                borderRadius: '12px',
                color: C.textMuted,
                cursor: 'pointer',
                fontSize: '0.65rem',
                padding: '0.15rem 0.4rem',
                textTransform: 'capitalize'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = C.accent;
                e.currentTarget.style.color = C.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = C.textMuted;
              }}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {values.length === 0 && (
        <p style={{ fontSize: '0.72rem', color: C.textDim, margin: 0 }}>
          No values yet — add values manually, use bulk input, or try a preset.
        </p>
      )}
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
        {values.map((v) => (
          <span key={v} style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            padding: '0.2rem 0.55rem', background: C.accentSoft, border: `1px solid ${C.accentBorder}`,
            borderRadius: '20px', fontSize: '0.72rem', color: C.accent,
          }}>
            {v}
            <button onClick={() => remove(v)} style={{ background: 'none', border: 'none', color: C.accent, cursor: 'pointer', padding: 0, lineHeight: 1, fontSize: '0.85rem' }}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── Advanced Validation Editor ───────────────────────────────────────────────

const ValidationEditor = ({ field, entityId, updateField }) => {
  const [open, setOpen] = useState(false);
  const { type } = field;
  const hasStringValidation = ['string', 'email', 'password', 'uuid'].includes(type);
  const hasNumberValidation = type === 'number';
  const hasRegex           = ['string', 'email'].includes(type);
  const hasEnum            = type === 'enum';
  if (!hasStringValidation && !hasNumberValidation && !hasEnum) return null;

  const hasAnyValidation = (
    (field.minLength !== '' && field.minLength !== undefined) ||
    (field.maxLength !== '' && field.maxLength !== undefined) ||
    (field.min !== '' && field.min !== undefined) ||
    (field.max !== '' && field.max !== undefined) ||
    (field.regex) ||
    (hasEnum && (field.enumValues || []).length > 0)
  );

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          background: 'none', border: `1px solid ${hasAnyValidation ? C.warnBorder : C.border}`,
          borderRadius: '6px', color: hasAnyValidation ? C.warn : C.textDim,
          cursor: 'pointer', fontSize: '0.7rem', padding: '0.25rem 0.55rem',
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        }}
      >
        {open ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        {hasAnyValidation ? '✦ validation' : '+ validation'}
      </button>

      {open && (
        <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: C.surfaceDeep, borderRadius: '7px', border: `1px solid ${C.border}` }}>
          {hasStringValidation && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <Label>Min length</Label>
                <Input type="number" min="0" placeholder="—" value={field.minLength || ''} onChange={(e) => updateField(entityId, field.id, 'minLength', e.target.value)} />
              </div>
              <div>
                <Label>Max length</Label>
                <Input type="number" min="0" placeholder="—" value={field.maxLength || ''} onChange={(e) => updateField(entityId, field.id, 'maxLength', e.target.value)} />
              </div>
            </div>
          )}
          {hasNumberValidation && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <div>
                <Label>Min value</Label>
                <Input type="number" placeholder="—" value={field.min || ''} onChange={(e) => updateField(entityId, field.id, 'min', e.target.value)} />
              </div>
              <div>
                <Label>Max value</Label>
                <Input type="number" placeholder="—" value={field.max || ''} onChange={(e) => updateField(entityId, field.id, 'max', e.target.value)} />
              </div>
            </div>
          )}
          {hasRegex && (
            <div style={{ marginBottom: '0.5rem' }}>
              <Label>Regex pattern</Label>
              <Input placeholder="^[a-z]+$" value={field.regex || ''} onChange={(e) => updateField(entityId, field.id, 'regex', e.target.value)} />
            </div>
          )}
          {hasEnum && (
            <EnumValuesEditor
              values={field.enumValues || []}
              onChange={(vals) => updateField(entityId, field.id, 'enumValues', vals)}
            />
          )}
        </div>
      )}
    </div>
  );
};

// ─── Field Row ────────────────────────────────────────────────────────────────

const FieldRow = React.memo(({ field, entityId, updateField, removeField }) => {
  const [fieldNameError, setFieldNameError] = useState(null);

  const handleFieldNameChange = (value) => {
    const error = validateFieldName(value);
    setFieldNameError(error);
    updateField(entityId, field.id, 'name', value);
  };

  return (
    <div className="field-row" style={{ padding: '0.65rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: `1px solid ${C.border}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr auto auto auto', gap: '0.6rem', alignItems: 'center' }}>
        <div>
          <Input
            placeholder="field name"
            value={field.name}
            onChange={(e) => handleFieldNameChange(e.target.value)}
            error={fieldNameError}
          />
          <ErrorMessage message={fieldNameError} />
        </div>
        <Select value={field.type} onChange={(e) => updateField(entityId, field.id, 'type', e.target.value)}>
          {FIELD_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
        <Checkbox checked={field.required} onChange={(e) => updateField(entityId, field.id, 'required', e.target.checked)} label="req" />
        <Checkbox checked={field.unique}   onChange={(e) => updateField(entityId, field.id, 'unique',   e.target.checked)} label="unique" />
        <button onClick={() => removeField(entityId, field.id)} style={{ background: 'transparent', border: `1px solid ${C.dangerBorder}`, borderRadius: '6px', color: C.danger, cursor: 'pointer', padding: '0.35rem', display: 'flex', alignItems: 'center' }}>
          <Trash2 size={14} />
        </button>
      </div>
      <ValidationEditor field={field} entityId={entityId} updateField={updateField} />
    </div>
  );
});

// ─── Relation Row ─────────────────────────────────────────────────────────────

const RelationRow = ({ relation, entityId, entityName, allEntities, updateRelation, removeRelation }) => {
  const otherEntities = allEntities.filter((e) => e.name && e.name !== entityName);
  const relTypeLabel = {
    'one-to-one':  '1 : 1',
    'one-to-many': '1 : N',
    'many-to-many':'N : N',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1.8fr auto auto', gap: '0.6rem', alignItems: 'center', padding: '0.65rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: `1px solid ${C.warnBorder}` }}>
      {/* relation type */}
      <Select
        value={relation.type}
        onChange={(e) => updateRelation(entityId, relation.id, 'type', e.target.value)}
        style={{ fontSize: '0.78rem' }}
      >
        {RELATION_TYPES.map((t) => (
          <option key={t} value={t}>{relTypeLabel[t]} — {t}</option>
        ))}
      </Select>

      {/* target entity */}
      <Select
        value={relation.targetEntity}
        onChange={(e) => updateRelation(entityId, relation.id, 'targetEntity', e.target.value)}
        style={{ fontSize: '0.78rem', borderColor: relation.targetEntity ? C.border : C.dangerBorder }}
      >
        <option value="">— target entity —</option>
        {otherEntities.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
      </Select>

      {/* field name */}
      <Input
        placeholder={relation.type === 'one-to-one' ? 'e.g. profile' : relation.type === 'one-to-many' ? 'e.g. posts' : 'e.g. roles'}
        value={relation.fieldName}
        onChange={(e) => updateRelation(entityId, relation.id, 'fieldName', e.target.value)}
        style={{ fontSize: '0.78rem' }}
      />

      <Checkbox
        checked={relation.eager}
        onChange={(e) => updateRelation(entityId, relation.id, 'eager', e.target.checked)}
        label="eager"
      />

      <button onClick={() => removeRelation(entityId, relation.id)} style={{ background: 'transparent', border: `1px solid ${C.dangerBorder}`, borderRadius: '6px', color: C.danger, cursor: 'pointer', padding: '0.35rem', display: 'flex', alignItems: 'center' }}>
        <Trash2 size={14} />
      </button>
    </div>
  );
};

// ─── Entity Card ──────────────────────────────────────────────────────────────

const EntityCard = ({
  entity, framework, allEntities,
  updateEntity, removeEntity,
  addField, updateField, removeField,
  addRelation, updateRelation, removeRelation,
}) => {
  const [entityNameError, setEntityNameError] = useState(null);
  const color    = frameColor(framework);
  const relations = entity.relations || [];

  const handleEntityNameChange = (value) => {
    const error = validateEntityName(value);
    setEntityNameError(error);
    updateEntity(entity.id, 'name', value);
  };

  return (
    <div className="entity-card" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '1.5rem', animation: 'fadeUp 0.25s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ flex: 1 }}>
          <Input
            placeholder="EntityName"
            value={entity.name}
            onChange={(e) => handleEntityNameChange(e.target.value)}
            style={{ fontSize: '1rem', fontWeight: 600 }}
            error={entityNameError}
          />
          <ErrorMessage message={entityNameError} />
        </div>
        <Checkbox checked={entity.auth} onChange={(e) => updateEntity(entity.id, 'auth', e.target.checked)}
          label={<><Shield size={12} style={{ verticalAlign: 'middle' }} /> Auth</>}
        />
        <button onClick={() => removeEntity(entity.id)} style={{ background: C.dangerSoft, border: `1px solid ${C.dangerBorder}`, borderRadius: '7px', color: C.danger, cursor: 'pointer', padding: '0.45rem', display: 'flex', alignItems: 'center' }}>
          <Trash2 size={15} />
        </button>
      </div>

      {/* Fields */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <span style={{ fontSize: '0.72rem', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Fields ({entity.fields.length})
        </span>
        <Btn id="add-field-button" color={color} onClick={() => addField(entity.id)}><Plus size={13} />Add field</Btn>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {entity.fields.map((f) => (
          <FieldRow key={f.id} field={f} entityId={entity.id} updateField={updateField} removeField={removeField} />
        ))}
      </div>

      {/* Relations */}
      <SectionDivider label={`Relations (${relations.length})`} />
      {relations.length === 0 && (
        <p style={{ fontSize: '0.75rem', color: C.textDim, margin: '0 0 0.5rem' }}>
          No relations yet. Relations generate foreign keys, populate calls, and join tables automatically.
        </p>
      )}
      {relations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.6rem' }}>
          {/* column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr 1.8fr auto auto', gap: '0.6rem', padding: '0 0.65rem' }}>
            {['Type', 'Target entity', 'Field name on this entity', 'Eager', ''].map((h, i) => (
              <span key={i} style={{ fontSize: '0.65rem', color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
            ))}
          </div>
          {relations.map((r) => (
            <RelationRow
              key={r.id} relation={r} entityId={entity.id} entityName={entity.name}
              allEntities={allEntities}
              updateRelation={updateRelation}
              removeRelation={removeRelation}
            />
          ))}
        </div>
      )}
      <Btn color={C.warn} onClick={() => addRelation(entity.id)} style={{ marginTop: relations.length > 0 ? '0.25rem' : 0 }}>
        <Link2 size={13} />Add relation
      </Btn>
    </div>
  );
};

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const hook = useSchema();
  const { schema } = hook;
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [showInteractiveTour, setShowInteractiveTour] = useState(false);
  const [showExampleSelector, setShowExampleSelector] = useState(false);
  const color  = frameColor(schema.framework);
  const soft   = frameSoft(schema.framework);
  const border = frameBorder(schema.framework);

  // Check if user is new (first time visiting)
  useEffect(() => {
    const hasVisited = localStorage.getItem('bg_has_visited');
    if (!hasVisited) {
      setShowInteractiveTour(true);
      localStorage.setItem('bg_has_visited', 'true');
    }
  }, []);

  // Validation helpers
  const validateField = (field, value) => {
    switch (field) {
      case 'projectName':
        return validateProjectName(value);
      case 'port':
        return validatePort(value);
      default:
        return null;
    }
  };

  const handleFieldChange = (field, value, callback) => {
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));
    callback(value);
  };

  const { execute: executeGeneration, loading: generationLoading } = useAsync(generateAndDownload);

  const handleGenerate = async () => {
    if (!schema.projectName || schema.entities.length === 0) return;
    
    try {
      const result = await executeGeneration(schema);
      if (!result.success) {
        const formattedError = formatError(result.error);
        setError(`${formattedError.message}. ${formattedError.suggestion}`);
      } else {
        setError(null);
      }
    } catch (err) {
      const formattedError = formatError(err);
      setError(`${formattedError.message}. ${formattedError.suggestion}`);
    }
  };

  const handleLoadExample = (exampleSchema) => {
    // Reset validation errors
    setValidationErrors({});
    setError(null);
    
    // Save the example as a template and load it
    const templateName = `example_${Date.now()}`;
    localStorage.setItem('bg_templates', JSON.stringify({
      [templateName]: exampleSchema
    }));
    
    // Load the template
    hook.loadTemplate(templateName);
    
    // Clean up the temporary template
    setTimeout(() => {
      const templates = JSON.parse(localStorage.getItem('bg_templates') || '{}');
      delete templates[templateName];
      localStorage.setItem('bg_templates', JSON.stringify(templates));
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: '"JetBrains Mono", monospace', padding: '2.5rem 1.5rem' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        input, select, button, textarea { font-family: inherit; }
        input:focus, select:focus { outline: 2px solid ${C.accent}; outline-offset: 1px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a40; border-radius: 3px; }
        
        /* Tour library styles */
        .tour-mask {
          background-color: rgba(0, 0, 0, 0.7) !important;
        }
        .tour-popover {
          font-family: "JetBrains Mono", monospace !important;
        }
        [data-tour-elem="badge"] {
          background-color: #5b6af0 !important;
          color: #fff !important;
          font-weight: 600 !important;
          font-size: 0.75rem !important;
        }
        [data-tour-elem="controls"] {
          display: none !important;
        }
      `}</style>

      <div style={{ maxWidth: '980px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 1.5rem', background: soft, border: `1px solid ${border}`, borderRadius: '40px', marginBottom: '1rem' }}>
            <Zap size={20} color={color} />
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontFamily: '"Syne", sans-serif', fontWeight: 800, color }}>
              Backend Generator
            </h1>
          </div>
          <p style={{ color: C.textMuted, margin: '0 0 1rem', fontSize: '0.9rem' }}>
            Create production-ready APIs in minutes, not hours
          </p>
          
          {/* Quick Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowInteractiveTour(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: '20px',
                color: C.textMuted,
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.color = color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = C.textMuted;
              }}
            >
              <Play size={14} />
              How it Works
            </button>
            
            <button
              onClick={() => setShowExampleSelector(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'transparent',
                border: `1px solid ${C.border}`,
                borderRadius: '20px',
                color: C.textMuted,
                cursor: 'pointer',
                fontSize: '0.8rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = color;
                e.currentTarget.style.color = color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = C.border;
                e.currentTarget.style.color = C.textMuted;
              }}
            >
              <Lightbulb size={14} />
              Try Examples
            </button>
          </div>
        </div>

        {/* Config card */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <Code size={18} color={color} />
            <h2 style={{ margin: 0, fontSize: '1rem', color, fontWeight: 600 }}>Project Setup</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Label>Project name</Label>
              </div>
              <Input 
                id="project-name-input"
                value={schema.projectName} 
                onChange={(e) => handleFieldChange('projectName', e.target.value, hook.setProjectName)} 
                placeholder="my-awesome-api"
                error={validationErrors.projectName}
              />
              <ErrorMessage message={validationErrors.projectName} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Label>Port</Label>
              </div>
              <Input 
                value={schema.port} 
                onChange={(e) => handleFieldChange('port', e.target.value, hook.setPort)} 
                placeholder="3000"
                error={validationErrors.port}
              />
              <ErrorMessage message={validationErrors.port} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Label><Database size={12} style={{ verticalAlign: 'middle' }} /> Database</Label>
              </div>
              <Select id="database-selector" value={schema.database} onChange={(e) => hook.setDatabase(e.target.value)}>
                <option value="mongodb">MongoDB</option>
                <option value="postgresql">PostgreSQL</option>
              </Select>
            </div>
          </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Label>Framework</Label>
              </div>
              <div id="framework-selector" style={{ display: 'flex', gap: '0.5rem' }}>
                <Chip active={schema.framework === 'express'} color={C.express} onClick={() => hook.setFramework('express')}>⚡ Express</Chip>
                <Chip active={schema.framework === 'nestjs'} color={C.nestjs}  onClick={() => hook.setFramework('nestjs')}>🦅 NestJS</Chip>
              </div>
            </div>
        </div>

        {/* Entities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {schema.entities.map((entity) => (
            <EntityCard
              key={entity.id}
              entity={entity}
              framework={schema.framework}
              allEntities={schema.entities}
              updateEntity={hook.updateEntity}
              removeEntity={hook.removeEntity}
              addField={hook.addField}
              updateField={hook.updateField}
              removeField={hook.removeField}
              addRelation={hook.addRelation}
              updateRelation={hook.updateRelation}
              removeRelation={hook.removeRelation}
            />
          ))}
        </div>

        {/* Add entity */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            id="add-entity-button"
            onClick={hook.addEntity}
            style={{
              width: '100%', padding: '1rem', background: 'transparent',
              border: `1px dashed ${C.border}`, borderRadius: '12px',
              color: C.textMuted, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', fontSize: '0.85rem', transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textMuted; }}
          >
            <Plus size={16} /> Add Your First Entity
          </button>
          
          {schema.entities.length === 0 && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: 'rgba(91,106,240,0.05)', 
              border: '1px solid rgba(91,106,240,0.2)', 
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Lightbulb size={16} color="#5b6af0" />
                <strong style={{ color: '#5b6af0', fontSize: '0.9rem' }}>What's an Entity?</strong>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#a0a0c0', lineHeight: '1.5' }}>
                Think of entities as the main "things" in your app. For a blog, you'd have <strong>User</strong>, <strong>Post</strong>, and <strong>Comment</strong> entities. 
                Each entity becomes a database table with its own API endpoints.
              </p>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
          <TemplatePanel
            listTemplates={hook.listTemplates}
            saveTemplate={hook.saveTemplate}
            loadTemplate={hook.loadTemplate}
            deleteTemplate={hook.deleteTemplate}
          />
          <Btn color={C.textMuted} onClick={hook.resetSchema}><RotateCcw size={14} />Reset</Btn>
        </div>

        {/* File preview */}
        {schema.entities.length > 0 && schema.projectName && (
          <FilePreview schema={schema} />
        )}

        {/* Generate button */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          {error && <p style={{ color: C.danger, fontSize: '0.85rem', marginBottom: '0.75rem' }}>{error}</p>}
          {schema.entities.length === 0 && (
            <p style={{ color: C.textMuted, fontSize: '0.82rem', marginBottom: '0.75rem' }}>Add at least one entity to generate.</p>
          )}
          <button
            id="generate-button"
            onClick={handleGenerate}
            disabled={generationLoading || !schema.projectName || schema.entities.length === 0 || validationErrors.projectName || validationErrors.port}
            style={{
              padding: '0.9rem 2.5rem', borderRadius: '10px', border: 'none',
              cursor: generationLoading ? 'not-allowed' : 'pointer',
              background: generationLoading ? '#2a2a40' : `linear-gradient(135deg, ${color}, ${color}cc)`,
              color: '#fff', fontSize: '1rem', fontWeight: 700, fontFamily: '"Syne", sans-serif',
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              opacity: (!schema.projectName || schema.entities.length === 0 || validationErrors.projectName || validationErrors.port) ? 0.4 : 1,
              transition: 'opacity 0.2s, transform 0.15s',
              boxShadow: generationLoading ? 'none' : `0 0 24px ${color}44`,
            }}
            onMouseEnter={(e) => { if (!generationLoading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {generationLoading ? (
              <>
                <LoadingSpinner size={20} color="#fff" />
                Generating…
              </>
            ) : (
              <>
                <Download size={20} />
                Download {schema.framework === 'nestjs' ? 'NestJS' : 'Express'} project
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: C.textDim, fontSize: '0.75rem', marginTop: '3rem' }}>
          Generate production-ready APIs instantly · No coding required · Just download and deploy
        </p>
      </div>

      {/* Modals */}
      {showInteractiveTour && (
        <InteractiveTour 
          isActive={showInteractiveTour}
          onComplete={() => setShowInteractiveTour(false)}
          onSkip={() => setShowInteractiveTour(false)}
        />
      )}
      
      {showExampleSelector && (
        <ExampleSelector 
          onSelectExample={handleLoadExample}
          onClose={() => setShowExampleSelector(false)} 
        />
      )}
    </div>
  );
}
