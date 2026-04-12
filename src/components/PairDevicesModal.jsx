import React, { useEffect, useState } from 'react'
import { Bluetooth, Camera, Radio, X } from 'lucide-react'

const MOCK_DEVICES = [
    { id: 'cam-a', label: 'Camera · Dock A', icon: Camera, signal: '−42 dBm' },
    { id: 'rf-s1', label: 'Sensor pack · Sector 1', icon: Radio, signal: '−51 dBm' },
]

export default function PairDevicesModal({ open, onClose }) {
    const [scanning, setScanning] = useState(false)
    const [found, setFound] = useState([])
    const [paired, setPaired] = useState(() => new Set())

    useEffect(() => {
        if (!open) {
            setScanning(false)
            setFound([])
            setPaired(new Set())
        }
    }, [open])

    const runScan = () => {
        setScanning(true)
        setFound([])
        window.setTimeout(() => {
            setFound(MOCK_DEVICES)
            setScanning(false)
        }, 1100)
    }

    const togglePair = (id) => {
        setPaired((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    if (!open) return null

    return (
        <div
            className="pair-devices-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pair-devices-title"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose()
            }}
        >
            <div className="glass-panel pair-devices-modal" onMouseDown={(e) => e.stopPropagation()}>
                <div className="pair-devices-modal__head">
                    <div className="pair-devices-modal__title-wrap">
                        <Bluetooth size={22} aria-hidden className="pair-devices-modal__ico" />
                        <div>
                            <h2 id="pair-devices-title" className="pair-devices-modal__title">
                                View &amp; pair devices
                            </h2>
                            <p className="pair-devices-modal__lede">
                                Demo scan for on-site cameras and RF modules. Pairing is simulated for the console.
                            </p>
                        </div>
                    </div>
                    <button type="button" className="pair-devices-modal__close" onClick={onClose} aria-label="Close">
                        <X size={20} aria-hidden />
                    </button>
                </div>

                <div className="pair-devices-modal__actions">
                    <button
                        type="button"
                        className="account-form-btn account-form-btn--primary"
                        disabled={scanning}
                        onClick={runScan}
                    >
                        {scanning ? 'Scanning…' : 'Scan for devices'}
                    </button>
                </div>

                <ul className="pair-devices-list" aria-live="polite">
                    {found.length === 0 && !scanning ? (
                        <li className="pair-devices-list__empty">Run a scan to list discoverable devices.</li>
                    ) : null}
                    {scanning ? <li className="pair-devices-list__empty">Searching local link…</li> : null}
                    {found.map((d) => {
                        const Icon = d.icon
                        const isPaired = paired.has(d.id)
                        return (
                            <li key={d.id} className="pair-devices-list__row">
                                <div className="pair-devices-list__meta">
                                    <span className="pair-devices-list__ico">
                                        <Icon size={18} aria-hidden />
                                    </span>
                                    <div>
                                        <div className="pair-devices-list__name">{d.label}</div>
                                        <div className="pair-devices-list__sig">{d.signal}</div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className={`account-form-btn ${isPaired ? 'account-form-btn--secondary' : 'account-form-btn--primary'}`}
                                    onClick={() => togglePair(d.id)}
                                >
                                    {isPaired ? 'Unpair' : 'Pair'}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}
