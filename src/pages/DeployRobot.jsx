import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Zap,
    Video,
    Mic,
    Maximize2,
    Activity,
    Wifi,
    Link2,
    Radio,
    Keyboard,
    Crosshair,
    AlertTriangle,
    X,
} from 'lucide-react';
import CameraFeed from '../components/CameraFeed';
import '../styles/deploy-control.css';

const TRAVEL_PX = 28; // medium stick: (128 - 56) / 2

const DeployRobot = () => {
    const [isEngaged, setIsEngaged] = useState(false);
    const [stick, setStick] = useState({ x: 0, y: 0 });
    const [dpad, setDpad] = useState({ up: false, down: false, left: false, right: false });
    const [lastCmd, setLastCmd] = useState('idle');
    const [speed, setSpeed] = useState('normal');
    const [latencyMs, setLatencyMs] = useState(24);
    const [packetLoss, setPacketLoss] = useState(0);
    const [commandLog, setCommandLog] = useState([]);
    const [sendingState, setSendingState] = useState('idle');
    const [robotConnected, setRobotConnected] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [undoToast, setUndoToast] = useState(null);
    const [feedOnline, setFeedOnline] = useState(false);
    const [micLive, setMicLive] = useState(false);
    const [focusMode, setFocusMode] = useState(false);
    const [focusCamId, setFocusCamId] = useState('cam-01');
    const [alertPulse, setAlertPulse] = useState(false);
    const [lastSeenAt] = useState(() => Date.now() - 3 * 60 * 1000);
    const [nowTick, setNowTick] = useState(Date.now());
    const [stickDragging, setStickDragging] = useState(false);

    const stickBaseRef = useRef(null);
    const draggingRef = useRef(false);
    const returnAnimRef = useRef(0);
    const repeatTimerRef = useRef(null);
    const activeDpadDirRef = useRef(null);
    const arrowKeysRef = useRef({ up: false, down: false, left: false, right: false });
    const cmdRef = useRef('idle');
    const cmdRafRef = useRef(0);
    const stickGeomRef = useRef(null);
    const ackTimerRef = useRef(0);
    const connectTimerRef = useRef(0);
    const undoTimerRef = useRef(0);
    const lastMovementRef = useRef(null);
    const keysRef = useRef({ w: false, a: false, s: false, d: false });
    const wasdRafRef = useRef(0);
    const cameraFeedRef = useRef(null);

    const focusCameras = useMemo(
        () => [
            { id: 'cam-01', name: 'Perimeter cam 01', zone: 'Gate lane', health: 'stable' },
            { id: 'cam-02', name: 'Thermal cam 02', zone: 'Storage north', health: 'warning' },
            { id: 'cam-03', name: 'Dock cam 03', zone: 'Loading dock', health: 'stable' },
            { id: 'cam-04', name: 'Aerial relay 04', zone: 'Access road', health: 'stable' },
        ],
        []
    );

    const handleEngage = () => {
        if (!canEngage) return;
        setIsEngaged(!isEngaged);
    };

    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const speedScale = speed === 'slow' ? 0.45 : speed === 'turbo' ? 1.25 : 0.85;

    const stickMag = useMemo(() => Math.min(1, Math.hypot(stick.x, stick.y)), [stick]);
    const liveSpeedMs = useMemo(() => Number((stickMag * 1.8 * speedScale).toFixed(2)), [stickMag, speedScale]);
    const headingDeg = useMemo(() => {
        if (stickMag < 0.02) return 0;
        const deg = (Math.atan2(-stick.y, stick.x) * 180) / Math.PI;
        return Math.round((deg + 360) % 360);
    }, [stickMag, stick.x, stick.y]);

    const ringBorder = useMemo(() => {
        if (stickMag >= 0.78) return 'rgba(239, 68, 68, 0.55)';
        if (stickMag >= 0.42) return 'rgba(245, 158, 11, 0.55)';
        return 'rgba(255, 255, 255, 0.12)';
    }, [stickMag]);

    const stickPx = useMemo(() => ({ x: stick.x * TRAVEL_PX, y: stick.y * TRAVEL_PX }), [stick]);

    const clearRepeat = () => {
        if (repeatTimerRef.current) {
            clearInterval(repeatTimerRef.current);
            repeatTimerRef.current = null;
        }
        activeDpadDirRef.current = null;
    };

    const flushCmd = () => {
        cancelAnimationFrame(cmdRafRef.current);
        setLastCmd(cmdRef.current);
    };

    const sendCommand = (cmd, payload) => {
        cmdRef.current = payload ? `${cmd} ${JSON.stringify(payload)}` : cmd;
        setCommandLog((cur) => {
            const entry = payload ? `${cmd}` : `${cmd}`;
            return [entry, ...cur].slice(0, 3);
        });
        setSendingState('sending');
        window.clearTimeout(ackTimerRef.current);
        ackTimerRef.current = window.setTimeout(() => setSendingState('ack'), 260);
        if (cmd === 'drive' || cmd === 'adjust') {
            lastMovementRef.current = { cmd, payload };
            setUndoToast({ cmd, ts: Date.now() });
            window.clearTimeout(undoTimerRef.current);
            undoTimerRef.current = window.setTimeout(() => setUndoToast(null), 3000);
        }
        cancelAnimationFrame(cmdRafRef.current);
        cmdRafRef.current = requestAnimationFrame(flushCmd);
    };

    const applyDriveVector = (x, y) => {
        const px = Number((x * speedScale).toFixed(2));
        const py = Number(((-y) * speedScale).toFixed(2));
        setStick({ x, y });
        if (isEngaged) {
            sendCommand('drive', { x: px, y: py, speed });
        } else {
            cmdRef.current = `preview drive ${JSON.stringify({ x: px, y: py, speed })}`;
            cancelAnimationFrame(cmdRafRef.current);
            cmdRafRef.current = requestAnimationFrame(flushCmd);
        }
    };

    const updateStickFromPoint = (clientX, clientY) => {
        const geom = stickGeomRef.current;
        if (!geom) return;
        const dx = clientX - geom.cx;
        const dy = clientY - geom.cy;
        const r = geom.r;
        const dist = Math.hypot(dx, dy) || 1;
        const px = dist > r ? (dx / dist) * r : dx;
        const py = dist > r ? (dy / dist) * r : dy;
        const nnx = clamp(px / r, -1, 1);
        const nny = clamp(py / r, -1, 1);
        applyDriveVector(nnx, nny);
    };

    const animateStickHome = () => {
        cancelAnimationFrame(returnAnimRef.current);
        const step = () => {
            setStick((s) => {
                const k = 0.22;
                const nx = Math.abs(s.x) < 0.01 ? 0 : s.x * (1 - k);
                const ny = Math.abs(s.y) < 0.01 ? 0 : s.y * (1 - k);
                if (nx === 0 && ny === 0) return { x: 0, y: 0 };
                return { x: nx, y: ny };
            });
            returnAnimRef.current = requestAnimationFrame(step);
        };
        returnAnimRef.current = requestAnimationFrame(step);
    };

    const startDpad = (dir) => {
        if (activeDpadDirRef.current === dir && repeatTimerRef.current) return;
        clearRepeat();
        activeDpadDirRef.current = dir;
        setDpad({ up: false, down: false, left: false, right: false, [dir]: true });
        if (isEngaged) {
            sendCommand('adjust', { dir });
            repeatTimerRef.current = setInterval(() => sendCommand('adjust', { dir }), 120);
        } else {
            cmdRef.current = `preview adjust ${JSON.stringify({ dir })}`;
            cancelAnimationFrame(cmdRafRef.current);
            cmdRafRef.current = requestAnimationFrame(flushCmd);
        }
    };

    const stopDpad = () => {
        clearRepeat();
        setDpad({ up: false, down: false, left: false, right: false });
        sendCommand('adjust', { dir: 'stop' });
    };

    const nextArrowDirection = () => {
        const k = arrowKeysRef.current;
        if (k.up) return 'up';
        if (k.down) return 'down';
        if (k.left) return 'left';
        if (k.right) return 'right';
        return null;
    };

    const stopMotion = () => {
        stopDpad();
        cancelAnimationFrame(returnAnimRef.current);
        setStick({ x: 0, y: 0 });
        sendCommand('drive', { x: 0, y: 0, speed });
    };

    const undoLastMovement = () => {
        const prev = lastMovementRef.current;
        if (!prev) return;
        sendCommand('undo', { previous: prev.cmd });
        stopMotion();
        setUndoToast(null);
    };

    useEffect(() => {
        const t = setInterval(() => {
            setLatencyMs((v) => clamp(Math.round(v + (Math.random() - 0.5) * 18), 18, 160));
            setPacketLoss((v) => clamp(Number((v + (Math.random() - 0.5) * 0.6).toFixed(1)), 0, 6));
            setNowTick(Date.now());
        }, 950);
        return () => clearInterval(t);
    }, []);

    const linkState = useMemo(() => {
        if (packetLoss >= 2.5 || latencyMs >= 120) return { label: 'DEGRADED', weak: true };
        if (packetLoss >= 1.0 || latencyMs >= 70) return { label: 'FAIR', weak: true };
        return { label: 'STRONG', weak: false };
    }, [latencyMs, packetLoss]);

    const canEngage = robotConnected && latencyMs < 100 && linkState.label === 'STRONG';
    const engageTooltip = canEngage ? 'Ready to engage' : 'Cannot engage — connection not confirmed';

    const latencyBad = latencyMs > 100;
    const latencyWarn = latencyMs > 70 && latencyMs <= 100;
    const lossBad = packetLoss > 1;
    const signalWeak = linkState.label !== 'STRONG';

    /* Good/neutral states use theme tokens so light mode stays readable (not ice-on-white). */
    const latencyColor = latencyBad ? '#f87171' : latencyWarn ? '#fbbf24' : 'var(--ops-metric-emphasis)';
    const lossColor = packetLoss > 2.5 ? '#f87171' : lossBad ? '#fbbf24' : 'var(--ops-metric-emphasis)';
    const signalColor = linkState.label === 'DEGRADED' ? '#f87171' : signalWeak ? '#fbbf24' : 'var(--ops-metric-emphasis)';
    const linkColor = robotConnected ? 'var(--ops-metric-emphasis)' : '#f87171';

    useEffect(() => {
        const strongEnough = latencyMs < 100 && linkState.label === 'STRONG';
        window.clearTimeout(connectTimerRef.current);
        if (strongEnough) {
            connectTimerRef.current = window.setTimeout(() => setRobotConnected(true), 900);
        } else {
            setRobotConnected(false);
            setIsEngaged(false);
        }
        return () => window.clearTimeout(connectTimerRef.current);
    }, [latencyMs, linkState.label]);

    useEffect(() => {
        localStorage.setItem('robot:isActive', isEngaged ? 'true' : 'false');
        window.dispatchEvent(new CustomEvent('robot:active', { detail: { active: isEngaged } }));
    }, [isEngaged]);

    const lastSeenMinutes = Math.max(1, Math.floor((nowTick - lastSeenAt) / 60_000));
    const activeFocusCamera = focusCameras.find((c) => c.id === focusCamId) || focusCameras[0];

    const computeWasdVector = () => {
        const k = keysRef.current;
        const x = (k.d ? 1 : 0) + (k.a ? -1 : 0);
        const y = (k.s ? 1 : 0) + (k.w ? -1 : 0);
        if (x === 0 && y === 0) return { x: 0, y: 0 };
        const len = Math.hypot(x, y) || 1;
        return { x: clamp(x / len, -1, 1), y: clamp(y / len, -1, 1) };
    };

    const syncStickToWasd = () => {
        cancelAnimationFrame(wasdRafRef.current);
        const v = computeWasdVector();
        if (v.x === 0 && v.y === 0) {
            animateStickHome();
            if (isEngaged) sendCommand('drive', { x: 0, y: 0 });
            return;
        }
        cancelAnimationFrame(returnAnimRef.current);
        applyDriveVector(v.x, v.y);
        wasdRafRef.current = requestAnimationFrame(syncStickToWasd);
    };

    useEffect(() => {
        const computeGeom = () => {
            const el = stickBaseRef.current;
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const knob = rect.width * (56 / 128);
            const r = Math.max(8, Math.min(rect.width, rect.height) / 2 - knob / 2);
            stickGeomRef.current = { cx, cy, r };
        };
        computeGeom();
        window.addEventListener('resize', computeGeom);

        const onKeyDown = (e) => {
            const code = e.code;
            if (code === 'Space') {
                e.preventDefault();
                stopMotion();
            }
            if (code === 'Escape') {
                e.preventDefault();
                setFocusMode(false);
                setIsEngaged(false);
                stopMotion();
            }
            if (code === 'ArrowUp' || code === 'ArrowDown' || code === 'ArrowLeft' || code === 'ArrowRight') {
                e.preventDefault();
            }
            if (code === 'ArrowUp') {
                arrowKeysRef.current.up = true;
                startDpad('up');
            }
            if (code === 'ArrowDown') {
                arrowKeysRef.current.down = true;
                startDpad('down');
            }
            if (code === 'ArrowLeft') {
                arrowKeysRef.current.left = true;
                startDpad('left');
            }
            if (code === 'ArrowRight') {
                arrowKeysRef.current.right = true;
                startDpad('right');
            }
            if (code === 'KeyW') keysRef.current.w = true;
            if (code === 'KeyA') keysRef.current.a = true;
            if (code === 'KeyS') keysRef.current.s = true;
            if (code === 'KeyD') keysRef.current.d = true;
            if (code === 'KeyW' || code === 'KeyA' || code === 'KeyS' || code === 'KeyD') {
                syncStickToWasd();
            }
        };
        const onKeyUp = (e) => {
            const code = e.code;
            if (code === 'ArrowUp' || code === 'ArrowDown' || code === 'ArrowLeft' || code === 'ArrowRight') {
                e.preventDefault();
                if (code === 'ArrowUp') arrowKeysRef.current.up = false;
                if (code === 'ArrowDown') arrowKeysRef.current.down = false;
                if (code === 'ArrowLeft') arrowKeysRef.current.left = false;
                if (code === 'ArrowRight') arrowKeysRef.current.right = false;
                const nextDir = nextArrowDirection();
                if (nextDir) startDpad(nextDir);
                else stopDpad();
            }
            if (code === 'KeyW') keysRef.current.w = false;
            if (code === 'KeyA') keysRef.current.a = false;
            if (code === 'KeyS') keysRef.current.s = false;
            if (code === 'KeyD') keysRef.current.d = false;
            if (code === 'KeyW' || code === 'KeyA' || code === 'KeyS' || code === 'KeyD') {
                syncStickToWasd();
            }
        };
        window.addEventListener('keydown', onKeyDown, { passive: false });
        window.addEventListener('keyup', onKeyUp);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('resize', computeGeom);
            clearRepeat();
            cancelAnimationFrame(returnAnimRef.current);
            cancelAnimationFrame(wasdRafRef.current);
            cancelAnimationFrame(cmdRafRef.current);
            window.clearTimeout(ackTimerRef.current);
            window.clearTimeout(connectTimerRef.current);
            window.clearTimeout(undoTimerRef.current);
        };
    }, []);

    const onFeedRetry = () => setFeedOnline(true);

    const openFocusMode = () => {
        setFocusMode(true);
    };

    const closeFocusMode = () => {
        setFocusMode(false);
    };

    const sendRobotAlert = () => {
        setAlertPulse(true);
        sendCommand('alert', { zone: activeFocusCamera.zone, camera: activeFocusCamera.name });
        window.setTimeout(() => setAlertPulse(false), 1200);
    };

    return (
        <div className="fade-in deploy-page ops-page-wrap">
            <header className="deploy-page__header">
                <div className="deploy-page__intro">
                    <span className="deploy-hero__kicker">Remote operations · Direct control</span>
                    <h1 className="deploy-hero__title">Manual Override</h1>
                    <p className="deploy-hero__lede">
                        Drive vector and fine adjust when autonomy is suspended. Engage only after link health is confirmed.
                    </p>
                </div>
                <div className="deploy-page__toolbar">
                    <div className={`deploy-hero__status${isEngaged ? ' deploy-hero__status--live' : ''}`} aria-live="polite">
                        <span className="deploy-hero__status-dot" aria-hidden />
                        {isEngaged ? 'Override live' : 'Standby'}
                    </div>
                    <span title={engageTooltip}>
                        <button
                            type="button"
                            onClick={handleEngage}
                            className={`mo-engage${isEngaged ? ' mo-engage--engaged' : ''} ${canEngage && !isEngaged ? 'deploy-engage--ready' : ''} ${!canEngage ? 'deploy-engage--disabled' : ''}`}
                            aria-pressed={isEngaged}
                            disabled={!canEngage}
                            data-tour="engage-btn"
                        >
                            <Zap size={16} fill={isEngaged ? 'currentColor' : 'none'} aria-hidden />
                            <span>{isEngaged ? 'Engaged' : 'Engage'}</span>
                        </button>
                    </span>
                </div>
            </header>

            <div className="deploy-control deploy-control--tactical">
                <div className="deploy-control__accent" aria-hidden />

            <div className="deploy-conn-strip" role="status" aria-label="Connection status">
                <div className="deploy-metric">
                    <Activity size={15} className="deploy-metric__ico" aria-hidden />
                    <span className="deploy-metric__label">Latency</span>
                    <span className="deploy-metric__value" style={{ color: latencyColor }}>
                        {latencyMs}
                        <span className="deploy-metric__unit">ms</span>
                    </span>
                </div>
                <div className="deploy-metric">
                    <Wifi size={15} className="deploy-metric__ico" aria-hidden />
                    <span className="deploy-metric__label">Loss</span>
                    <span className="deploy-metric__value" style={{ color: lossColor }}>
                        {packetLoss.toFixed(1)}
                        <span className="deploy-metric__unit">%</span>
                    </span>
                </div>
                <div className="deploy-metric">
                    <Radio size={15} className="deploy-metric__ico" aria-hidden />
                    <span className="deploy-metric__label">Signal</span>
                    <span className="deploy-metric__value" style={{ color: signalColor }}>
                        {linkState.label}
                    </span>
                </div>
                <div className="deploy-metric">
                    <Link2 size={15} className="deploy-metric__ico" aria-hidden />
                    <span className="deploy-metric__label">Link</span>
                    <span className="deploy-metric__value" style={{ color: linkColor }}>
                        {robotConnected ? 'Confirmed' : 'Unconfirmed'}
                    </span>
                </div>
            </div>

            <div className={`deploy-feed-wrap ${feedOnline ? 'deploy-feed-wrap--online' : 'deploy-feed-wrap--offline'}`}>
                {feedOnline ? (
                    <>
                        <div className="deploy-feed-online__chrome">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                                <span className="deploy-feed-online__live" aria-label="Live">
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} aria-hidden />
                                    LIVE
                                </span>
                                <span className="deploy-feed-online__cam-label">Perimeter cam 01</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.45rem' }}>
                                <button
                                    type="button"
                                    className="auth-social-btn"
                                    style={{
                                        width: 36,
                                        height: 36,
                                        padding: 0,
                                        borderRadius: '50%',
                                        borderColor: micLive ? 'rgba(34, 197, 94, 0.5)' : undefined,
                                        background: micLive ? 'rgba(34, 197, 94, 0.12)' : undefined,
                                    }}
                                    aria-label={micLive ? 'Mute microphone' : 'Unmute microphone'}
                                    aria-pressed={micLive}
                                    title={micLive ? 'Turn off microphone' : 'Two-way audio'}
                                    onClick={() => void cameraFeedRef.current?.toggleMic()}
                                >
                                    <Mic size={16} aria-hidden />
                                </button>
                                <button
                                    type="button"
                                    className="auth-social-btn"
                                    style={{ width: 36, height: 36, padding: 0, borderRadius: '50%' }}
                                    aria-label="Open focus monitor mode"
                                    title="Open focus monitor mode"
                                    onClick={openFocusMode}
                                >
                                    <Maximize2 size={16} aria-hidden />
                                </button>
                            </div>
                        </div>
                        <div className="deploy-feed-online__body">
                            <CameraFeed
                                ref={cameraFeedRef}
                                showChrome={false}
                                cameraLabel="Perimeter cam 01"
                                cameraZone="Gate lane"
                                onMicActiveChange={setMicLive}
                            />
                        </div>
                    </>
                ) : (
                    <div className="deploy-feed-offline">
                        <Video size={18} aria-hidden className="deploy-feed-offline__ico" />
                        <span className="deploy-feed-offline__text">
                            Camera unavailable · last seen {lastSeenMinutes}m ago
                        </span>
                        <button type="button" className="auth-social-btn" onClick={onFeedRetry} style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                            Retry
                        </button>
                    </div>
                )}
            </div>

            <section className="deploy-control-deck" aria-label="Manual control surfaces">
                <div className="deploy-deck__rail" aria-hidden>
                    <Crosshair size={14} aria-hidden />
                    <span>Control deck</span>
                </div>

                <div className="deploy-controls-grid">
                <div className="deploy-col">
                    <div
                        ref={stickBaseRef}
                        className="mo-stick-base--md mo-stick-base--tactical"
                        role="application"
                        aria-label="Drive joystick"
                        style={{ borderColor: ringBorder }}
                        onPointerDown={(e) => {
                            draggingRef.current = true;
                            setStickDragging(true);
                            cancelAnimationFrame(returnAnimRef.current);
                            e.currentTarget.setPointerCapture(e.pointerId);
                            const rect = e.currentTarget.getBoundingClientRect();
                            const knob = rect.width * (56 / 128);
                            stickGeomRef.current = {
                                cx: rect.left + rect.width / 2,
                                cy: rect.top + rect.height / 2,
                                r: Math.max(8, Math.min(rect.width, rect.height) / 2 - knob / 2),
                            };
                            updateStickFromPoint(e.clientX, e.clientY);
                        }}
                        onPointerMove={(e) => {
                            if (!draggingRef.current) return;
                            updateStickFromPoint(e.clientX, e.clientY);
                        }}
                        onPointerUp={() => {
                            draggingRef.current = false;
                            setStickDragging(false);
                            animateStickHome();
                            if (isEngaged) sendCommand('drive', { x: 0, y: 0 });
                        }}
                        onPointerCancel={() => {
                            draggingRef.current = false;
                            setStickDragging(false);
                            animateStickHome();
                            if (isEngaged) sendCommand('drive', { x: 0, y: 0 });
                        }}
                    >
                        <div
                            className={`mo-stick-knob--md${stickDragging ? ' mo-stick-knob--dragging' : ''}`}
                            style={{ transform: `translate3d(${stickPx.x}px, ${stickPx.y}px, 0)` }}
                            aria-hidden
                        />
                    </div>
                    <div className="mo-label">Drive</div>
                    <p className="deploy-vector-readout">
                        x={stick.x.toFixed(2)} y={(-stick.y).toFixed(2)}
                    </p>
                </div>

                <div className="deploy-col deploy-col--telemetry">
                    <div className="deploy-card deploy-tel-card">
                        <div className="deploy-tel-card__header">
                            <span className="deploy-tel-card__title">Telemetry</span>
                            <span className="deploy-tel-card__badge">Live</span>
                        </div>
                        <div className="deploy-tel-card__grid">
                            <div className="deploy-tel-stat">
                                <span className="deploy-tel-stat__label">Speed</span>
                                <span className="deploy-tel-stat__value">
                                    {liveSpeedMs.toFixed(2)}
                                    <span className="deploy-tel-stat__unit">m/s</span>
                                </span>
                            </div>
                            <div className="deploy-tel-stat deploy-tel-stat--heading">
                                <span className="deploy-tel-stat__label">Heading</span>
                                <span className="deploy-tel-stat__value deploy-tel-stat__value--deg">
                                    {headingDeg}
                                    <span className="deploy-tel-stat__unit">°</span>
                                </span>
                            </div>
                        </div>
                        <div className="deploy-tel-card__section">
                            <span className="deploy-tel-card__section-label">Movement log</span>
                            <div className="deploy-log">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="deploy-log__row">
                                        <span className="deploy-log__text">{commandLog[i] || '—'}</span>
                                        <span className="deploy-log__idx">#{i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="deploy-tel-card__footer">
                            {sendingState === 'sending' ? 'SENDING…' : sendingState === 'ack' ? 'ACK ✓' : 'IDLE'} · {lastCmd.slice(0, 42)}
                        </div>
                    </div>
                </div>

                <div className="deploy-col">
                    <div className="deploy-card deploy-dpad-card">
                        <div className="mo-dpad mo-dpad--md" aria-label="Adjust controls">
                            <button
                                type="button"
                                className={`mo-dpad-btn mo-dpad-up${dpad.up ? ' mo-dpad-btn--active' : ''}`}
                                onPointerDown={(e) => {
                                    e.currentTarget.setPointerCapture(e.pointerId);
                                    startDpad('up');
                                }}
                                onPointerUp={stopDpad}
                                onPointerCancel={stopDpad}
                                aria-label="Up"
                            >
                                <ArrowUp size={22} aria-hidden />
                            </button>
                            <button
                                type="button"
                                className={`mo-dpad-btn mo-dpad-down${dpad.down ? ' mo-dpad-btn--active' : ''}`}
                                onPointerDown={(e) => {
                                    e.currentTarget.setPointerCapture(e.pointerId);
                                    startDpad('down');
                                }}
                                onPointerUp={stopDpad}
                                onPointerCancel={stopDpad}
                                aria-label="Down"
                            >
                                <ArrowDown size={22} aria-hidden />
                            </button>
                            <button
                                type="button"
                                className={`mo-dpad-btn mo-dpad-left${dpad.left ? ' mo-dpad-btn--active' : ''}`}
                                onPointerDown={(e) => {
                                    e.currentTarget.setPointerCapture(e.pointerId);
                                    startDpad('left');
                                }}
                                onPointerUp={stopDpad}
                                onPointerCancel={stopDpad}
                                aria-label="Left"
                            >
                                <ArrowLeft size={22} aria-hidden />
                            </button>
                            <button
                                type="button"
                                className={`mo-dpad-btn mo-dpad-right${dpad.right ? ' mo-dpad-btn--active' : ''}`}
                                onPointerDown={(e) => {
                                    e.currentTarget.setPointerCapture(e.pointerId);
                                    startDpad('right');
                                }}
                                onPointerUp={stopDpad}
                                onPointerCancel={stopDpad}
                                aria-label="Right"
                            >
                                <ArrowRight size={22} aria-hidden />
                            </button>
                            <div className="mo-dpad-center" aria-hidden />
                        </div>
                    </div>
                    <div className="mo-label">Adjust</div>

                    <div className="deploy-card deploy-speed-card">
                        <div className="deploy-speed-card__label">Speed profile</div>
                        <div className="deploy-speed-seg" role="group" aria-label="Speed profile">
                            {['slow', 'normal', 'turbo'].map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    className={`deploy-speed-btn${speed === s ? ' deploy-speed-btn--active' : ''}`}
                                    onClick={() => setSpeed(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            </section>

            </div>

            {focusMode ? (
                <section className="deploy-focus-overlay" aria-label="Focus monitoring mode">
                    <div className="deploy-focus-shell">
                        <header className="deploy-focus-header">
                            <div>
                                <span className="deploy-focus-kicker">Focused monitoring mode</span>
                                <h2 className="deploy-focus-title">{activeFocusCamera.name}</h2>
                                <p className="deploy-focus-sub">Live follow-up on {activeFocusCamera.zone}</p>
                            </div>
                            <button type="button" className="auth-social-btn deploy-focus-close" onClick={closeFocusMode}>
                                <X size={17} aria-hidden />
                                Close focus
                            </button>
                        </header>

                        <div className="deploy-focus-grid">
                            <div className="deploy-focus-main">
                                <CameraFeed showChrome={false} cameraLabel={activeFocusCamera.name} cameraZone={activeFocusCamera.zone} />
                            </div>
                            <aside className="deploy-focus-side">
                                <div className="deploy-focus-card">
                                    <div className="deploy-focus-card__title">Robot status</div>
                                    <div className="deploy-focus-stat">
                                        <span>Mode</span>
                                        <strong>{isEngaged ? 'Manual override' : 'Standby'}</strong>
                                    </div>
                                    <div className="deploy-focus-stat">
                                        <span>Signal</span>
                                        <strong>{linkState.label}</strong>
                                    </div>
                                    <div className="deploy-focus-stat">
                                        <span>Latency</span>
                                        <strong>{latencyMs} ms</strong>
                                    </div>
                                    <div className="deploy-focus-stat">
                                        <span>Packet loss</span>
                                        <strong>{packetLoss.toFixed(1)}%</strong>
                                    </div>
                                </div>

                                <div className={`deploy-focus-card deploy-focus-card--alert${alertPulse ? ' deploy-focus-card--alerting' : ''}`}>
                                    <div className="deploy-focus-card__title">Operator actions</div>
                                    <button type="button" className="deploy-focus-alert-btn" onClick={sendRobotAlert}>
                                        <AlertTriangle size={16} aria-hidden />
                                        Send robot alert
                                    </button>
                                    <button type="button" className="auth-social-btn" onClick={() => setIsEngaged(false)} style={{ width: '100%' }}>
                                        Force standby
                                    </button>
                                </div>
                            </aside>
                        </div>

                        <div className="deploy-focus-cams" aria-label="Additional cameras">
                            {focusCameras.map((cam) => (
                                <button
                                    key={cam.id}
                                    type="button"
                                    className={`deploy-focus-cam-tile${cam.id === focusCamId ? ' deploy-focus-cam-tile--active' : ''}`}
                                    onClick={() => setFocusCamId(cam.id)}
                                >
                                    <div className="deploy-focus-cam-preview">
                                        <CameraFeed showChrome={false} cameraLabel={cam.name} cameraZone={cam.zone} />
                                    </div>
                                    <div className="deploy-focus-cam-meta">
                                        <span>{cam.name}</span>
                                        <span>{cam.zone}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            ) : null}

            <div className="deploy-shortcuts-pill">
                <button type="button" className="deploy-shortcuts-pill__btn" onClick={() => setShowShortcuts((v) => !v)} aria-expanded={showShortcuts}>
                    <Keyboard size={15} aria-hidden className="deploy-shortcuts-pill__kbd" />
                    <span>↑↓←→ or WASD · Space stop · Esc disengage</span>
                    <span aria-hidden>{showShortcuts ? '▴' : '▾'}</span>
                </button>
                {showShortcuts ? (
                    <div className="deploy-shortcuts-pill__expand" role="region" aria-label="Keyboard shortcuts detail">
                        Arrow keys adjust the D-pad. WASD drives the analog stick. Space stops motion. Escape disengages and stops.
                    </div>
                ) : null}
            </div>

            {undoToast ? (
                <div
                    className="deploy-card"
                    role="status"
                    aria-label="Undo last movement"
                    style={{
                        position: 'fixed',
                        right: 22,
                        bottom: 72,
                        zIndex: 60,
                        padding: '0.65rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        background: 'rgba(22,24,28,0.98)',
                    }}
                >
                    <button type="button" className="auth-social-btn" onClick={undoLastMovement} style={{ padding: '0.35rem 0.6rem', width: 'auto', fontSize: '0.78rem' }}>
                        Undo
                    </button>
                </div>
            ) : null}
        </div>
    );
};

export default DeployRobot;
