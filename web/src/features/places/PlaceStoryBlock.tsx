export interface PlaceStoryBlockProps {
  /** Câu chuyện của địa điểm; `null` hoặc rỗng thì hiện câu nhắc. */
  story: string | null;
}

/** Khối "Câu chuyện" trong bảng trượt lên (U25, mục 6.4 PLAN-UI-1.md). */
export function PlaceStoryBlock({ story }: PlaceStoryBlockProps): React.JSX.Element {
  const hasStory = story !== null && story.trim() !== '';
  return (
    <section className="wtg-story">
      <h3 className="wtg-story__title">Câu chuyện</h3>
      <p className={hasStory ? 'wtg-story__text' : 'wtg-story__text wtg-story__text--empty'}>
        {hasStory ? story : 'Chưa có câu chuyện.'}
      </p>
    </section>
  );
}
