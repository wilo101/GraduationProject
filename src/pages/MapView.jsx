import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
    Battery,
    BatteryFull,
    BatteryLow,
    BatteryMedium,
    Layers,
    LocateFixed,
    Minus,
    Navigation,
    Plus,
    Search,
    Wind,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import HouseMap from '../components/HouseMap'
import '../styles/map-view.css'

/** Demo site origin for live cursor ↔ WGS-84 readout (operator reporting). */
const SITE_GPS_ORIGIN = { lat: 30.04442, lng: 31.23572 }
const SITE_GPS_SPAN = { lat: 0.012, lng: 0.012 }

/** Battery level icon (no text label) for map chrome */
function MapBatteryGlyph({ pct, className, size = 15 }) {
    const p = Math.max(0, Math.min(100, Math.round(Number(pct))))
    const Icon = p <= 18 ? BatteryLow : p <= 52 ? Battery : p <= 82 ? BatteryMedium : BatteryFull
    return <Icon size={size} className={className} aria-hidden />
}

function formatCoord(n, isLat) {
    const abs = Math.abs(n)
    const dir = isLat ? (n >= 0 ? 'N' : 'S') : n >= 0 ? 'E' : 'W'
    return `${abs.toFixed(5)}° ${dir}`
}

const getZonesSeed = (t) => [
    { id: 'yard', name: t('map.zones.yard'), status: 'clear', lastScan: t('map.time.ago_2m') },
    { id: 'loading', name: t('map.zones.loading'), status: 'low risk', lastScan: t('map.time.ago_9m') },
    { id: 'access', name: t('map.zones.access'), status: 'clear', lastScan: t('map.time.ago_15m') },
    { id: 'storage', name: t('map.zones.storage'), status: 'needs scan', lastScan: t('map.time.ago_1h') },
]

function statusBadge(status, t) {
    if (status === 'clear') {
        return {
            text: t('map.sidebar.status.clear'),
            bg: 'var(--status-clear-bg, rgba(13, 148, 136, 0.12))',
            brd: 'var(--status-clear-brd, rgba(13, 148, 136, 0.22))',
            fg: 'var(--status-clear-fg, rgba(45, 212, 191, 0.95))',
        }
    }
    if (status === 'low risk') {
        return { text: t('map.sidebar.status.low_risk'), bg: 'var(--status-warn-bg, rgba(212, 160, 23, 0.12))', brd: 'var(--status-warn-brd, rgba(212, 160, 23, 0.22))', fg: 'var(--status-warn-fg, rgba(252, 211, 77, 0.95))' }
    }
    return { text: t('map.sidebar.status.needs_scan'), bg: 'var(--status-crit-bg, rgba(239, 68, 68, 0.12))', brd: 'var(--status-crit-brd, rgba(239, 68, 68, 0.22))', fg: 'var(--status-crit-fg, rgba(248, 113, 113, 0.95))' }
}

