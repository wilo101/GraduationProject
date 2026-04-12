import React, { useEffect, useMemo, useRef, useState } from 'react'
import diagnosticsPrintWindowCss from '../styles/diagnostics-print-window.css?raw'
import {
    CheckCircle,
    Cpu,
    Activity,
    Wifi,
    Battery,
    Eye,
    Cog,
    Play,
    XCircle,
    ShieldCheck,
    Printer,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

const getSystemsSeed = (t) => [
    { id: 1, name: t('diagnostics.systems.core'), icon: Cpu },
    { id: 2, name: t('diagnostics.systems.sensors'), icon: Activity },
    { id: 3, name: t('diagnostics.systems.motors'), icon: Cog },
    { id: 4, name: t('diagnostics.systems.cameras'), icon: Eye },
    { id: 5, name: t('diagnostics.systems.wifi'), icon: Wifi },
    { id: 6, name: t('diagnostics.systems.power'), icon: Battery },
]

export default function SystemDiagnostics() {
    const { t } = useTranslation();
    const systemsSeed = useMemo(() => getSystemsSeed(t), [t]);
    
    const [activeItem, setActiveItem] = useState(0)
    const [running, setRunning] = useState(false)
    const [lastRunAt, setLastRunAt] = useState(null)
    const [runStartedAt, setRunStartedAt] = useState(null)
    const [results, setResults] = useState(() =>
        systemsSeed.map((s) => ({ id: s.id, status: 'pending', note: '', errorCode: '', explanation: '' }))
    )
    const [mode, setMode] = useState('idle') // 'idle' | 'all' | 'single'
    const [targetId, setTargetId] = useState(null)
    const [expandedRows, setExpandedRows] = useState({})
    const timerRef = useRef(null)
    const printReportRef = useRef(null)

    const progress = useMemo(() => Math.min(Math.round((activeItem / systemsSeed.length) * 100), 100), [activeItem])
    const complete = activeItem >= systemsSeed.length && !running
    const eta = useMemo(() => {
        if (!running) return null
        const remaining = Math.max(0, systemsSeed.length - activeItem)
        // Avoid float jitter (e.g. 4.800000000000001) that stretches KPI tiles
        const seconds = Number((remaining * 0.8).toFixed(1))
        return `${seconds}s`
    }, [running, activeItem, systemsSeed.length])

    const overallResult = useMemo(() => {
        if (!complete) return '—'
        const anyFail = results.some((r) => r.status === 'fail')
        return anyFail ? 'fail' : 'pass'
    }, [complete, results])

    const passCount = useMemo(() => results.filter((r) => r.status === 'pass').length, [results])
    const failCount = useMemo(() => results.filter((r) => r.status === 'fail').length, [results])

    const subsystemSummaryText = useMemo(() => {
        if (running) return t('diagnostics.summary.live')
        if (!complete) return t('diagnostics.summary.idle')
        if (failCount > 0) return `${failCount} failed · ${passCount} passed — action required`
        return t('diagnostics.summary.nominal')
    }, [running, complete, failCount, passCount, t])

    const reportDocId = useMemo(() => {
        if (!lastRunAt) return '—'
        const d = lastRunAt
        const pad = (n) => String(n).padStart(2, '0')
        return `DIAG-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
    }, [lastRunAt])

    const durationLabel = useMemo(() => {
        if (!runStartedAt || !lastRunAt) return '—'
        const ms = Math.max(0, lastRunAt.getTime() - runStartedAt.getTime())
        if (ms < 1000) return `${ms} ms`
        const s = (ms / 1000).toFixed(1)
        return `${s} s`
    }, [runStartedAt, lastRunAt])

    const stop = () => {
        setRunning(false)
        setMode('idle')
        setTargetId(null)
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
    }

    const finalizeSubsystem = (sysId) => {
        const fail = Math.random() < 0.18
        const failCatalog = {
            1: { code: 'CPU-TEMP-221', exp: 'Core temperature spikes under load. Cooling path may be obstructed.' },
            2: { code: 'SNS-BUS-104', exp: 'Sensor bus response timed out. One or more probes did not answer in time.' },
            3: { code: 'MTR-CAL-305', exp: 'Drive motor calibration drift exceeded tolerance. Traction may be uneven.' },
            4: { code: 'CAM-FRM-409', exp: 'Frame acquisition dropped repeatedly. Lens path or stream encoder needs inspection.' },
            5: { code: 'RF-LINK-502', exp: 'Wireless uplink packet loss is unstable. Control lag may occur.' },
            6: { code: 'PWR-CELL-118', exp: 'Cell balancing is outside nominal range. Runtime may be reduced.' },
        }
        const failData = failCatalog[sysId] || { code: 'GEN-500', exp: 'Subsystem check failed due to an unknown fault.' }
        setResults((cur) =>
            cur.map((r) =>
                r.id === sysId
                    ? {
                          ...r,
                          status: fail ? 'fail' : 'pass',
                          note: fail ? 'Diagnostic check failed. Review details below.' : 'Operational within nominal thresholds.',
                          errorCode: fail ? failData.code : '',
                          explanation: fail ? failData.exp : '',
                      }
                    : r
            )
        )
        if (fail) setExpandedRows((cur) => ({ ...cur, [sysId]: true }))
    }

    const startAll = () => {
        // Run ONLY on click.
        stop()
        setMode('all')
        setTargetId(null)
        setActiveItem(0)
        setRunning(true)
        setLastRunAt(new Date())
        setRunStartedAt(new Date())
        setExpandedRows({})
        setResults(systemsSeed.map((s) => ({ id: s.id, status: 'pending', note: '', errorCode: '', explanation: '' })))

        timerRef.current = setInterval(() => {
            setActiveItem((prev) => {
                const next = prev + 1
                if (prev < systemsSeed.length) finalizeSubsystem(systemsSeed[prev].id)
                if (next >= systemsSeed.length) {
                    setTimeout(() => stop(), 250)
                    return systemsSeed.length
                }
                return next
            })
        }, 820)
    }

    const startSingle = (sysId) => {
        // Run ONLY on click.
        stop()
        setMode('single')
        setTargetId(sysId)
        setActiveItem(0)
        setRunning(true)
        setLastRunAt(new Date())
        setRunStartedAt(new Date())
        // keep other results as-is, but reset selected to pending for this run
        setExpandedRows((cur) => ({ ...cur, [sysId]: false }))
        setResults((cur) => cur.map((r) => (r.id === sysId ? { ...r, status: 'pending', note: '', errorCode: '', explanation: '' } : r)))

        // single check “runs” for a short duration
        timerRef.current = setTimeout(() => {
            finalizeSubsystem(sysId)
            setActiveItem(systemsSeed.length) // show 100% ring for completion
            setTimeout(() => stop(), 250)
        }, 1100)
    }

    const exportReport = () => {
        if (!complete) return
        const el = printReportRef.current
        if (!el) return

        const clone = el.cloneNode(true)
        clone.removeAttribute('aria-hidden')
        const html = clone.outerHTML

        const w = window.open('', 'diag-export', 'noopener,noreferrer,width=100,height=80')
        if (!w) {
            void el.offsetHeight
            requestAnimationFrame(() => window.print())
            return
        }

        const doc = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Diagnostics report</title><style>${diagnosticsPrintWindowCss}</style></head><body>${html}</body></html>`
        w.document.open()
        w.document.write(doc)
        w.document.close()

        const onAfterPrint = () => {
            w.removeEventListener('afterprint', onAfterPrint)
            w.close()
        }
        w.addEventListener('afterprint', onAfterPrint)

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                try {
                    w.focus()
                    w.print()
                } catch {
                    w.removeEventListener('afterprint', onAfterPrint)
                    w.close()
                    requestAnimationFrame(() => window.print())
                }
            })
        })
    }

    useEffect(() => () => stop(), [])

    return (
        <div className="fade-in diag-page ops-page-wrap">
            <header className="diag-hero">
                <div>
                    <h1 className="diag-h1">{t('diagnostics.title')}</h1>
                    <p className="diag-sub">
                        {t('diagnostics.description')} <bdi>only</bdi> when you click{' '}
                        <bdi>{t('diagnostics.description_bold')}</bdi>.
                    </p>
                </div>

                <div className="diag-actions">
                    <button
                        className="auth-primary-btn"
                        type="button"
                        onClick={startAll}
                        disabled={running}
                        style={{ width: 'auto', padding: '0.9rem 1.15rem' }}
                    >
                        <Play size={18} aria-hidden />
                        {running ? t('diagnostics.actions.running') : t('diagnostics.actions.run_all')}
                    </button>
                    <button
                        className="auth-social-btn"
                        type="button"
                        onClick={stop}
                        disabled={!running}
                        style={{ width: 'auto', padding: '0.9rem 1.15rem', opacity: running ? 1 : 0.55 }}
                    >
                        <XCircle size={18} aria-hidden />
                        {t('diagnostics.actions.stop')}
                    </button>
                    <button
                        className="auth-social-btn"
                        type="button"
                        disabled={!complete}
                        onClick={exportReport}
                        style={{ width: 'auto', padding: '0.9rem 1.15rem', opacity: complete ? 1 : 0.55 }}
                        aria-label="Print diagnostics report"
                    >
                        <Printer size={18} aria-hidden />
                        {t('diagnostics.actions.export')}
                    </button>
                </div>
            </header>

            <div className="diag-ops-frame">
                <div className="diag-ops-frame__accent" aria-hidden />
                <div className="diag-grid">
                <section className="glass-panel diag-card" aria-label="Run summary">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span className="diag-status-chip">
                            <span className={`diag-dot${running ? ' diag-dot--running' : ''}`} aria-hidden />
                            {running ? t('diagnostics.status.running') : complete ? t('diagnostics.status.complete') : t('diagnostics.status.ready')}
                        </span>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {lastRunAt ? `${t('diagnostics.status.last_run')}${lastRunAt.toLocaleString()}` : t('diagnostics.status.no_runs')}
                        </div>
                    </div>

                    <div style={{ marginTop: '1.15rem' }}>
                        <div className="diag-ring" aria-label="Progress ring">
                            <div className="diag-ring-inner">
                                <div className="diag-progress">{progress}%</div>
                                <div className="diag-progress-sub">{running ? t('diagnostics.status.scanning') : complete ? t('diagnostics.status.complete').toUpperCase() : t('diagnostics.status.idle')}</div>
                            </div>
                        </div>
                    </div>

                    <div className="diag-kpis">
                        <div className="diag-kpi">
                            <div className="diag-kpi-label">{t('diagnostics.kpi.subsystems')}</div>
                            <div className="diag-kpi-value">
                                {Math.min(activeItem, systemsSeed.length)}/{systemsSeed.length}
                            </div>
                        </div>
                        <div className="diag-kpi">
                            <div className="diag-kpi-label">{t('diagnostics.kpi.eta')}</div>
                            <div className="diag-kpi-value">{eta || '—'}</div>
                        </div>
                        <div className="diag-kpi">
                            <div className="diag-kpi-label">{t('diagnostics.kpi.mode')}</div>
                            <div className="diag-kpi-value">{running ? (mode === 'single' ? 'single' : 'all') : 'idle'}</div>
                        </div>
                        <div className="diag-kpi">
                            <div className="diag-kpi-label">{t('diagnostics.kpi.result')}</div>
                            <div className="diag-kpi-value">{complete ? overallResult : '—'}</div>
                        </div>
                    </div>
                </section>

                <section className="glass-panel diag-card" aria-label="Subsystem results">
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.9rem' }}>
                        <div style={{ fontWeight: 800, fontFamily: 'var(--font-heading)' }}>{t('diagnostics.results_title')}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'end' }}>{subsystemSummaryText}</div>
                    </div>

                    <div className="diag-list">
                        {systemsSeed.map((sys, index) => {
                            const isCompleteAll = mode === 'all' && index < activeItem
                            const isScanningAll = mode === 'all' && running && index === activeItem
                            const isScanningSingle = mode === 'single' && running && targetId === sys.id
                            const r = results.find((x) => x.id === sys.id)
                            const status = isCompleteAll ? r?.status ?? 'pass' : isScanningAll || isScanningSingle ? 'live' : r?.status || 'pending'
                            const canTest = !running

                            return (
                                <div key={sys.id} role="group" aria-label={sys.name}>
                                    <div className={`diag-item${isScanningAll || isScanningSingle ? ' diag-item--active' : ''}`}>
                                        <div
                                            className={`diag-item-ico${status === 'pass' ? ' diag-item-ico--ok' : ''}`}
                                            aria-hidden
                                            style={
                                                status === 'fail'
                                                    ? {
                                                          background: 'rgba(239, 68, 68, 0.12)',
                                                          borderColor: 'rgba(239, 68, 68, 0.24)',
                                                          color: 'rgba(248, 113, 113, 0.95)',
                                                      }
                                                    : undefined
                                            }
                                        >
                                            <sys.icon size={18} />
                                        </div>
                                        <div className="diag-item-meta">
                                            <div className="diag-item-name">{sys.name}</div>
                                            <div className="diag-item-sub">
                                                {status === 'pass'
                                                    ? t('diagnostics.item.operational')
                                                    : status === 'fail'
                                                      ? t('diagnostics.item.failure')
                                                      : status === 'live'
                                                        ? t('diagnostics.item.analyzing')
                                                        : t('diagnostics.item.ready')}
                                            </div>
                                        </div>
                                        <div className="diag-right" aria-label="الحالة" style={{ gap: '0.5rem' }}>
                                            {status === 'pass' || status === 'fail' ? (
                                                <>
                                                    {status === 'fail' ? (
                                                        <XCircle size={18} color="#f87171" aria-hidden />
                                                    ) : (
                                                        <CheckCircle size={18} color="#2dd4bf" aria-hidden />
                                                    )}
                                                    {status === 'fail' ? t('diagnostics.item.fail') : t('diagnostics.item.pass')}
                                                </>
                                            ) : status === 'live' ? (
                                                <>
                                                    <span className="diag-spin" aria-hidden />
                                                    {t('diagnostics.item.live')}
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        type="button"
                                                        className="auth-social-btn"
                                                        disabled={!canTest}
                                                        onClick={() => startSingle(sys.id)}
                                                        style={{ width: 'auto', padding: '0.55rem 0.75rem', opacity: canTest ? 1 : 0.55 }}
                                                    >
                                                        {t('diagnostics.item.test')}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    {status === 'fail' ? (
                                        <div className="glass-card diag-error-detail" style={{ marginTop: '0.45rem', padding: '0.75rem 0.9rem', borderRadius: 12 }}>
                                            <div className="diag-error-detail__code">
                                                {t('diagnostics.item.error_code')} {r?.errorCode || '—'}
                                            </div>
                                            {expandedRows[sys.id] ? (
                                                <div className="diag-error-detail__msg">
                                                    {r?.explanation || 'Subsystem failed to complete its integrity check.'}
                                                </div>
                                            ) : null}
                                            <div style={{ marginTop: '0.55rem', display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    type="button"
                                                    className="auth-social-btn"
                                                    onClick={() => setExpandedRows((cur) => ({ ...cur, [sys.id]: !cur[sys.id] }))}
                                                    style={{ width: 'auto', padding: '0.45rem 0.65rem' }}
                                                >
                                                    {expandedRows[sys.id] ? t('diagnostics.item.hide_details') : t('diagnostics.item.show_details')}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="auth-primary-btn"
                                                    disabled={!canTest}
                                                    onClick={() => startSingle(sys.id)}
                                                    style={{ width: 'auto', padding: '0.45rem 0.65rem' }}
                                                >
                                                    {t('diagnostics.item.retry')}
                                                </button>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            )
                        })}
                    </div>
                </section>
                </div>
            </div>

            {/* Print / PDF certificate (off-screen; shown for print + PDF capture) */}
            <section ref={printReportRef} id="diag-print-report" className="diag-report" aria-hidden="true">
                <header className="diag-rpt-header diag-rpt-block">
                    <div className="diag-rpt-brand">
                        <div className="diag-rpt-seal" aria-hidden>
                            <ShieldCheck size={22} strokeWidth={2} />
                        </div>
                        <div>
                            <div className="diag-rpt-kicker">Augustus OS · Subsystem integrity</div>
                            <h1 className="diag-rpt-title">Field diagnostics certificate</h1>
                            <p className="diag-rpt-subtitle">
                                Structured attestation of automated hardware and software checks performed from the operator console.
                            </p>
                        </div>
                    </div>
                    <dl className="diag-rpt-docmeta">
                        <div>
                            <dt>Document reference</dt>
                            <dd className="diag-rpt-mono">{reportDocId}</dd>
                        </div>
                        <div>
                            <dt>Issued (local)</dt>
                            <dd>{lastRunAt ? lastRunAt.toLocaleString() : '—'}</dd>
                        </div>
                        <div>
                            <dt>Scope</dt>
                            <dd>
                                {systemsSeed.length} subsystems · duration {durationLabel}
                            </dd>
                        </div>
                        <div>
                            <dt>Disposition</dt>
                            <dd>
                                <span
                                    className={`diag-rpt-pill ${overallResult === 'fail' ? 'diag-rpt-pill--fail' : overallResult === 'pass' ? 'diag-rpt-pill--pass' : ''}`}
                                >
                                    {complete ? (overallResult === 'pass' ? 'NOMINAL' : 'ATTENTION REQUIRED') : '—'}
                                </span>
                            </dd>
                        </div>
                    </dl>
                </header>

                <div className="diag-rpt-rule" />

                <section className="diag-rpt-exec diag-rpt-block">
                    <h2 className="diag-rpt-h2">Executive summary</h2>
                    <p className="diag-rpt-prose">
                        {complete
                            ? overallResult === 'pass'
                                ? 'All evaluated subsystems completed within nominal thresholds. No corrective maintenance is indicated from this automated sweep.'
                                : `One or more subsystems reported out-of-tolerance conditions (${failCount} failure${failCount === 1 ? '' : 's'}). Remediation should follow the fault codes and narrative findings in the register below before field deployment.`
                            : 'No completed run is available for this certificate.'}
                    </p>
                    <ul className="diag-rpt-facts">
                        <li>
                            <span>Run window</span>
                            <strong>
                                {runStartedAt ? runStartedAt.toLocaleString() : '—'} → {lastRunAt ? lastRunAt.toLocaleString() : '—'}
                            </strong>
                        </li>
                        <li>
                            <span>Outcome tally</span>
                            <strong>
                                {passCount} pass · {failCount} fail · {systemsSeed.length} inspected
                            </strong>
                        </li>
                        <li>
                            <span>Overall verdict</span>
                            <strong className="diag-rpt-mono">{complete ? overallResult.toUpperCase() : '—'}</strong>
                        </li>
                    </ul>
                </section>

                <section className="diag-rpt-block">
                    <h2 className="diag-rpt-h2">Subsystem register</h2>
                    <p className="diag-rpt-table-caption">Each line reflects the last completed evaluation for that subsystem in this run.</p>
                    <table className="diag-rpt-table">
                        <thead>
                            <tr>
                                <th>Subsystem</th>
                                <th>Status</th>
                                <th>Fault code</th>
                                <th>Finding / operator note</th>
                            </tr>
                        </thead>
                        <tbody>
                            {systemsSeed.map((s) => {
                                const r = results.find((x) => x.id === s.id)
                                const status = r?.status || 'pending'
                                const pillClass =
                                    status === 'fail' ? 'diag-rpt-pill diag-rpt-pill--fail' : status === 'pass' ? 'diag-rpt-pill diag-rpt-pill--pass' : 'diag-rpt-pill'
                                return (
                                    <tr key={s.id}>
                                        <td className="diag-rpt-strong">{s.name}</td>
                                        <td>
                                            <span className={pillClass}>{status}</span>
                                        </td>
                                        <td className="diag-rpt-mono diag-rpt-code">{r?.errorCode || '—'}</td>
                                        <td>
                                            {status === 'fail' && r?.explanation ? (
                                                <>
                                                    <span className="diag-rpt-muted">{r.note}</span>
                                                    <br />
                                                    <span>{r.explanation}</span>
                                                </>
                                            ) : (
                                                r?.note || '—'
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </section>

                <footer className="diag-rpt-footer diag-rpt-block">
                    <p className="diag-rpt-prose diag-rpt-muted">
                        This document is generated from operator-initiated diagnostics. It does not replace manufacturer service bulletins,
                        on-site inspection, or calibrated bench tests. Retain with mission logs for traceability.
                    </p>
                    <div className="diag-rpt-signoff">
                        <div className="diag-rpt-line" />
                        <div>
                            <div className="diag-rpt-sign-label">Technical record</div>
                            <div className="diag-rpt-mono">{reportDocId}</div>
                        </div>
                    </div>
                </footer>
            </section>
        </div>
    )
}

