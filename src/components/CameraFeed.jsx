import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Maximize2, Minimize2, Video, Mic } from 'lucide-react'

function getFullscreenElement() {
    return document.fullscreenElement ?? document.webkitFullscreenElement ?? null
}

/**
 * @param {{ showChrome?: boolean; style?: React.CSSProperties; className?: string; onMicActiveChange?: (on: boolean) => void; onFullscreenChange?: (on: boolean) => void; cameraLabel?: string; cameraZone?: string }} props
 */
const CameraFeed = forwardRef(function CameraFeed(
    { showChrome = true, style, className = '', onMicActiveChange, onFullscreenChange, cameraLabel = 'Perimeter cam 01', cameraZone = 'Live zone' },
    ref
) {
    const rootRef = useRef(null)
    const audioStreamRef = useRef(null)
    const [micActive, setMicActive] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const syncMic = useCallback(
        (on) => {
            setMicActive(on)
            onMicActiveChange?.(on)
        },
        [onMicActiveChange]
    )

    const toggleMic = useCallback(async () => {
        if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
            return
        }
        if (audioStreamRef.current) {
            audioStreamRef.current.getTracks().forEach((t) => t.stop())
            audioStreamRef.current = null
            syncMic(false)
            return
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            audioStreamRef.current = stream
            syncMic(true)
        } catch {
            syncMic(false)
        }
    }, [syncMic])

    const toggleFullscreen = useCallback(async () => {
        const el = rootRef.current
        if (!el) return
        try {
            const fsEl = getFullscreenElement()
            if (fsEl === el) {
                if (document.exitFullscreen) await document.exitFullscreen()
                else if (document.webkitExitFullscreen) document.webkitExitFullscreen()
            } else if (el.requestFullscreen) {
                await el.requestFullscreen()
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen()
            }
        } catch {
            /* user gesture / policy */
        }
    }, [])

    useImperativeHandle(
        ref,
        () => ({
            toggleMic,
            toggleFullscreen,
        }),
        [toggleMic, toggleFullscreen]
    )

    useEffect(() => {
        return () => {
            audioStreamRef.current?.getTracks().forEach((t) => t.stop())
            audioStreamRef.current = null
        }
    }, [])

    useEffect(() => {
        const onFsChange = () => {
            setIsFullscreen(getFullscreenElement() === rootRef.current)
        }
        document.addEventListener('fullscreenchange', onFsChange)
        document.addEventListener('webkitfullscreenchange', onFsChange)
        return () => {
            document.removeEventListener('fullscreenchange', onFsChange)
            document.removeEventListener('webkitfullscreenchange', onFsChange)
        }
    }, [])

    useEffect(() => {
        onFullscreenChange?.(isFullscreen)
    }, [isFullscreen, onFullscreenChange])

    const btnBase = {
        width: 38,
        height: 38,
        borderRadius: '50%',
        background: 'var(--camera-feed-btn-bg)',
        border: '1px solid var(--camera-feed-btn-border)',
        boxShadow: 'var(--camera-feed-btn-shadow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--camera-feed-btn-color)',
        cursor: 'pointer',
        padding: 0,
        transition:
            'background 0.2s ease, border-color 0.2s ease, box-shadow var(--theme-crossfade-duration) var(--theme-crossfade-ease)',
    }

    return (
        <div
            ref={rootRef}
            className={`deploy-camera-feed ${className}`.trim()}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--camera-feed-bg)',
                transition: 'background var(--theme-crossfade-duration) var(--theme-crossfade-ease)',
                ...style,
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--camera-feed-overlay)',
                    opacity: 1,
                    transition: 'background var(--theme-crossfade-duration) var(--theme-crossfade-ease)',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'var(--camera-feed-grid)',
                        backgroundSize: 'var(--camera-feed-grid-size, 20px 20px, 24px 24px, 24px 24px, 12px 12px)',
                        opacity: 'var(--camera-feed-grid-opacity, 0.52)',
                        transition: 'opacity var(--theme-crossfade-duration) var(--theme-crossfade-ease)',
                    }}
                />
            </div>

                <div
                    aria-hidden
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 2,
                        pointerEvents: 'none',
                        background: 'var(--camera-feed-vignette)',
                        transition: 'background var(--theme-crossfade-duration) var(--theme-crossfade-ease)',
                    }}
                />

            <div
                style={{
                    position: 'relative',
                    zIndex: 10,
                    textAlign: 'center',
                    color: 'var(--camera-feed-chrome-color)',
                }}
            >
                <Video
                    size={40}
                    style={{
                        marginBottom: '0.5rem',
                        opacity: 'var(--camera-feed-chrome-icon-opacity, 0.55)',
                        filter: 'var(--camera-feed-icon-filter, drop-shadow(0 1px 2px rgba(0,0,0,0.35)))',
                        transition: 'filter var(--theme-crossfade-duration) var(--theme-crossfade-ease)',
                    }}
                    aria-hidden
                />
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: '0.85rem', margin: 0, fontWeight: 600, letterSpacing: '-0.02em' }}>{cameraLabel}</p>
                <p style={{ fontSize: '0.72rem', margin: '0.25rem 0 0', color: 'var(--camera-feed-chrome-muted)' }}>{cameraZone}</p>
            </div>

            {showChrome ? (
                <>
                    <div
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            left: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.65rem',
                            zIndex: 20,
                        }}
                    >
                        <div
                            style={{
                                padding: '0.25rem 0.55rem',
                                background: 'var(--camera-feed-live-bg)',
                                border: '1px solid var(--camera-feed-live-border)',
                                borderRadius: 6,
                                boxShadow: 'var(--camera-feed-live-shadow)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                color: 'var(--camera-feed-live-fg)',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                letterSpacing: '0.1em',
                                transition: 'box-shadow var(--theme-crossfade-duration) var(--theme-crossfade-ease)',
                            }}
                        >
                            <span
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: 'var(--camera-feed-live-dot)',
                                    boxShadow: '0 0 6px color-mix(in srgb, var(--camera-feed-live-dot) 55%, transparent)',
                                }}
                                aria-hidden
                            />
                            LIVE
                        </div>
                        <span
                            style={{
                                color: 'var(--camera-feed-label-color)',
                                fontSize: '0.78rem',
                                padding: '0.2rem 0.5rem',
                                border: '1px solid var(--camera-feed-label-border)',
                                borderRadius: 6,
                                background: 'var(--camera-feed-label-bg)',
                                boxShadow: 'var(--camera-feed-label-shadow)',
                                transition: 'box-shadow var(--theme-crossfade-duration) var(--theme-crossfade-ease)',
                            }}
                        >
                            {cameraLabel}
                        </span>
                    </div>

                    <div
                        style={{
                            position: 'absolute',
                            bottom: '1rem',
                            right: '1rem',
                            display: 'flex',
                            gap: '0.5rem',
                            zIndex: 20,
                        }}
                    >
                        <button
                            type="button"
                            style={{
                                ...btnBase,
                                borderColor: micActive ? 'var(--camera-feed-mic-active-border)' : 'var(--camera-feed-btn-border)',
                                background: micActive ? 'var(--camera-feed-mic-active-bg)' : 'var(--camera-feed-btn-bg)',
                            }}
                            aria-label={micActive ? 'Mute microphone' : 'Unmute microphone'}
                            aria-pressed={micActive}
                            title={micActive ? 'Turn off microphone' : 'Two-way audio (microphone)'}
                            onClick={() => void toggleMic()}
                        >
                            <Mic size={16} aria-hidden />
                        </button>
                        <button
                            type="button"
                            style={btnBase}
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                            onClick={() => void toggleFullscreen()}
                        >
                            {isFullscreen ? <Minimize2 size={16} aria-hidden /> : <Maximize2 size={16} aria-hidden />}
                        </button>
                    </div>
                </>
            ) : null}
        </div>
    )
})

export default memo(CameraFeed)