export default function MapView() {
    const { t } = useTranslation()
    const zonesSeedLoaded = useMemo(() => getZonesSeed(t), [t])
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState(null)
    const [flashZoneId, setFlashZoneId] = useState(null)
    const flashClearRef = useRef(0)
    const [zoom, setZoom] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [navToast, setNavToast] = useState(null)
    const [layersOpen, setLayersOpen] = useState(false)
    const [layers, setLayers] = useState({
        grid: true,
        labels: true,
        robot: true,
        sensors: false,
        wind: true,
    })
    const [robotZoneId, setRobotZoneId] = useState('yard')
    const [robotMoving, setRobotMoving] = useState(false)
    /** Merge into zonesSeed for sidebar (e.g. after scan) */
    const [zoneMeta, setZoneMeta] = useState({})
    /** Drives HouseMap: robot path + scan overlay */
    const [mapMission, setMapMission] = useState(null)
    const [minimapDragging, setMinimapDragging] = useState(false)
    const [cursorCoords, setCursorCoords] = useState(null)
    const [batteryPct, setBatteryPct] = useState(78)
    const [windEnv] = useState({ degFromNorth: 38, speedKmh: 14 })

    const layersBtnRef = useRef(null)
    const layersDropdownRef = useRef(null)
    const minimapDragRef = useRef({ active: false, sx: 0, sy: 0, px: 0, py: 0 })

    useEffect(() => () => window.clearTimeout(flashClearRef.current), [])

    useEffect(() => {
        if (!layersOpen) return
        const onDown = (e) => {
            const t = e.target
            if (layersDropdownRef.current?.contains(t) || layersBtnRef.current?.contains(t)) return
            setLayersOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [layersOpen])

    const zones = useMemo(() => {
        const q = query.trim().toLowerCase()
        const base = zonesSeedLoaded.map((z) => ({
            ...z,
            ...(zoneMeta[z.id] || {}),
        }))
        if (!q) return base
        return base.filter((z) => z.name.toLowerCase().includes(q))
    }, [query, zoneMeta, zonesSeedLoaded])

    const robotMeta = useMemo(() => {
        const z = zonesSeedLoaded.find((x) => x.id === robotZoneId) || zonesSeedLoaded[0]
        return { ...z, ...(zoneMeta[z.id] || {}) }
    }, [robotZoneId, zoneMeta, zonesSeedLoaded])

    const handleMapMissionComplete = useCallback((detail) => {
        setMapMission((cur) => (cur && cur.token === detail.token ? null : cur))
        if (detail.ok && detail.action === 'scan' && detail.zoneId) {
            setZoneMeta((m) => ({
                ...m,
                [detail.zoneId]: {
                    status: 'clear',
                    lastScan: t('map.time.just_now'),
                },
            }))
        }
    }, [t])

    const sendNavigationCommand = useCallback((zone, action = 'navigate') => {
        const token = Date.now()
        const payload = {
            zoneId: zone.id,
            zoneName: zone.name,
            action,
            at: new Date().toISOString(),
        }
        window.dispatchEvent(new CustomEvent('robot:navigate', { detail: payload }))
        const msg = action === 'scan' ? t('map.nav.scanning', { name: zone.name }) : t('map.nav.routing', { name: zone.name })
        setSelected(zone.id)
        setFlashZoneId(zone.id)
        window.clearTimeout(flashClearRef.current)
        flashClearRef.current = window.setTimeout(() => setFlashZoneId(null), 1600)
        setMapMission({ zoneId: zone.id, action, token })
        setNavToast(msg)
        window.setTimeout(() => setNavToast(null), action === 'scan' ? 3200 : 4200)
    }, [t])

    const onTelemetry = useCallback(({ robotZoneId: id, isMoving }) => {
        setRobotZoneId(id)
        setRobotMoving(!!isMoving)
    }, [])

    const onMinimapMouseDown = (e) => {
        e.preventDefault()
        minimapDragRef.current = {
            active: true,
            sx: e.clientX,
            sy: e.clientY,
            px: pan.x,
            py: pan.y,
        }
        setMinimapDragging(true)
    }

    useEffect(() => {
        const onMove = (e) => {
            if (!minimapDragRef.current.active) return
            const { sx, sy, px, py } = minimapDragRef.current
            setPan({
                x: px + (e.clientX - sx) * 1.15,
                y: py + (e.clientY - sy) * 1.15,
            })
        }
        const onUp = () => {
            minimapDragRef.current.active = false
            setMinimapDragging(false)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        return () => {
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
    }, [])

    useEffect(() => {
        const id = window.setInterval(() => {
            setBatteryPct((b) => {
                const n = b + (Math.random() - 0.52) * 0.35
                return Math.min(100, Math.max(18, Math.round(n * 10) / 10))
            })
        }, 8000)
        return () => window.clearInterval(id)
    }, [])

    const onMapPointerMove = useCallback((e) => {
        const el = e.currentTarget
        const w = el.offsetWidth || 1
        const h = el.offsetHeight || 1
        const px = (e.nativeEvent.offsetX / w) * 100
        const py = (e.nativeEvent.offsetY / h) * 100
        const lat = SITE_GPS_ORIGIN.lat + SITE_GPS_SPAN.lat * (1 - py / 100)
        const lng = SITE_GPS_ORIGIN.lng + SITE_GPS_SPAN.lng * (px / 100)
        setCursorCoords({ lat, lng, px, py })
    }, [])

    const clearMapPointer = useCallback(() => setCursorCoords(null), [])

    const centerOnRobot = useCallback(() => {
        setPan({ x: 0, y: 0 })
        setZoom(1)
    }, [])

    return (
        <div className="map-page fade-in ops-page-wrap">
            <header className="map-page__header">
                <div>
                    <h1
                        dir="auto"
                        className="mixed-bidi"
                        style={{
                            fontSize: 'clamp(1.5rem, 2.8vw, 2.2rem)',
                            fontWeight: 650,
                            letterSpacing: '-0.03em',
                            marginBottom: '0.25rem',
                            fontFamily: 'var(--font-heading)',
                        }}
                    >
                        {t('map.title')}
                    </h1>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '52ch', lineHeight: 1.45, margin: 0 }}>
                        {t('map.description')}
                    </p>
                </div>

                <div className="map-page__toolbar">
                    <div className="map-layers-anchor">
                        <button
                            ref={layersBtnRef}
                            type="button"
                            className="auth-social-btn"
                            style={{ padding: '0.65rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                            aria-expanded={layersOpen}
                            aria-haspopup="true"
                            onClick={() => setLayersOpen((o) => !o)}
                        >
                            <Layers size={18} aria-hidden />
                            Layers
                        </button>
                        {layersOpen ? (
                            <div ref={layersDropdownRef} className="map-layers-dropdown" role="menu">
                                {[
                                    ['grid', t('map.layers.grid')],
                                    ['labels', t('map.layers.labels')],
                                    ['robot', t('map.layers.robot')],
                                    ['wind', t('map.layers.wind')],
                                    ['sensors', t('map.layers.sensors')],
                                ].map(([key, label]) => (
                                    <label key={key}>
                                        <span>{label}</span>
                                        <input
                                            type="checkbox"
                                            checked={layers[key]}
                                            onChange={(e) => setLayers((s) => ({ ...s, [key]: e.target.checked }))}
                                            aria-label={label}
                                        />
                                    </label>
                                ))}
                            </div>
                        ) : null}
                    </div>
                    <button
                        type="button"
                        className="auth-social-btn"
                        style={{ padding: '0.65rem 0.85rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        onClick={centerOnRobot}
                    >
                        <LocateFixed size={18} aria-hidden />
                        {t('map.toolbar.center')}
                    </button>
                </div>
            </header>

            <div className="map-ops-frame">
                <div className="map-ops-frame__accent" aria-hidden />
                <div className="map-env-strip" aria-label="Environmental overlay summary">
                    <span className="map-env-strip__item">
                        <Wind className="map-env-strip__ico" size={15} aria-hidden />
                        {t('map.env.wind', { speed: windEnv.speedKmh, heading: windEnv.degFromNorth })}
                    </span>
                    <span
                        className="map-env-strip__item map-env-strip__item--battery"
                        aria-label={`${t('map.env.battery')} ${batteryPct.toFixed(batteryPct % 1 === 0 ? 0 : 1)}%`}
                    >
                        <MapBatteryGlyph pct={batteryPct} className="map-env-strip__ico map-env-strip__battery-ico" />
                        <span>{batteryPct.toFixed(batteryPct % 1 === 0 ? 0 : 1)}%</span>
                    </span>
                </div>

                <div className="map-page__body map-page__body--framed">
                <aside className="map-sidebar">
                    <div className="map-sidebar__search">
                        <div className="auth-input-wrap" style={{ margin: 0 }}>
                            <Search className="auth-icon" size={18} aria-hidden />
                                <input
                                className="auth-input"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t('map.sidebar.search')}
                                aria-label={t('map.sidebar.search')}
                            />
                        </div>
                    </div>

                    <div className="map-sidebar__list" aria-label="Zones">
                        {zones.map((r) => {
                            const p = statusBadge(r.status, t)
                            const active = r.id === selected
                            return (
                                <div key={r.id} className={`map-room-row${active ? ' map-room-row--selected' : ''}`}>
                                    <button
                                        type="button"
                                        className="map-room-row__hit"
                                        onClick={() => setSelected(active ? null : r.id)}
                                    >
                                        <span className="map-room-row__text">
                                            <span className="map-room-row__name">{r.name}</span>
                                            <span className="map-room-row__meta">{t('map.sidebar.last_scan', { time: r.lastScan })}</span>
                                        </span>
                                        <span
                                            className="map-room-row__badge"
                                            style={{
                                                background: p.bg,
                                                border: `1px solid ${p.brd}`,
                                                color: p.fg,
                                            }}
                                        >
                                            {p.text}
                                        </span>
                                    </button>
                                    <div className="map-room-row__actions-shell">
                                        <div className="map-room-row__actions-inner">
                                            <div className="map-room-row__actions map-room-row__actions--inline">
                                                <button
                                                    type="button"
                                                    className="map-room-row__action map-room-row__action--scan"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        sendNavigationCommand(r, 'scan')
                                                    }}
                                                >
                                                    {t('map.sidebar.actions.scan')}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="map-room-row__action map-room-row__action--primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        sendNavigationCommand(r, 'navigate')
                                                    }}
                                                >
                                                    {t('map.sidebar.actions.navigate')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </aside>

                <section className="map-canvas-col" aria-label="Site map">
                    <div className="map-canvas-toolbar">
                        <div className="map-canvas-toolbar__meta">
                            <span className="map-canvas-toolbar__title">{t('map.canvas.overview')}</span>
                            <span className="map-canvas-toolbar__sub">{t('map.canvas.live')}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <button
                                className="auth-social-btn"
                                type="button"
                                onClick={() => setZoom((z) => Math.max(0.8, Number((z - 0.1).toFixed(1))))}
                                style={{ padding: '0.55rem 0.65rem' }}
                                aria-label="Zoom out"
                            >
                                <Minus size={18} aria-hidden />
                            </button>
                            <div className="map-zoom-readout" aria-label="Zoom level">
                                {Math.round(zoom * 100)}%
                            </div>
                            <button
                                className="auth-social-btn"
                                type="button"
                                onClick={() => setZoom((z) => Math.min(1.8, Number((z + 0.1).toFixed(1))))}
                                style={{ padding: '0.55rem 0.65rem' }}
                                aria-label="Zoom in"
                            >
                                <Plus size={18} aria-hidden />
                            </button>
                        </div>
                    </div>

                    <div className="map-viewport-wrap">
                        <div
                            className="map-viewport-inner"
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            }}
                        >
                            <div
                                className="map-pointer-layer"
                                onMouseMove={onMapPointerMove}
                                onMouseLeave={clearMapPointer}
                                role="presentation"
                            />
                            <HouseMap
                                layers={layers}
                                selectedRoomId={selected}
                                flashZoneId={flashZoneId}
                                mapMission={mapMission}
                                onMapMissionComplete={handleMapMissionComplete}
                                onTelemetry={onTelemetry}
                                batteryPercent={batteryPct}
                                wind={windEnv}
                            />
                        </div>

                        <div
                            className="map-minimap"
                            role="presentation"
                            title="Drag to pan the map view"
                            onMouseDown={onMinimapMouseDown}
                            style={{ cursor: minimapDragging ? 'grabbing' : 'grab' }}
                            aria-label="Viewport minimap. Drag to pan the map view."
                        >
                            <div className="map-minimap__grid" />
                            <div className="map-minimap__frame" />
                            <div className="map-minimap__hint">{t('map.canvas.drag_to_pan')}</div>
                            <div className="map-minimap__handle" aria-hidden>
                                ⠿
                            </div>
                            <div className="map-minimap__label">{t('map.canvas.viewport')}</div>
                        </div>
                    </div>

                    <div className="map-status-bar" role="status">
                        <span className="map-status-bar__robot-line">
                            {t('map.status.robot')} <strong className="map-status-bar__sector">{robotMeta.name}</strong>
                            <span
                                className="map-status-bar__battery"
                                aria-label={`${t('map.env.battery')} ${batteryPct.toFixed(batteryPct % 1 === 0 ? 0 : 1)}%`}
                            >
                                {' '}
                                ·{' '}
                                <MapBatteryGlyph pct={batteryPct} className="map-status-bar__battery-ico" />
                                {batteryPct.toFixed(batteryPct % 1 === 0 ? 0 : 1)}%
                            </span>
                        </span>
                        <span className="map-status-bar__coords" title="Move the cursor over the map for live coordinates" aria-live="polite">
                            {cursorCoords ? (
                                <>
                                    <Navigation size={14} aria-hidden className="map-status-bar__coords-ico" />
                                    <span className="map-status-bar__mono">
                                        {formatCoord(cursorCoords.lat, true)}, {formatCoord(cursorCoords.lng, false)}
                                    </span>
                                </>
                            ) : (
                                <span className="map-status-bar__coords-hint">{t('map.status.hover')}</span>
                            )}
                        </span>
                        <span className="map-status-bar__last-scan">{t('map.status.last_scan', { time: robotMeta.lastScan })}</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                            {robotMoving ? (
                                <>
                                    <span className="map-status-bar__dot" aria-hidden />
                                    <span className="map-status-bar__moving">{t('map.status.moving')}</span>
                                </>
                            ) : null}
                        </span>
                    </div>
                </section>
                </div>
            </div>

            <AnimatePresence>
                {navToast ? (
                    <motion.div
                        key={navToast}
                        role="status"
                        aria-live="polite"
                        className="map-nav-toast"
                        initial={{ opacity: 0, y: 14, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        {navToast}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    )
}
