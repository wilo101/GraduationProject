import React, { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Maximize2, Minimize2, Video, Mic, Camera, Circle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const STORAGE_KEY = 'camera-feed-stream-url'

function getFullscreenElement() {
    return document.fullscreenElement ?? document.webkitFullscreenElement ?? null
}

function parseUrlToFields(urlStr) {
    try {
        const u = new URL(urlStr)
        const path = (u.pathname || '/') + (u.search || '')
        return {
            ip: u.hostname,
            port: u.port || '',
            path: path === '/' ? '' : path,
        }
    } catch {
        return { ip: '', port: '', path: '' }
    }
}

/** @param {string} ip */
/** @param {string} port */
/** @param {string} path */
function buildStreamUrl(ip, port, path) {
    const raw = ip.trim()
    if (!raw) return null
    if (/^https?:\/\//i.test(raw)) return raw.trim()

    let p = path.trim()
    if (p && !p.startsWith('/')) p = `/${p}`

    const po = port.trim()
    return `http://${raw}${po ? `:${po}` : ''}${p}`
}

function isProbablyVideoContainer(url) {
    const u = url.toLowerCase()
    return u.includes('.m3u8') || u.includes('.mp4') || u.includes('.webm') || u.includes('/hls') || u.includes('playlist')
}

function isProbablyMjpegOrImageStream(url) {
    const u = url.toLowerCase()
    return (
        u.includes('mjpeg') ||
        u.includes('mjpg') ||
        u.includes('motion') ||
        u.includes('videostream') ||
        u.includes('snapshot') ||
        u.includes('.jpg') ||
        u.includes('cgi')
    )
}

function pickVideoMimeType() {
    if (typeof MediaRecorder === 'undefined') return ''
    const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || ''
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
}

/**
 * @param {{ showChrome?: boolean; style?: React.CSSProperties; className?: string; onMicActiveChange?: (on: boolean) => void; onFullscreenChange?: (on: boolean) => void; cameraLabel?: string; cameraZone?: string; feedImageSrc?: string; feedImageAlt?: string; feedImageObjectPosition?: string; feedVideoSrc?: string; feedVideoPoster?: string }} props
 */
const CameraFeed = forwardRef(function CameraFeed(
    {
        showChrome = true,
        style,
        className = '',
        onMicActiveChange,
        onFullscreenChange,
        cameraLabel = 'Perimeter cam 01',
        cameraZone = 'Live zone',
        feedImageSrc,
        feedImageAlt = '',
        feedImageObjectPosition = 'center',
        feedVideoSrc,
        feedVideoPoster,
    },
    ref
) {
    const { t } = useTranslation()
    const rootRef = useRef(null)
    const audioStreamRef = useRef(null)
    const [micActive, setMicActive] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)

    const [internalStreamUrl, setInternalStreamUrl] = useState(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) || ''
        } catch {
            return ''
        }
    })
    const [modalOpen, setModalOpen] = useState(false)
    const [ipField, setIpField] = useState('')
    const [portField, setPortField] = useState('')
    const [pathField, setPathField] = useState('')
    const [formError, setFormError] = useState('')
    const [streamLoadError, setStreamLoadError] = useState(false)
    const [captureToast, setCaptureToast] = useState('')
    const [recording, setRecording] = useState(false)

    const streamVideoRef = useRef(null)
    const streamImgRef = useRef(null)
    const staticImgRef = useRef(null)
    const toastTimerRef = useRef(0)
    const mediaRecorderRef = useRef(null)
    const recordChunksRef = useRef([])

    const effectiveVideoSrc = feedVideoSrc || internalStreamUrl || ''

    const openConnectModal = useCallback(() => {
        const src = feedVideoSrc || internalStreamUrl
        if (src) {
            const f = parseUrlToFields(src)
            setIpField(f.ip || '')
            setPortField(f.port || '')
            setPathField(f.path || '')
        } else {
            setIpField('')
            setPortField('')
            setPathField('')
        }
        setFormError('')
        setModalOpen(true)
    }, [feedVideoSrc, internalStreamUrl])

    const closeModal = useCallback(() => setModalOpen(false), [])

    const applyConnect = useCallback(() => {
        const url = buildStreamUrl(ipField, portField, pathField)
        if (!url) {
            setFormError(t('dashboard.camera_connect.invalid'))
            return
        }
        setFormError('')
        setStreamLoadError(false)
        try {
            localStorage.setItem(STORAGE_KEY, url)
        } catch {
            /* ignore */
        }
        setInternalStreamUrl(url)
        setModalOpen(false)
    }, [ipField, portField, pathField, t])

    const disconnectStream = useCallback(() => {
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch {
            /* ignore */
        }
        setInternalStreamUrl('')
        setStreamLoadError(false)
        setModalOpen(false)
    }, [])

    useEffect(() => {
        setStreamLoadError(false)
    }, [effectiveVideoSrc])

    const flashToast = useCallback(
        (msg) => {
            setCaptureToast(msg)
            window.clearTimeout(toastTimerRef.current)
            toastTimerRef.current = window.setTimeout(() => setCaptureToast(''), 2800)
        },
        []
    )

    useEffect(() => {
        if (!modalOpen || typeof document === 'undefined') return
        const onKey = (e) => {
            if (e.key === 'Escape') setModalOpen(false)
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    }, [modalOpen])

    const useVideoTag = useMemo(() => {
        if (!effectiveVideoSrc) return false
        if (isProbablyVideoContainer(effectiveVideoSrc)) return true
        if (isProbablyMjpegOrImageStream(effectiveVideoSrc)) return false
        return true
    }, [effectiveVideoSrc])

    const getCaptureEl = useCallback(() => {
        if (effectiveVideoSrc) return useVideoTag ? streamVideoRef.current : streamImgRef.current
        if (feedImageSrc) return staticImgRef.current
        return null
    }, [effectiveVideoSrc, useVideoTag, feedImageSrc])

    const takeScreenshot = useCallback(() => {
        const el = getCaptureEl()
        if (!el) {
            flashToast(t('dashboard.camera_capture.no_frame'))
            return
        }
        const w = el instanceof HTMLVideoElement ? el.videoWidth : el.naturalWidth
        const h = el instanceof HTMLVideoElement ? el.videoHeight : el.naturalHeight
        const cw = w || el.clientWidth
        const ch = h || el.clientHeight
        if (!cw || !ch) {
            flashToast(t('dashboard.camera_capture.no_frame'))
            return
        }
        try {
            const canvas = document.createElement('canvas')
            canvas.width = cw
            canvas.height = ch
            const ctx = canvas.getContext('2d')
            if (!ctx) return
            ctx.drawImage(el, 0, 0, cw, ch)
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        flashToast(t('dashboard.camera_capture.record_failed'))
                        return
                    }
                    downloadBlob(blob, `camera-${Date.now()}.png`)
                },
                'image/png',
                0.92
            )
        } catch {
            flashToast(t('dashboard.camera_capture.record_failed'))
        }
    }, [getCaptureEl, flashToast, t])

    const stopRecording = useCallback(() => {
        const mr = mediaRecorderRef.current
        if (mr && mr.state !== 'inactive') {
            try {
                mr.stop()
            } catch {
                /* ignore */
            }
        }
        mediaRecorderRef.current = null
        setRecording(false)
    }, [])

    const startRecording = useCallback(() => {
        if (typeof MediaRecorder === 'undefined') {
            flashToast(t('dashboard.camera_capture.record_failed'))
            return
        }
        const el = getCaptureEl()
        if (!el) {
            flashToast(t('dashboard.camera_capture.no_frame'))
            return
        }
        const mime = pickVideoMimeType()
        if (!mime) {
            flashToast(t('dashboard.camera_capture.record_failed'))
            return
        }

        const w = el instanceof HTMLVideoElement ? el.videoWidth : el.naturalWidth
        const h = el instanceof HTMLVideoElement ? el.videoHeight : el.naturalHeight
        const cw = w || el.clientWidth
        const ch = h || el.clientHeight
        if (!cw || !ch) {
            flashToast(t('dashboard.camera_capture.no_frame'))
            return
        }

        const canvas = document.createElement('canvas')
        canvas.width = cw
        canvas.height = ch
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let stream
        try {
            stream = canvas.captureStream(12)
        } catch {
            flashToast(t('dashboard.camera_capture.record_failed'))
            return
        }

        recordChunksRef.current = []

        let mr
        try {
            mr = new MediaRecorder(stream, { mimeType: mime })
        } catch {
            flashToast(t('dashboard.camera_capture.record_failed'))
            return
        }

        mr.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) recordChunksRef.current.push(e.data)
        }
        mr.onstop = () => {
            const chunks = recordChunksRef.current
            recordChunksRef.current = []
            if (!chunks.length) {
                flashToast(t('dashboard.camera_capture.record_failed'))
                return
            }
            const blob = new Blob(chunks, { type: 'video/webm' })
            downloadBlob(blob, `camera-${Date.now()}.webm`)
        }

        const draw = () => {
            if (mediaRecorderRef.current !== mr) return
            try {
                if (el instanceof HTMLVideoElement) {
                    if (el.readyState >= 2) ctx.drawImage(el, 0, 0, cw, ch)
                } else {
                    ctx.drawImage(el, 0, 0, cw, ch)
                }
            } catch {
                // cross-origin might taint canvas; keep trying
            }
            requestAnimationFrame(draw)
        }

        mediaRecorderRef.current = mr
        setRecording(true)
        draw()

        try {
            mr.start(250)
        } catch {
            mediaRecorderRef.current = null
            setRecording(false)
            flashToast(t('dashboard.camera_capture.record_failed'))
        }
    }, [flashToast, getCaptureEl, t])

    const toggleRecording = useCallback(() => {
        if (recording) stopRecording()
        else startRecording()
    }, [recording, startRecording, stopRecording])

    useEffect(() => {
        setCaptureToast('')
        stopRecording()
        window.clearTimeout(toastTimerRef.current)
    }, [effectiveVideoSrc, stopRecording])

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
            stopRecording()
            window.clearTimeout(toastTimerRef.current)
        }
    }, [stopRecording])

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

    const labelBtnStyle = {
        color: 'var(--camera-feed-label-color)',
        fontSize: '0.78rem',
        padding: '0.2rem 0.5rem',
        border: '1px solid var(--camera-feed-label-border)',
        borderRadius: 6,
        background: 'var(--camera-feed-label-bg)',
        boxShadow: 'var(--camera-feed-label-shadow)',
        transition: 'box-shadow var(--theme-crossfade-duration) var(--theme-crossfade-ease)',
        cursor: 'pointer',
        font: 'inherit',
    }

    const hasMediaLayer = Boolean(effectiveVideoSrc || feedImageSrc)

    const modal =
        modalOpen &&
        typeof document !== 'undefined' &&
        createPortal(
            <div
                className="pair-devices-overlay"
                role="dialog"
                aria-modal="true"
                aria-labelledby="camera-connect-title"
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget) closeModal()
                }}
            >
                <div className="glass-panel pair-devices-modal" onMouseDown={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
                    <div className="pair-devices-modal__head">
                        <div className="pair-devices-modal__title-wrap">
                            <Video size={22} aria-hidden className="pair-devices-modal__ico" />
                            <div>
                                <h2 id="camera-connect-title" className="pair-devices-modal__title">
                                    {t('dashboard.camera_connect.modal_title')}
                                </h2>
                                <p className="pair-devices-modal__lede" style={{ marginBottom: 0 }}>
                                    {t('dashboard.camera_connect.hint')}
                                </p>
                            </div>
                        </div>
                        <button type="button" className="pair-devices-modal__close" onClick={closeModal} aria-label={t('dashboard.camera_connect.cancel')}>
                            ×
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{t('dashboard.camera_connect.ip_label')}</span>
                            <input
                                type="text"
                                className="account-form-input"
                                dir="ltr"
                                autoComplete="off"
                                placeholder={t('dashboard.camera_connect.ip_placeholder')}
                                value={ipField}
                                onChange={(e) => setIpField(e.target.value)}
                            />
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{t('dashboard.camera_connect.port_label')}</span>
                                <input
                                    type="text"
                                    className="account-form-input"
                                    dir="ltr"
                                    inputMode="numeric"
                                    placeholder={t('dashboard.camera_connect.port_placeholder')}
                                    value={portField}
                                    onChange={(e) => setPortField(e.target.value)}
                                />
                            </label>
                            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>{t('dashboard.camera_connect.path_label')}</span>
                                <input
                                    type="text"
                                    className="account-form-input"
                                    dir="ltr"
                                    placeholder={t('dashboard.camera_connect.path_placeholder')}
                                    value={pathField}
                                    onChange={(e) => setPathField(e.target.value)}
                                />
                            </label>
                        </div>
                        {formError ? (
                            <p style={{ margin: 0, fontSize: '0.82rem', color: '#f87171' }}>{formError}</p>
                        ) : null}

                        <div className="pair-devices-modal__actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
                            <button type="button" className="account-form-btn account-form-btn--primary" onClick={applyConnect}>
                                {t('dashboard.camera_connect.connect')}
                            </button>
                            {internalStreamUrl ? (
                                <button type="button" className="account-form-btn" onClick={disconnectStream}>
                                    {t('dashboard.camera_connect.disconnect')}
                                </button>
                            ) : null}
                            <button type="button" className="account-form-btn" onClick={closeModal}>
                                {t('dashboard.camera_connect.cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>,
            document.body
        )

    return (
        <>
            {modal}
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
                {effectiveVideoSrc && useVideoTag ? (
                    <video
                        ref={streamVideoRef}
                        key={effectiveVideoSrc}
                        src={effectiveVideoSrc}
                        poster={feedVideoPoster}
                        autoPlay
                        muted
                        playsInline
                        preload="auto"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 1,
                            opacity: 'var(--camera-feed-video-opacity, 0.98)',
                            filter: 'var(--camera-feed-video-filter, none)',
                        }}
                        onError={() => setStreamLoadError(true)}
                    />
                ) : effectiveVideoSrc && !useVideoTag ? (
                    <img
                        ref={streamImgRef}
                        key={effectiveVideoSrc}
                        src={effectiveVideoSrc}
                        alt=""
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 1,
                            opacity: 'var(--camera-feed-image-opacity, 0.95)',
                            filter: 'var(--camera-feed-image-filter, none)',
                        }}
                        draggable={false}
                        onError={() => setStreamLoadError(true)}
                    />
                ) : feedImageSrc ? (
                    <img
                        ref={staticImgRef}
                        src={feedImageSrc}
                        alt={feedImageAlt}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: feedImageObjectPosition,
                            zIndex: 1,
                            opacity: 'var(--camera-feed-image-opacity, 0.95)',
                            filter: 'var(--camera-feed-image-filter, none)',
                        }}
                        draggable={false}
                    />
                ) : null}

                {captureToast ? (
                    <div
                        role="status"
                        aria-live="polite"
                        style={{
                            position: 'absolute',
                            bottom: '4.25rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 22,
                            maxWidth: 'min(92%, 420px)',
                            padding: '0.45rem 0.75rem',
                            borderRadius: 10,
                            fontSize: '0.78rem',
                            fontWeight: 650,
                            textAlign: 'center',
                            color: 'rgba(248,250,252,0.95)',
                            background: 'rgba(15,23,42,0.88)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                        }}
                    >
                        {captureToast}
                    </div>
                ) : null}

                {streamLoadError && effectiveVideoSrc ? (
                    <div
                        role="alert"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            zIndex: 15,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '1rem',
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            color: 'rgba(248,250,252,0.92)',
                            background: 'rgba(15,23,42,0.72)',
                        }}
                    >
                        {t('dashboard.camera_connect.load_failed')}
                    </div>
                ) : null}

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'var(--camera-feed-overlay)',
                        opacity: hasMediaLayer ? 0.55 : 1,
                        transition: 'background var(--theme-crossfade-duration) var(--theme-crossfade-ease)',
                        zIndex: 3,
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundImage: 'var(--camera-feed-grid)',
                            backgroundSize: 'var(--camera-feed-grid-size, 20px 20px, 24px 24px, 24px 24px, 12px 12px)',
                            opacity: hasMediaLayer ? 0.28 : 'var(--camera-feed-grid-opacity, 0.52)',
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

                {!effectiveVideoSrc && !feedImageSrc ? (
                    <button
                        type="button"
                        onClick={openConnectModal}
                        aria-label={t('dashboard.camera_connect.open_aria')}
                        style={{
                            position: 'relative',
                            zIndex: 10,
                            textAlign: 'center',
                            color: 'var(--camera-feed-chrome-color)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.75rem 1rem',
                            font: 'inherit',
                            maxWidth: 'min(100%, 280px)',
                        }}
                    >
                        <Video
                            size={40}
                            style={{
                                marginBottom: '0.5rem',
                                opacity: 'var(--camera-feed-chrome-icon-opacity, 0.55)',
                                filter: 'var(--camera-feed-icon-filter, drop-shadow(0 1px 2px rgba(0,0,0,0.35)))',
                                transition: 'filter var(--theme-crossfade-duration) var(--theme-crossfade-ease)',
                                display: 'block',
                                marginLeft: 'auto',
                                marginRight: 'auto',
                            }}
                            aria-hidden
                        />
                        <p
                            style={{
                                fontFamily: 'var(--font-heading)',
                                fontSize: '0.85rem',
                                margin: 0,
                                fontWeight: 600,
                                letterSpacing: '-0.02em',
                            }}
                        >
                            {cameraLabel}
                        </p>
                        <p style={{ fontSize: '0.72rem', margin: '0.25rem 0 0', color: 'var(--camera-feed-chrome-muted)' }}>{cameraZone}</p>
                    </button>
                ) : null}

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
                            <button type="button" style={labelBtnStyle} onClick={openConnectModal} aria-label={t('dashboard.camera_connect.open_aria')}>
                                {cameraLabel}
                            </button>
                        </div>

                        <div
                            style={{
                                position: 'absolute',
                                bottom: '1rem',
                                right: '1rem',
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'flex-end',
                                gap: '0.5rem',
                                maxWidth: 'calc(100% - 2rem)',
                                zIndex: 20,
                            }}
                        >
                            <button
                                type="button"
                                style={{
                                    ...btnBase,
                                    opacity: hasMediaLayer && !streamLoadError ? 1 : 0.42,
                                }}
                                disabled={!hasMediaLayer || streamLoadError}
                                aria-label={t('dashboard.camera_capture.screenshot_aria')}
                                title={t('dashboard.camera_capture.screenshot')}
                                onClick={takeScreenshot}
                            >
                                <Camera size={16} aria-hidden />
                            </button>
                            <button
                                type="button"
                                style={{
                                    ...btnBase,
                                    opacity: hasMediaLayer && !streamLoadError ? 1 : 0.42,
                                    borderColor: recording ? 'rgba(239,68,68,0.55)' : 'var(--camera-feed-btn-border)',
                                    background: recording ? 'rgba(239,68,68,0.18)' : 'var(--camera-feed-btn-bg)',
                                    color: recording ? '#fecaca' : 'var(--camera-feed-btn-color)',
                                }}
                                disabled={!hasMediaLayer || streamLoadError}
                                aria-label={recording ? t('dashboard.camera_capture.record_stop_aria') : t('dashboard.camera_capture.record_start_aria')}
                                aria-pressed={recording}
                                title={recording ? t('dashboard.camera_capture.record_stop') : t('dashboard.camera_capture.record_start')}
                                onClick={toggleRecording}
                            >
                                <Circle size={16} fill={recording ? 'currentColor' : 'none'} aria-hidden />
                            </button>
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
        </>
    )
})

export default memo(CameraFeed)
