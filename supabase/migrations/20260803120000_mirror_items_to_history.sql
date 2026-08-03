-- Mirror an item's reusable "template" fields into its list-scoped history rows
-- so item suggestions/reuse always reflect the item's latest version.
--
-- history previously stored only name + image_url. This widens it to also carry
-- category, store_id, quantity, price, unit, note, and installs a trigger that
-- keeps those columns in sync whenever an item is EDITED.
--
-- Design notes:
--   * The trigger fires on UPDATE only, never INSERT. Inserts stay app-driven
--     (the client writes the history row when an item is added). If the trigger
--     also inserted, every add from an older, un-updated iOS build — which still
--     calls the client-side history insert — would create a duplicate row. An
--     UPDATE-only trigger syncs edits from every client (old or new, since it is
--     server-side) with no duplicate risk.
--   * Only reusable template fields are mirrored. Transient/structural columns
--     (is_checked, checked_at, reminder_sent_at, parent_item_id, created_by,
--     due_date, recurrence_rule, reminder_days_before, rsvp_status) are excluded.
--   * CONVENTION: when a reusable column is added to `items`, add it here (both
--     the columns below and the trigger's column list + UPDATE OF list) so
--     history stays a faithful mirror. See docs/memory/history-mirrors-items.md.

ALTER TABLE history ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE history ADD COLUMN IF NOT EXISTS store_id uuid REFERENCES stores(id) ON DELETE SET NULL;
ALTER TABLE history ADD COLUMN IF NOT EXISTS quantity integer;
ALTER TABLE history ADD COLUMN IF NOT EXISTS price numeric;
ALTER TABLE history ADD COLUMN IF NOT EXISTS unit text;
ALTER TABLE history ADD COLUMN IF NOT EXISTS note text;

-- Backfill the new columns from the most recent matching top-level item.
UPDATE history h SET
  category = i.category,
  store_id = i.store_id,
  quantity = i.quantity,
  price = i.price,
  unit = i.unit,
  note = i.note,
  image_url = COALESCE(h.image_url, i.image_url)
FROM (
  SELECT DISTINCT ON (list_id, name)
    list_id, name, category, store_id, quantity, price, unit, note, image_url
  FROM items
  WHERE parent_item_id IS NULL
  ORDER BY list_id, name, added_at DESC
) i
WHERE h.list_id = i.list_id AND h.name = i.name;

-- Trigger: on an item edit, mirror its template fields onto the list's matching
-- history rows. Handles rename precisely via OLD.name -> NEW.name.
CREATE OR REPLACE FUNCTION sync_item_to_history()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Sub-items never appear as suggestions, so they have no history to sync.
  IF NEW.parent_item_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF OLD.name IS DISTINCT FROM NEW.name THEN
    -- Rename: re-point the old-name rows and refresh every mirrored field.
    UPDATE history SET
      name = NEW.name,
      image_url = NEW.image_url,
      category = NEW.category,
      store_id = NEW.store_id,
      quantity = NEW.quantity,
      price = NEW.price,
      unit = NEW.unit,
      note = NEW.note
    WHERE list_id = NEW.list_id AND name = OLD.name;
  ELSE
    UPDATE history SET
      image_url = NEW.image_url,
      category = NEW.category,
      store_id = NEW.store_id,
      quantity = NEW.quantity,
      price = NEW.price,
      unit = NEW.unit,
      note = NEW.note
    WHERE list_id = NEW.list_id AND name = NEW.name;
  END IF;

  RETURN NEW;
END;
$$;

-- UPDATE OF <cols> so plain check-off toggles (is_checked) don't fire the sync.
DROP TRIGGER IF EXISTS trg_sync_item_to_history ON items;
CREATE TRIGGER trg_sync_item_to_history
AFTER UPDATE OF name, image_url, category, store_id, quantity, price, unit, note ON items
FOR EACH ROW
EXECUTE FUNCTION sync_item_to_history();
