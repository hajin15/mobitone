type IconProps = {
  /** Material Symbols 이름. 예: play_arrow, dark_mode, skip_next */
  name: string;
  size?: number;
  /** 속이 채워진 아이콘(재생/정지처럼 덩어리로 보여야 하는 것)에 씁니다. */
  filled?: boolean;
};

/**
 * Material Symbols (Rounded).
 *
 * material-symbols 패키지가 주는 .material-symbols-rounded 클래스를 그대로 쓰고
 * 크기와 채움만 덮어씁니다. 리가처 폰트라서 name 이 그대로 자식 텍스트가 됩니다.
 * 버튼의 라벨은 부모 button 의 aria-label 이 담당하므로 여기서는 숨깁니다.
 */
export function Icon({ name, size = 22, filled = false }: IconProps) {
  return (
    <span
      className="material-symbols-rounded"
      aria-hidden="true"
      css={{
        fontSize: size,
        lineHeight: 1,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      }}
    >
      {name}
    </span>
  );
}
