import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
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
    const reduceMotion = useReducedMotion()
    const [open, setOpen] = useState(false)
    const [justSelected, setJustSelected] = useState(false)
    const triggerRef = useRef(null)
    const panelRef = useRef(null)
    const [placement, setPlacement] = useState({ top: 0, left: 0, width: 0 })
    const panelTransition = reduceMotion
        ? { duration: 0 }
        : { duration: 0.24, ease: [0.25, 0.1, 0.25, 1] }

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

    useEffect(() => {
        if (!justSelected) return
        const t = window.setTimeout(() => setJustSelected(false), 700)
        return () => window.clearTimeout(t)
    }, [justSelected])

    const panel = createPortal(
        <AnimatePresence>
            {open ? (
                <motion.div
                    key="country-panel"
                    ref={panelRef}
                    className="premium-select__panel"
                    role="presentation"
                    style={{
                        position: 'fixed',
                        top: placement.top,
                        left: placement.left,
                        width: Math.max(placement.width, 200),
                        zIndex: 600,
                    }}
                    initial={reduceMotion ? false : { opacity: 0, y: -10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                    transition={panelTransition}
                >
                    <ul
                        className="premium-select__list"
                        role="listbox"
                        id={id ? `${id}-listbox` : undefined}
                        aria-labelledby={id || undefined}
                    >
                        {COUNTRY_OPTIONS.map((c, idx) => {
                            const active = c.value === value
                            return (
                                <motion.li
                                    key={c.value}
                                    className="premium-select__item"
                                    role="presentation"
                                    initial={reduceMotion ? false : { opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: reduceMotion ? 0 : 0.24,
                                        ease: [0.25, 0.1, 0.25, 1],
                                        delay: reduceMotion ? 0 : idx * 0.028,
                                    }}
                                >
                                    <button
                                        type="button"
                                        className={`premium-select__option${active ? ' premium-select__option--active' : ''}`}
                                        role="option"
                                        aria-selected={active}
                                        onClick={() => {
                                            onChange(c.value)
                                            setOpen(false)
                                            if (!reduceMotion) setJustSelected(true)
                                        }}
                                    >
                                        <span className="premium-select__option-label">{c.label}</span>
                                        {active ? (
                                            <motion.span
                                                className="premium-select__check"
                                                aria-hidden
                                                initial={reduceMotion ? false : { scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: 'spring', stiffness: 520, damping: 28 }}
                                            >
                                                ✓
                                            </motion.span>
                                        ) : null}
                                    </button>
                                </motion.li>
                            )
                        })}
                    </ul>
                </motion.div>
            ) : null}
        </AnimatePresence>,
        document.body
    )

    return (
        <div
            className={`premium-select${open ? ' premium-select--open' : ''}${justSelected ? ' premium-select--picked' : ''}`}
        >
            <button
                ref={triggerRef}
                type="button"
                id={id}
                className="premium-select__trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={id ? `${id}-listbox` : undefined}
                onClick={() => {
                    setOpen((prev) => {
                        const next = !prev
                        if (next && triggerRef.current) {
                            const r = triggerRef.current.getBoundingClientRect()
                            setPlacement({ top: r.bottom + 6, left: r.left, width: r.width })
                        }
                        return next
                    })
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
