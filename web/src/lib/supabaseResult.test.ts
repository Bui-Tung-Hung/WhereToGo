import { PostgrestError } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { ApiError } from './errors';
import { assertNoError, unwrap } from './supabaseResult';

const POSTGREST_ERROR = new PostgrestError({
  message: 'duplicate key value violates unique constraint',
  details: '',
  hint: '',
  code: '23505',
});

describe('unwrap', () => {
  it('trả về data khi không có lỗi', async () => {
    await expect(unwrap(Promise.resolve({ data: [1, 2], error: null }))).resolves.toEqual([1, 2]);
  });

  it('ném ApiError giữ nguyên mã lỗi khi có lỗi', async () => {
    const promise = unwrap(Promise.resolve({ data: null, error: POSTGREST_ERROR }));
    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({ code: '23505' });
  });
});

describe('assertNoError', () => {
  it('không ném khi không có lỗi', async () => {
    await expect(assertNoError(Promise.resolve({ error: null }))).resolves.toBeUndefined();
  });

  it('ném ApiError khi có lỗi', async () => {
    await expect(assertNoError(Promise.resolve({ error: POSTGREST_ERROR }))).rejects.toBeInstanceOf(
      ApiError,
    );
  });
});
