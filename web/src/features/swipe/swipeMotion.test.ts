import { describe, expect, it } from 'vitest';
import {
  cardDragTransform,
  deltaForDirection,
  releaseOutcome,
  stampOpacities,
} from './swipeMotion';

describe('releaseOutcome', () => {
  it('chưa vượt ngưỡng 95px thì huỷ', () => {
    expect(releaseOutcome(95)).toBe('cancel');
    expect(releaseOutcome(-95)).toBe('cancel');
    expect(releaseOutcome(0)).toBe('cancel');
  });

  it('vượt ngưỡng sang phải là like, sang trái là skip', () => {
    expect(releaseOutcome(96)).toBe('like');
    expect(releaseOutcome(-96)).toBe('skip');
  });
});

describe('stampOpacities', () => {
  it('chỉ dấu đúng hướng kéo hiện lên', () => {
    expect(stampOpacities(50)).toEqual({ like: 0.5, skip: 0 });
    expect(stampOpacities(-50)).toEqual({ like: 0, skip: 0.5 });
    expect(stampOpacities(0)).toEqual({ like: 0, skip: 0 });
  });

  it('không vượt quá 1', () => {
    expect(stampOpacities(250)).toEqual({ like: 1, skip: 0 });
    expect(stampOpacities(-250)).toEqual({ like: 0, skip: 1 });
  });
});

describe('cardDragTransform', () => {
  it('dịch theo dx, dy và xoay 0.08 độ cho mỗi px ngang', () => {
    expect(cardDragTransform(50, -10)).toBe('translate3d(50px, -10px, 0) rotate(4deg)');
    expect(cardDragTransform(-100, 0)).toBe('translate3d(-100px, 0px, 0) rotate(-8deg)');
  });
});

describe('deltaForDirection', () => {
  it('like +1, skip −1', () => {
    expect(deltaForDirection('like')).toBe(1);
    expect(deltaForDirection('skip')).toBe(-1);
  });
});
