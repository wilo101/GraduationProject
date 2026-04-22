import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Flame, Wind } from 'lucide-react'

const LAYOUT = [
    { id: 'yard', name: 'MAIN YARD', x: 10, y: 10, w: 50, h: 60 },
    { id: 'loading', name: 'LOADING DOCK', x: 65, y: 10, w: 30, h: 35 },
    { id: 'access', name: 'ACCESS ROAD', x: 65, y: 50, w: 15, h: 40 },
    { id: 'storage', name: 'STORAGE YARD', x: 10, y: 75, w: 40, h: 20 },
]

function findRoomAt(rooms, x, y) {
    return rooms.find((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h)
}

function zoneCenter(room) {
    return { x: room.x + room.w / 2, y: room.y + room.h / 2 }
}

function incidentAnchor(room) {
    // Match incident marker placement (top-right-ish inside room)
    return { x: room.x + room.w - 6, y: room.y + 6 }
}

function missionTarget(room, mapMission) {
    if (!room) return { x: 35, y: 40 }
    if (mapMission?.target === 'incident') return incidentAnchor(room)
    return zoneCenter(room)
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
}

/** Demo wind: direction in degrees from north (clockwise), speed km/h */
const defaultWind = { degFromNorth: 38, speedKmh: 14 }

const HouseMap = ({
    layers = { grid: true, labels: true, robot: true, sensors: false, wind: true },
    selectedRoomId,
    flashZoneId = null,
    /** Operator incidents (e.g. fire) to render on the map */
    incidents = [],
    /** Active map command from operator (deploy / navigate / scan) */
    mapMission = null,
    onMapMissionComplete,
    onTelemetry,
    batteryPercent = 78,
    wind = defaultWind,
}) => {
    const rooms = LAYOUT
    const [trail, setTrail] = useState([{ x: 35, y: 40 }])
    const [robotRot, setRobotRot] = useState(45)
    const [scanningZoneId, setScanningZoneId] = useState(null)
    const [scanMode, setScanMode] = useState('scan')
    const [robotMode, setRobotMode] = useState('idle') // idle | moving | extinguishing

    const tRef = useRef(0)
    const trailRef = useRef(trail)
    const pauseDriftRef = useRef(false)
    const lastTelemetry = useRef({ robotZoneId: null, isMoving: false })
    const moveRafRef = useRef(0)
    const movePrevRef = useRef({ x: 35, y: 40 })

    useEffect(() => {
        trailRef.current = trail
    }, [trail])

    const hazardMarkers = useMemo(
        () => [
            { id: 'heat-loading', zoneId: 'loading', icon: Flame, label: 'Equipment heat', level: 'critical' },
            { id: 'dust-yard', zoneId: 'yard', icon: Wind, label: 'Dust / air alert', level: 'warning' },
        ],
        []
    )

    const roomById = useMemo(() => Object.fromEntries(rooms.map((r) => [r.id, r])), [rooms])

    /** Idle drift — paused during deploy / navigate / scan */
    useEffect(() => {
        let driftMs = 900
        let maxTrail = 48
        if (typeof window !== 'undefined') {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                driftMs = 4200
                maxTrail = 18
            } else if (window.matchMedia('(pointer: coarse)').matches) {
                driftMs = 2600
                maxTrail = 28
            }
        }

        const step = () => {
            const hidden = typeof document !== 'undefined' && document.hidden
            const interval = hidden ? Math.max(driftMs * 4, 4500) : driftMs

            if (!pauseDriftRef.current && !hidden) {
                setTrail((cur) => {
                    const last = cur[cur.length - 1] || { x: 35, y: 40 }
                    const nx = Math.max(6, Math.min(94, last.x + (Math.random() - 0.5) * 2.2))
                    const ny = Math.max(6, Math.min(94, last.y + (Math.random() - 0.5) * 2.2))
                    const next = [...cur, { x: nx, y: ny }]
                    return next.length > maxTrail ? next.slice(next.length - maxTrail) : next
                })
            }
            tRef.current = window.setTimeout(step, interval)
        }
        step()
        return () => window.clearTimeout(tRef.current)
    }, [])

    /** Move robot to sector (deploy = slower path) */
    useEffect(() => {
        if (!mapMission || mapMission.action === 'scan') return undefined
        if (mapMission.action === 'extinguish') return undefined

        const room = roomById[mapMission.zoneId]
        if (!room) {
            onMapMissionComplete?.({ ...mapMission, ok: false })
            return undefined
        }

        pauseDriftRef.current = true
        setRobotMode('moving')
        if (moveRafRef.current) cancelAnimationFrame(moveRafRef.current)

        const target = missionTarget(room, mapMission)
        const start = { ...(trailRef.current[trailRef.current.length - 1] || { x: 35, y: 40 }) }
        movePrevRef.current = { ...start }
        const duration = mapMission.action === 'deploy' ? 3200 : 2200
        const t0 = performance.now()

        const tick = (now) => {
            const elapsed = now - t0
            const u = Math.min(1, elapsed / duration)
            const e = easeOutCubic(u)
            const x = start.x + (target.x - start.x) * e
            const y = start.y + (target.y - start.y) * e

            const prev = movePrevRef.current
            const dx = x - prev.x
            const dy = y - prev.y
            if (Math.hypot(dx, dy) > 0.015) {
                setRobotRot((Math.atan2(dx, -dy) * 180) / Math.PI)
            }
            movePrevRef.current = { x, y }

            setTrail((cur) => {
                const next = [...cur, { x, y }]
                return next.length > 96 ? next.slice(-96) : next
            })

            if (u < 1) {
                moveRafRef.current = requestAnimationFrame(tick)
            } else {
                moveRafRef.current = 0
                pauseDriftRef.current = false
                setRobotMode('idle')
                onMapMissionComplete?.({ ...mapMission, ok: true })
            }
        }

        moveRafRef.current = requestAnimationFrame(tick)

        return () => {
            if (moveRafRef.current) cancelAnimationFrame(moveRafRef.current)
            moveRafRef.current = 0
            pauseDriftRef.current = false
            setRobotMode('idle')
        }
    }, [mapMission, roomById, onMapMissionComplete])

    /** Sector scan / extinguish — visual sweep on zone */
    useEffect(() => {
        if (!mapMission || (mapMission.action !== 'scan' && mapMission.action !== 'extinguish')) return undefined

        const room = roomById[mapMission.zoneId]
        if (!room) {
            onMapMissionComplete?.({ ...mapMission, ok: false })
            return undefined
        }

        pauseDriftRef.current = true
        setScanMode(mapMission.action === 'extinguish' ? 'extinguish' : 'scan')
        setRobotMode(mapMission.action === 'extinguish' ? 'extinguishing' : 'idle')
        setScanningZoneId(mapMission.zoneId)

        if (mapMission.action === 'extinguish') {
            const target = missionTarget(room, mapMission)
            setTrail((cur) => [...cur, { x: target.x, y: target.y }].slice(-96))
        }

        const id = window.setTimeout(() => {
            setScanningZoneId(null)
            pauseDriftRef.current = false
            setRobotMode('idle')
            onMapMissionComplete?.({ ...mapMission, ok: true })
        }, mapMission.action === 'extinguish' ? 4200 : 2600)

        return () => {
            window.clearTimeout(id)
            setScanningZoneId(null)
            pauseDriftRef.current = false
            setRobotMode('idle')
        }
    }, [mapMission, roomById, onMapMissionComplete])

    const emitTelemetry = useCallback(() => {
        if (!onTelemetry) return
        const pt = trail[trail.length - 1] || { x: 35, y: 40 }
        const room = findRoomAt(rooms, pt.x, pt.y)
        const robotZoneId = room?.id ?? 'yard'
        let isMoving = false
        if (trail.length >= 2) {
            const a = trail[trail.length - 1]
            const b = trail[trail.length - 2]
            isMoving = Math.hypot(a.x - b.x, a.y - b.y) > 0.08
        }
        if (pauseDriftRef.current && mapMission && mapMission.action !== 'scan') isMoving = true
        if (lastTelemetry.current.robotZoneId === robotZoneId && lastTelemetry.current.isMoving === isMoving) return
        lastTelemetry.current = { robotZoneId, isMoving }
        onTelemetry({ robotZoneId, isMoving })
    }, [onTelemetry, trail, rooms, mapMission])

    useEffect(() => {
        emitTelemetry()
    }, [emitTelemetry])

    const lastPt = trail[trail.length - 1] || { x: 35, y: 40 }

    const windDeg = wind.degFromNorth ?? 0

    return (
        <div className="house-map">
            {layers?.grid ? <div className="house-map__layer house-map__grid" aria-hidden /> : null}

            {layers?.wind ? (
                <>
                    <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="house-map__layer house-map__wind-streams"
                        style={{ zIndex: 6, pointerEvents: 'none' }}
                        aria-hidden
                    >
                        <g transform={`rotate(${windDeg} 50 50)`} opacity="0.55">
                            {[10, 24, 38, 52, 66, 80, 94].map((y, i) => (
                                <line
                                    key={i}
                                    x1="-18"
                                    y1={y}
                                    x2="118"
                                    y2={y}
                                    stroke="rgba(125, 157, 168, 0.1)"
                                    strokeWidth="0.14"
                                    strokeLinecap="round"
                                />
                            ))}
                        </g>
                    </svg>
                    <div className="house-map__wind-hud" role="img" aria-label={`Wind downwind ${windDeg} degrees`}>
                        <svg width="44" height="44" viewBox="0 0 44 44" className="house-map__wind-hud-svg">
                            <circle cx="22" cy="22" r="19" className="house-map__wind-hud-ring" />
                            <text x="22" y="9" textAnchor="middle" className="house-map__wind-hud-n">
                                N
                            </text>
                            <g transform={`rotate(${windDeg} 22 22)`}>
                                <line
                                    className="house-map__wind-hud-needle"
                                    x1="22"
                                    y1="22"
                                    x2="22"
                                    y2="9"
                                    stroke="rgba(125, 157, 168, 0.75)"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                />
                                <path className="house-map__wind-hud-arrow" d="M22 6 L26 13 L22 11 L18 13 Z" fill="rgba(241, 245, 249, 0.88)" />
                            </g>
                            <circle
                                className="house-map__wind-hud-hub"
                                cx="22"
                                cy="22"
                                r="2.2"
                                fill="rgba(15, 15, 18, 0.95)"
                                stroke="rgba(255,255,255,0.12)"
                                strokeWidth="0.4"
                            />
                        </svg>
                        <div className="house-map__wind-hud-meta">
                            <span className="house-map__wind-hud-deg">{windDeg}°</span>
                            <span className="house-map__wind-hud-spd">{wind?.speedKmh ?? defaultWind.speedKmh} km/h</span>
                        </div>
                    </div>
                </>
            ) : null}

            {rooms.map((room) => {
                const selected = room.id === selectedRoomId
                const flash = flashZoneId && room.id === flashZoneId
                const scanning = scanningZoneId === room.id
                return (
                    <div
                        key={room.id}
                        className={`house-map__room${selected ? ' house-map__room--selected' : ''}${flash ? ' house-map__room--flash' : ''}${scanning ? ' house-map__room--scanning' : ''}`}
                        style={{
                            left: `${room.x}%`,
                            top: `${room.y}%`,
                            width: `${room.w}%`,
                            height: `${room.h}%`,
                            background: `var(--map-room-${room.id})`,
                            cursor: 'default',
                        }}
                    >
                        <span className={`house-map__room-label${layers?.labels ? '' : ' house-map__room-label--hidden'}`}>{room.name}</span>
                        {scanning ? (
                            <div className="house-map__scan-overlay" aria-hidden>
                                <div className="house-map__scan-sweep" />
                                <span className="house-map__scan-label">{scanMode === 'extinguish' ? 'Extinguishing…' : 'Scanning…'}</span>
                            </div>
                        ) : null}
                    </div>
                )
            })}

            {layers?.robot ? (
                <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="house-map__layer"
                    style={{ zIndex: 11, pointerEvents: 'none' }}
                    aria-hidden
                >
                    {trail.length >= 2 ? (
                        <polyline
                            points={trail.map((p) => `${p.x},${p.y}`).join(' ')}
                            fill="none"
                            stroke="rgba(125, 157, 168, 0.45)"
                            strokeWidth="0.35"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            opacity="0.55"
                        />
                    ) : null}
                </svg>
            ) : null}

            {layers?.sensors
                ? hazardMarkers.map((m) => {
                      const room = roomById[m.zoneId]
                      if (!room) return null
                      const x = room.x + room.w - 6
                      const y = room.y + 6
                      const Icon = m.icon
                      const isCritical = m.level === 'critical'
                      return (
                          <div
                              key={m.id}
                              title={m.label}
                              className="house-map__sensor"
                              style={{
                                  left: `${x}%`,
                                  top: `${y}%`,
                                  background: isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(212, 160, 23, 0.14)',
                                  borderColor: isCritical ? 'rgba(239, 68, 68, 0.4)' : 'rgba(212, 160, 23, 0.35)',
                                  color: isCritical ? 'rgba(254, 202, 202, 0.95)' : 'rgba(252, 211, 77, 0.95)',
                              }}
                          >
                              <Icon size={14} aria-hidden />
                          </div>
                      )
                  })
                : null}

            {incidents?.length
                ? incidents.map((m) => {
                      const room = roomById[m.zoneId]
                      if (!room) return null
                      const x = room.x + room.w - 6
                      const y = room.y + 6
                      const Icon = m.icon || Flame
                      const level = m.level || 'critical'
                      const isCritical = level === 'critical'
                      const isWarning = level === 'warning'
                      const bg = isCritical ? 'rgba(239, 68, 68, 0.18)' : isWarning ? 'rgba(245, 158, 11, 0.16)' : 'rgba(148, 163, 184, 0.12)'
                      const border = isCritical ? 'rgba(239, 68, 68, 0.5)' : isWarning ? 'rgba(245, 158, 11, 0.45)' : 'rgba(148, 163, 184, 0.3)'
                      const fg = isCritical ? 'rgba(254, 202, 202, 0.98)' : isWarning ? 'rgba(253, 230, 138, 0.95)' : 'rgba(226, 232, 240, 0.9)'
                      return (
                          <div
                              key={m.id}
                              title={m.label}
                              className="house-map__sensor"
                              style={{
                                  left: `${x}%`,
                                  top: `${y}%`,
                                  background: bg,
                                  borderColor: border,
                                  color: fg,
                                  zIndex: 18,
                                  boxShadow: isCritical ? '0 0 0 1px rgba(239, 68, 68, 0.18), 0 0 22px rgba(239, 68, 68, 0.12)' : undefined,
                              }}
                          >
                              <Icon size={14} aria-hidden />
                          </div>
                      )
                  })
                : null}

            {layers?.robot ? (
                <div
                    className={`house-map__robot${robotMode === 'moving' ? ' house-map__robot--moving' : ''}${robotMode === 'extinguishing' ? ' house-map__robot--extinguishing' : ''}`}
                    style={{
                        left: `${lastPt.x}%`,
                        top: `${lastPt.y}%`,
                    }}
                    aria-label="Robot position"
                >
                    <div className="house-map__robot-marker" style={{ transform: `rotate(${robotRot}deg)` }} aria-hidden>
                        <span className="house-map__robot-chevron" />
                    </div>
                </div>
            ) : null}
        </div>
    )
}

export default HouseMap
