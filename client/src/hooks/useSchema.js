import { useState, useCallback } from 'react';
import {
  createDefaultSchema,
  createDefaultEntity,
  createDefaultField,
  createDefaultRelation,
} from '../generators/shared/types.js';

/**
 * useSchema — owns all schema state and exposes clean mutators.
 * The UI components call these; they never touch state directly.
 */
export const useSchema = () => {
  const [schema, setSchema] = useState(createDefaultSchema);

  // ─── Top-level schema fields ─────────────────────────────────────────────

  const setProjectName = useCallback((v) =>
    setSchema((s) => ({ ...s, projectName: v })), []);

  const setPort = useCallback((v) =>
    setSchema((s) => ({ ...s, port: v })), []);

  const setDatabase = useCallback((v) =>
    setSchema((s) => ({ ...s, database: v })), []);

  const setFramework = useCallback((v) =>
    setSchema((s) => ({ ...s, framework: v })), []);

  const setIncludeAuth = useCallback((v) =>
    setSchema((s) => ({ ...s, includeAuth: v })), []);

  // ─── Entity mutations ─────────────────────────────────────────────────────

  const addEntity = useCallback(() => {
    const newEntity = createDefaultEntity();
    setSchema((s) => ({ ...s, entities: [...s.entities, newEntity] }));
    return newEntity.id;
  }, []);

  const removeEntity = useCallback((entityId) =>
    setSchema((s) => ({
      ...s,
      entities: s.entities
        .filter((e) => e.id !== entityId)
        // clean up any relations pointing to removed entity
        .map((e) => ({
          ...e,
          relations: (e.relations || []).filter(
            (r) => r.targetEntity !== (s.entities.find((x) => x.id === entityId)?.name || '')
          ),
        })),
    })), []);

  const updateEntity = useCallback((entityId, key, value) =>
    setSchema((s) => ({
      ...s,
      entities: s.entities.map((e) => (e.id === entityId ? { ...e, [key]: value } : e)),
    })), []);

  // ─── Field mutations ──────────────────────────────────────────────────────

  const addField = useCallback((entityId) => {
    const newField = createDefaultField();
    setSchema((s) => ({
      ...s,
      entities: s.entities.map((e) =>
        e.id === entityId
          ? { ...e, fields: [...e.fields, newField] }
          : e
      ),
    }));
    return newField.id;
  }, []);

  const removeField = useCallback((entityId, fieldId) =>
    setSchema((s) => ({
      ...s,
      entities: s.entities.map((e) =>
        e.id === entityId
          ? { ...e, fields: e.fields.filter((f) => f.id !== fieldId) }
          : e
      ),
    })), []);

  const updateField = useCallback((entityId, fieldId, key, value) =>
    setSchema((s) => ({
      ...s,
      entities: s.entities.map((e) =>
        e.id === entityId
          ? {
              ...e,
              fields: e.fields.map((f) =>
                f.id === fieldId ? { ...f, [key]: value } : f
              ),
            }
          : e
      ),
    })), []);

  // ─── Relation mutations ───────────────────────────────────────────────────

  const addRelation = useCallback((entityId) => {
    const newRelation = createDefaultRelation();
    setSchema((s) => ({
      ...s,
      entities: s.entities.map((e) =>
        e.id === entityId
          ? { ...e, relations: [...(e.relations || []), newRelation] }
          : e
      ),
    }));
    return newRelation.id;
  }, []);

  const removeRelation = useCallback((entityId, relationId) =>
    setSchema((s) => ({
      ...s,
      entities: s.entities.map((e) =>
        e.id === entityId
          ? { ...e, relations: (e.relations || []).filter((r) => r.id !== relationId) }
          : e
      ),
    })), []);

  const updateRelation = useCallback((entityId, relationId, key, value) =>
    setSchema((s) => ({
      ...s,
      entities: s.entities.map((e) =>
        e.id === entityId
          ? {
              ...e,
              relations: (e.relations || []).map((r) =>
                r.id === relationId ? { ...r, [key]: value } : r
              ),
            }
          : e
      ),
    })), []);

  // ─── localStorage persistence ─────────────────────────────────────────────

  const saveTemplate = useCallback((name) => {
    const templates = JSON.parse(localStorage.getItem('bg_templates') || '{}');
    templates[name] = { ...schema, savedAt: new Date().toISOString() };
    localStorage.setItem('bg_templates', JSON.stringify(templates));
    return Object.keys(templates);
  }, [schema]);

  const loadTemplate = useCallback((name) => {
    const templates = JSON.parse(localStorage.getItem('bg_templates') || '{}');
    if (templates[name]) {
      const { savedAt, ...templateSchema } = templates[name];
      setSchema(templateSchema);
    }
    return !!templates[name];
  }, []);

  const deleteTemplate = useCallback((name) => {
    const templates = JSON.parse(localStorage.getItem('bg_templates') || '{}');
    delete templates[name];
    localStorage.setItem('bg_templates', JSON.stringify(templates));
    return Object.keys(templates);
  }, []);

  const listTemplates = useCallback(() => {
    const templates = JSON.parse(localStorage.getItem('bg_templates') || '{}');
    return Object.entries(templates).map(([name, data]) => ({ name, savedAt: data.savedAt }));
  }, []);

  const resetSchema = useCallback(() => setSchema(createDefaultSchema()), []);

  return {
    schema,
    // top-level
    setProjectName,
    setPort,
    setDatabase,
    setFramework,
    setIncludeAuth,
    // entities
    addEntity,
    removeEntity,
    updateEntity,
    // fields
    addField,
    removeField,
    updateField,
    // relations
    addRelation,
    removeRelation,
    updateRelation,
    // templates
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    listTemplates,
    resetSchema,
  };
};
