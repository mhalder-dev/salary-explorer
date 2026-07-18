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
export default function Dropdown({
  options,
  value,
  onChange,
  ariaLabel,
  className = "",
}: {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}) {
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

  // Focus the listbox when it opens (active option is set at the open call site).
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  const openList = () => {
    setActiveIndex(selectedIndex);
    setOpen(true);
  };

  // Keep the active option scrolled into view during keyboard navigation.
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`#${CSS.escape(`${id}-opt-${activeIndex}`)}`)
      ?.scrollIntoView({ block: "nearest" });
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
        className="inline-flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-line bg-surface pl-3 pr-2.5 text-sm text-ink outline-none transition hover:border-accent/50 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/25"
      >
        <span className="truncate">{selected?.label}</span>
        <svg
          className={`size-3.5 shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`}
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
          className="absolute left-0 top-[calc(100%+6px)] z-30 max-h-72 w-full min-w-44 overflow-auto rounded-xl border border-line bg-surface p-1.5 shadow-xl shadow-ink/8 outline-none"
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
                  "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors " +
                  (isActive ? "bg-accent-wash text-accent-strong " : "text-ink ") +
                  (isSelected ? "font-medium" : "")
                }
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && (
                  <svg
                    className="size-4 shrink-0 text-accent"
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
