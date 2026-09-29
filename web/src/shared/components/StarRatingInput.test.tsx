import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { StarRatingInput } from './StarRatingInput';

// `vitest.setup.ts` không bật chế độ `globals`, nên `@testing-library/react`
// không tự đăng ký `afterEach(cleanup)` — gọi tay để mỗi test có DOM sạch.
afterEach(cleanup);

describe('StarRatingInput', () => {
  it('chọn 3 sao gọi onChange(3)', () => {
    const onChange = vi.fn();
    render(<StarRatingInput value={null} onChange={onChange} />);

    fireEvent.click(screen.getByRole('radio', { name: '3 sao' }));

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('chạm lại đúng sao đang chọn thì xoá đánh giá (null)', () => {
    const onChange = vi.fn();
    render(<StarRatingInput value={3} onChange={onChange} />);

    fireEvent.click(screen.getByRole('radio', { name: '3 sao' }));

    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('mỗi sao có aria-label riêng biệt "N sao"', () => {
    render(<StarRatingInput value={null} onChange={vi.fn()} />);

    for (let starValue = 1; starValue <= 5; starValue += 1) {
      expect(screen.getByRole('radio', { name: `${starValue} sao` })).toBeInTheDocument();
    }
  });
});
