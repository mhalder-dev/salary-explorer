"use client";

import { useEffect, useId, useRef, useState } from "react";

export interface DropdownOption {
  value: string;
  label: string;
}

/**
 * Custom accessible dropdown (button + listbox popover).
 * Replaces native <select> so the popup is fully styleable.
 * Keyboard: Enter/Space/Arrows open; Arrows/Home/End navigate; Enter selects;
 * Escape/Tab/outside-click closes.
 */
/** Two surfaces exist in this design — warm paper, and the black console. */
export type DropdownTone = "paper" | "console";

const TONE = {
  paper: {
    button:
      "border-rule-2/30 bg-paper text-ink hover:border-accent focus-visible:border-accent",
    caret: "text-ink-3",
    list: "border-rule-2 bg-paper shadow-[6px_6px_0_0_var(--rule-2)]",
    option: "text-ink",
    active: "bg-wash text-ink",
    check: "text-accent",
  },
  console: {
    button:
      "border-slab-rule bg-slab-2/50 text-slab-ink hover:border-signal-dim focus-visible:border-signal",
    caret: "text-slab-ink-2",
    list: "border-slab-rule bg-slab shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)]",
    option: "text-slab-ink",
    active: "bg-signal-dim/20 text-signal",
    check: "text-signal",
  },
} as const;

export default function Dropdown({
  options,
  value,
  onChange,
  ariaLabel,
  className = "",
  tone = "paper",
}: {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
  tone?: DropdownTone;
}) {
  const t = TONE[tone];
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex((o) => o.value === value));
  const [activeIndex, setActiveIndex] = useState(selectedIndex);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const selected = options[selectedIndex];

  // Close on click outside.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Focus the listbox when it opens. preventScroll is essential: without it the
  // browser auto-scrolls the focused list into view and the page visibly jumps.
  useEffect(() => {
    if (open) listRef.current?.focus({ preventScroll: true });
  }, [open]);

  // Close when the page (or any outer container) scrolls — matches native
  // <select> behavior. Scrolling INSIDE the option list keeps it open.
  useEffect(() => {
    if (!open) return;
    const onScroll = (e: Event) => {
      if (e.target instanceof Node && listRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  }, [open]);

  const openList = () => {
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  // Keep the active option visible during keyboard navigation by adjusting the
  // list's own scrollTop only — scrollIntoView would also scroll the page.
  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const el = list?.querySelector<HTMLElement>(
      `#${CSS.escape(`${id}-opt-${activeIndex}`)}`,
    );
    if (!list || !el) return;
    if (el.offsetTop < list.scrollTop) {
      list.scrollTop = el.offsetTop;
    } else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight;
    }
  }, [open, activeIndex, id]);

  const select = (index: number) => {
    onChange(options[index].value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onListKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        e.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        select(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            openList();
          }
        }}
        className={`inline-flex h-9 w-full items-center justify-between gap-2 border pl-2.5 pr-2 text-[13px] outline-none transition ${t.button}`}
      >
        <span className="truncate">{selected?.label}</span>
        <svg
          className={`size-3.5 shrink-0 transition-transform ${t.caret} ${open ? "rotate-180" : ""}`}
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          aria-activedescendant={`${id}-opt-${activeIndex}`}
          onKeyDown={onListKeyDown}
          className={`absolute left-0 top-[calc(100%+5px)] z-40 max-h-72 w-full min-w-44 overflow-auto border p-1 outline-none ${t.list}`}
        >
          {options.map((opt, i) => {
            const isSelected = i === selectedIndex;
            const isActive = i === activeIndex;
            return (
              <li
                key={opt.value}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                onPointerMove={() => setActiveIndex(i)}
                onClick={() => select(i)}
                className={
                  "flex cursor-pointer items-center justify-between gap-3 px-2.5 py-1.5 text-[13px] transition-colors " +
                  (isActive ? `${t.active} ` : `${t.option} `) +
                  (isSelected ? "font-semibold" : "")
                }
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <svg
                    className={`size-3.5 shrink-0 ${t.check}`}
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
