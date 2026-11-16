/** Always in a photo's header: compare, favourite, save and share. */
export const HEADER_BUTTONS = 4
/** HeaderIconButton's touch target. */
export const HEADER_BUTTON_SIZE = 44
/** The space between header buttons when they all fit: their glyphs then sit 48 pt apart. */
export const HEADER_GAP = 4
/** The phone header row's right margin and the room the back button needs on the left. */
export const HEADER_RESERVED = 6 + 56

/**
 * The space between header buttons: 4 pt, or less when that many do not fit in `width` once
 * `reserved` is taken off. With the comparison with the original, translation and palette all
 * shown there are seven, which at 4 pt apart overrun a 375 pt wide phone.
 *
 * `reserved` defaults to the phone's header; pass 0 when `width` is already the room the buttons
 * alone may take.
 */
export const headerGap = (width: number, buttons: number, reserved = HEADER_RESERVED) =>
  // A single button has no gap to shrink, and dividing by zero would not give a number.
  buttons < 2
    ? HEADER_GAP
    : Math.max(
        0,
        Math.min(
          HEADER_GAP,
          (width - reserved - buttons * HEADER_BUTTON_SIZE) / (buttons - 1),
        ),
      )
