-- Run this once in the Supabase SQL editor.
-- Deletes all data for a user in a single atomic transaction.
-- If any step fails, Postgres rolls back everything — the account is left fully intact.

CREATE OR REPLACE FUNCTION delete_user_data(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_match_ids    uuid[];
  v_campaign_ids uuid[];
BEGIN
  -- Collect IDs needed for child-table deletions up front
  SELECT ARRAY(
    SELECT id FROM matches
    WHERE business_id = p_user_id OR creator_id = p_user_id
  ) INTO v_match_ids;

  SELECT ARRAY(
    SELECT id FROM campaigns
    WHERE business_id = p_user_id
  ) INTO v_campaign_ids;

  -- 1. messages (deepest — references matches)
  IF array_length(v_match_ids, 1) > 0 THEN
    DELETE FROM messages WHERE match_id = ANY(v_match_ids);
  END IF;

  -- 2. match_reads (references matches)
  IF array_length(v_match_ids, 1) > 0 THEN
    DELETE FROM match_reads WHERE match_id = ANY(v_match_ids);
  END IF;

  -- 3. matches
  DELETE FROM matches
  WHERE business_id = p_user_id OR creator_id = p_user_id;

  -- 4. swipes from OTHER creators on this user's campaigns (must precede campaigns)
  IF array_length(v_campaign_ids, 1) > 0 THEN
    DELETE FROM swipes WHERE campaign_id = ANY(v_campaign_ids);
  END IF;

  -- 5. swipes this user made as a creator
  DELETE FROM swipes WHERE creator_id = p_user_id;

  -- 6. campaigns owned by this user
  DELETE FROM campaigns WHERE business_id = p_user_id;

  -- 7. business profile
  DELETE FROM business_profiles WHERE user_id = p_user_id;

  -- 8. creator profile (if any)
  DELETE FROM creator_profiles WHERE user_id = p_user_id;

  -- 9. public users row — must happen before auth.admin.deleteUser
  DELETE FROM users WHERE id = p_user_id;
END;
$$;
