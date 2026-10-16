import { supabase } from '../../lib/supabaseClient';
import { assertNoError, unwrap } from '../../lib/supabaseResult';

/** Một lần đi của một địa điểm. */
export interface Visit {
  id: string;
  placeId: string;
  visitedOn: string;
  note: string | null;
  createdAt: string;
}

interface VisitRow {
  id: string;
  place_id: string;
  visited_on: string;
  note: string | null;
  created_at: string;
}

const VISIT_COLUMNS = 'id, place_id, visited_on, note, created_at';

function mapVisitRow(row: VisitRow): Visit {
  return {
    id: row.id,
    placeId: row.place_id,
    visitedOn: row.visited_on,
    note: row.note,
    createdAt: row.created_at,
  };
}

/** Danh sách các lần đi của một địa điểm, sắp theo `visited_on` giảm dần. */
export async function listVisits(placeId: string): Promise<Visit[]> {
  const rows = await unwrap<VisitRow[]>(
    supabase
      .from('visits')
      .select(VISIT_COLUMNS)
      .eq('place_id', placeId)
      .order('visited_on', { ascending: false }),
  );
  return (rows ?? []).map(mapVisitRow);
}

/** Các trường cần để chèn một lần đi mới (D17 PLAN.md). */
export interface InsertVisitInput {
  placeId: string;
  visitedOn: string;
  note: string | null;
}

/** Chèn một lần đi mới. */
export async function insertVisit(input: InsertVisitInput): Promise<Visit> {
  const row = await unwrap<VisitRow>(
    supabase
      .from('visits')
      .insert({ place_id: input.placeId, visited_on: input.visitedOn, note: input.note })
      .select(VISIT_COLUMNS)
      .single(),
  );
  return mapVisitRow(row);
}

/** Xoá một lần đi (không đụng tới trạng thái của địa điểm — D16). */
export async function deleteVisit(id: string): Promise<void> {
  await assertNoError(supabase.from('visits').delete().eq('id', id));
}
