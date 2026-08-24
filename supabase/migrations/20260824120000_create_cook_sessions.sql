-- Cook log: track each time a recipe is cooked.
--
-- cook_sessions is one "cook" of a recipe (started_at .. completed_at, null
-- completed_at = still in progress). cook_session_steps is a SNAPSHOT of the
-- recipe's steps taken when the cook starts — deliberately NOT a FK to
-- recipe_steps, because both clients save step edits destructively
-- (delete-all + reinsert), so recipe_steps.id is unstable and a FK would
-- cascade-wipe progress and history on any recipe edit. The snapshot also
-- keeps history honest: a past cook shows the steps as they were cooked.
--
-- recipes.cook_count / last_cooked_at are denormalized and maintained by a
-- recount trigger (same converging pattern as recipe_count_triggers).

-- ============================================================================
-- TABLES
-- ============================================================================

CREATE TABLE cook_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id uuid REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  started_at timestamptz DEFAULT now() NOT NULL,
  completed_at timestamptz,
  current_step int DEFAULT 0 NOT NULL,
  notes text
);

CREATE TABLE cook_session_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES cook_sessions(id) ON DELETE CASCADE NOT NULL,
  sort_order int DEFAULT 0 NOT NULL,
  instruction text NOT NULL,
  completed_at timestamptz
);

ALTER TABLE recipes ADD COLUMN cook_count int DEFAULT 0 NOT NULL;
ALTER TABLE recipes ADD COLUMN last_cooked_at timestamptz;

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_cook_sessions_recipe_id ON cook_sessions(recipe_id);
CREATE INDEX idx_cook_sessions_user_id ON cook_sessions(user_id);
CREATE INDEX idx_cook_session_steps_session_id ON cook_session_steps(session_id);

-- One in-progress cook per user per recipe; finished cooks are unlimited.
CREATE UNIQUE INDEX idx_cook_sessions_one_active
  ON cook_sessions(recipe_id, user_id)
  WHERE completed_at IS NULL;

-- ============================================================================
-- HELPER: read access to a recipe (mirrors recipes_select_own_or_shared)
-- ============================================================================

CREATE OR REPLACE FUNCTION has_recipe_read_access(recipe_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM recipes
    WHERE id = recipe_uuid
    AND (
      owner_id = auth.uid()
      OR (
        collection_id IS NOT NULL
        AND (
          is_collection_owner(collection_id)
          OR is_collection_shared_with_me(collection_id)
        )
      )
    )
  );
$$;

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE cook_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cook_session_steps ENABLE ROW LEVEL SECURITY;

-- Anyone who can see the recipe can see its cook history (collaborators in a
-- shared collection see each other's cooks); only the cook writes their own.
CREATE POLICY "cook_sessions_select" ON cook_sessions
  FOR SELECT USING (has_recipe_read_access(recipe_id));

CREATE POLICY "cook_sessions_insert" ON cook_sessions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND has_recipe_read_access(recipe_id)
  );

CREATE POLICY "cook_sessions_update" ON cook_sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "cook_sessions_delete" ON cook_sessions
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "cook_session_steps_select" ON cook_session_steps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cook_sessions cs
      WHERE cs.id = cook_session_steps.session_id
      AND (cs.user_id = auth.uid() OR has_recipe_read_access(cs.recipe_id))
    )
  );

CREATE POLICY "cook_session_steps_insert" ON cook_session_steps
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cook_sessions cs
      WHERE cs.id = cook_session_steps.session_id
      AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "cook_session_steps_update" ON cook_session_steps
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cook_sessions cs
      WHERE cs.id = cook_session_steps.session_id
      AND cs.user_id = auth.uid()
    )
  );

CREATE POLICY "cook_session_steps_delete" ON cook_session_steps
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cook_sessions cs
      WHERE cs.id = cook_session_steps.session_id
      AND cs.user_id = auth.uid()
    )
  );

-- ============================================================================
-- COOK COUNT TRIGGER (recount pattern — converges, self-heals on next change)
-- ============================================================================

CREATE OR REPLACE FUNCTION recount_recipe_cooks()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target uuid := COALESCE(NEW.recipe_id, OLD.recipe_id);
BEGIN
  UPDATE recipes
  SET
    cook_count = (
      SELECT count(*) FROM cook_sessions
      WHERE recipe_id = target AND completed_at IS NOT NULL
    ),
    last_cooked_at = (
      SELECT max(completed_at) FROM cook_sessions
      WHERE recipe_id = target
    )
  WHERE id = target;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS cook_sessions_recount ON cook_sessions;
CREATE TRIGGER cook_sessions_recount
  AFTER INSERT OR DELETE OR UPDATE OF completed_at ON cook_sessions
  FOR EACH ROW EXECUTE FUNCTION recount_recipe_cooks();

-- ============================================================================
-- REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE cook_sessions;
