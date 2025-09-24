// SearchableDropdown.jsx  — Portal version (fix z-index for modals)
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";

function cx(...xs) {
  return xs.filter(Boolean).join(" ");
}

function useClickOutside(refs, handler) {
  useEffect(() => {
    function onClick(e) {
      const isInside = refs.some(
        (r) => r.current && r.current.contains(e.target)
      );
      if (!isInside) handler?.();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [refs, handler]);
}

export default function SearchableDropdown({
  options = [],
  value = null,
  onChange,
  placeholder = "Search...",
  disabled = false,
  clearable = true,
  label = "",
  idPrefix = "sdd",
  /** ✅ ใหม่: ปรับ z-index ของเมนูได้ (แก้กรณีอยู่ใน modal) */
  menuZIndex = 10000,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);

  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useClickOutside([rootRef, menuRef], () => setOpen(false));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  );

  function selectOption(optOrNull) {
    const v = optOrNull?.value ?? null;
    onChange?.(v);
    setOpen(false);
    setQuery("");
    setActive(-1);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (disabled) return;
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      setActive(0);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) selectOption(filtered[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const inputId = `${idPrefix}-input`;
  const listId = `${idPrefix}-list`;

  // ---------- Portal positioning ----------
  const [menuStyle, setMenuStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 0,
  });

  function computeMenuPosition() {
    const btn = buttonRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const gutter = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const estHeight = Math.min(224, Math.floor(vh * 0.5));
    const spaceBelow = vh - rect.bottom - gutter;
    const spaceAbove = rect.top - gutter;
    const placeAbove = spaceBelow < 160 && spaceAbove > spaceBelow;

    const top = placeAbove
      ? Math.max(gutter, rect.top - estHeight)
      : Math.min(vh - gutter, rect.bottom);

    const left = Math.max(0, Math.min(rect.left, vw - rect.width));
    const width = rect.width;
    const maxHeight = placeAbove
      ? Math.min(estHeight, rect.top - gutter)
      : Math.min(estHeight, vh - rect.bottom - gutter);

    setMenuStyle({ top, left, width, maxHeight });
  }

  useLayoutEffect(() => {
    if (!open) return;
    computeMenuPosition();
    const onWin = () => computeMenuPosition();
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open]);

  return (
    <div className="w-full" ref={rootRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="block mb-1 text-sm font-medium text-gray-600"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          className={cx(
            "w-full flex items-center justify-between rounded border px-3 py-2 text-left shadow-sm",
            "bg-white focus:outline-none focus:ring-2 focus:ring-blue-500",
            disabled ? "opacity-60 cursor-not-allowed" : "",
            open ? "border-blue-400" : "border-gray-300"
          )}
          onClick={() => {
            if (disabled) return;
            setOpen((o) => !o);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
        >
          <span
            className={cx(
              "truncate",
              selected ? "text-gray-900" : "text-gray-400"
            )}
            title={selected?.label || ""}
          >
            {selected ? selected.label : placeholder}
          </span>

          <div className="flex items-center gap-2 ml-2 shrink-0">
            {clearable && selected && !disabled && (
              <svg
                onClick={(e) => {
                  e.stopPropagation();
                  selectOption(null);
                }}
                width="18"
                height="18"
                viewBox="0 0 20 20"
                className="cursor-pointer"
              >
                <path
                  d="M6 6l8 8M14 6l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            )}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 7l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </button>

        {/* -------- Dropdown menu via Portal (z-index fixed) -------- */}
        {open &&
          !disabled &&
          createPortal(
            <div
              ref={menuRef}
              className="fixed rounded border border-gray-200 bg-white shadow-lg"
              style={{
                top: menuStyle.top,
                left: menuStyle.left,
                width: menuStyle.width,
                maxHeight: menuStyle.maxHeight,
                overflow: "hidden",
                zIndex: menuZIndex, // ✅ สูงกว่า modal/backdrop
              }}
            >
              <div className="p-2 border-b bg-white sticky top-0">
                <input
                  id={inputId}
                  ref={inputRef}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActive(0);
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <ul
                id={listId}
                role="listbox"
                className="py-1 overflow-auto"
                style={{ maxHeight: menuStyle.maxHeight }}
                onKeyDown={handleKeyDown}
              >
                {filtered.length === 0 && (
                  <li className="px-3 py-2 text-sm text-gray-500 select-none">
                    No results
                  </li>
                )}
                {filtered.map((opt, idx) => (
                  <li
                    key={opt.value}
                    role="option"
                    aria-selected={selected?.value === opt.value}
                    className={cx(
                      "flex cursor-pointer items-center justify-between px-3 py-2 text-sm",
                      idx === active ? "bg-blue-50" : "",
                      selected?.value === opt.value
                        ? "text-blue-700"
                        : "text-gray-800"
                    )}
                    onMouseEnter={() => setActive(idx)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => selectOption(opt)}
                  >
                    <span className="truncate" title={opt.label}>
                      {opt.label}
                    </span>
                    {selected?.value === opt.value && (
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M16 6l-7.5 8L4 9.5"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </li>
                ))}
              </ul>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}
