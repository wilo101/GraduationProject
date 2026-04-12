import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown } from 'lucide-react'

export const COUNTRY_OPTIONS = [
    { value: 'Egypt', label: 'Egypt' },
    { value: 'Saudi Arabia', label: 'Saudi Arabia' },
    { value: 'United Arab Emirates', label: 'United Arab Emirates' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Other', label: 'Other' },
]

/** Custom country picker — full theme control; native select dropdowns are OS-styled and often unreadable on dark UI. */
export default function CountrySelect({ value, onChange, id }) {
    const [open, setOpen] = useState(false)
    const triggerRef = useRef(null)
    const panelRef = useRef(null)
    const [placement, setPlacement] = useState({ top: 0, left: 0, width: 0 })

    const updatePlacement = useCallback(() => {
        const el = triggerRef.current
        if (!el) return
        const r = el.getBoundingClientRect()
        setPlacement({ top: r.bottom + 6, left: r.left, width: r.width })
    }, [])

    useLayoutEffect(() => {
        if (!open) return
        updatePlacement()
        const onScroll = () => updatePlacement()
        window.addEventListener('scroll', onScroll, true)
        window.addEventListener('resize', onScroll)
        return () => {
            window.removeEventListener('scroll', onScroll, true)
            window.removeEventListener('resize', onScroll)
        }
    }, [open, updatePlacement])

    useEffect(() => {
        if (!open) return
        const onDown = (e) => {
            const t = e.target
            if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return
            setOpen(false)
        }
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onDown)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    const selectedLabel = COUNTRY_OPTIONS.find((c) => c.value === value)?.label ?? value

    const panel =
        open &&
        createPortal(
            <div
                ref={panelRef}
                className="premium-select__panel"
                style={{
                    position: 'fixed',
                    top: placement.top,
                    left: placement.left,
                    width: Math.max(placement.width, 200),
                    zIndex: 600,
                }}
            >
                <ul
                    className="premium-select__list"
                    role="listbox"
                    id={id ? `${id}-listbox` : undefined}
                    aria-labelledby={id || undefined}
                >
                    {COUNTRY_OPTIONS.map((c) => {
                        const active = c.value === value
                        return (
                            <li key={c.value} className="premium-select__item" role="presentation">
                                <button
                                    type="button"
                                    className={`premium-select__option${active ? ' premium-select__option--active' : ''}`}
                                    role="option"
                                    aria-selected={active}
                                    onClick={() => {
                                        onChange(c.value)
                                        setOpen(false)
                                    }}
                                >
                                    <span className="premium-select__option-label">{c.label}</span>
                                    {active ? (
                                        <span className="premium-select__check" aria-hidden>
                                            ✓
                                        </span>
                                    ) : null}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>,
            document.body
        )

    return (
        <div className="premium-select">
            <button
                ref={triggerRef}
                type="button"
                id={id}
                className="premium-select__trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={id ? `${id}-listbox` : undefined}
                onClick={() => {
                    setOpen((v) => !v)
                }}
            >
                <span className="premium-select__value">{selectedLabel}</span>
                <ChevronDown
                    size={18}
                    strokeWidth={2}
                    className={`premium-select__chev${open ? ' premium-select__chev--open' : ''}`}
                    aria-hidden
                />
            </button>
            {panel}
        </div>
    )
}
