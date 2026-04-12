import React, { useEffect, useMemo, useRef, useState } from 'react';
import CameraFeed from '../components/CameraFeed';
import StatusCard from '../components/StatusCard';
import HouseMap from '../components/HouseMap';
import PairDevicesModal from '../components/PairDevicesModal';
import { Scan } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const { t } = useTranslation()
    const [pairModalOpen, setPairModalOpen] = useState(false);
    // State for cards
    const [pressure, setPressure] = useState(65);
    const [dismissedAlerts, setDismissedAlerts] = useState({})

    const [nowTick, setNowTick] = useState(() => Date.now())
    useEffect(() => {
        const id = window.setInterval(() => setNowTick(Date.now()), 60_000)
        return () => window.clearInterval(id)
    }, [])
    const stationClock = useMemo(() => {
        const d = new Date(nowTick)
        return d.toLocaleString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }, [nowTick])

    const updatedRef = useRef({
        temp: Date.now(),
        battery: Date.now(),
        water: Date.now(),
        pressure: Date.now(),
    })
    const sensorValues = { temp: 24, battery: 82, water: 45, pressure }
    const sensorAlerts = [
        {
            id: 'battery',
            active: sensorValues.battery < 20,
            title: t('dashboard.alerts.battery_title'),
            actionHint: t('dashboard.alerts.battery_desc'),
            cta: t('dashboard.alerts.battery_cta'),
            onAction: () => window.dispatchEvent(new CustomEvent('robot:returnDock', { detail: { at: new Date().toISOString() } })),
        },
        {
            id: 'temp',
            active: sensorValues.temp >= 50,
            title: t('dashboard.alerts.temp_title'),
            actionHint: t('dashboard.alerts.temp_desc'),
        },
        {
            id: 'water',
            active: sensorValues.water <= 15,
            title: t('dashboard.alerts.water_title'),
            actionHint: t('dashboard.alerts.water_desc'),
        },
    ].filter((a) => a.active && !dismissedAlerts[a.id])

    return (
        <div className="fade-in dashboard-page ops-page-wrap">
            {sensorAlerts.length ? (
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {sensorAlerts.map((a) => (
                        <div
                            key={a.id}
                            className="glass-panel"
                            style={{
                                padding: '0.8rem 0.95rem',
                                borderRadius: 14,
                                border: '1px solid rgba(239,68,68,0.35)',
                                background: 'rgba(239,68,68,0.09)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '0.8rem',
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 800, color: 'rgba(254,202,202,0.98)' }}>{a.title}</div>
                                <div style={{ color: 'rgba(254,226,226,0.84)', fontSize: '0.86rem' }}>{a.actionHint}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {a.cta ? (
                                    <button
                                        type="button"
                                        className="auth-social-btn"
                                        onClick={a.onAction}
                                        style={{ width: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                                    >
                                        {a.cta}
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    className="auth-social-btn"
                                    onClick={() => setDismissedAlerts((s) => ({ ...s, [a.id]: true }))}
                                    style={{ width: 'auto', padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
                                >
                                    {t('dashboard.alerts.dismiss')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : null}

            <header className="ops-page-header">
                <div>
                    <h1 dir="auto" className="mixed-bidi ops-page-header__title">
                        {t('dashboard.title')}
                    </h1>
                    <p className="ops-page-header__kicker">{t('dashboard.station_time')} · {stationClock}</p>
                    <p className="ops-page-header__desc">
                        {t('dashboard.description')}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        type="button"
                        className="auth-social-btn"
                        style={{ width: 'auto', padding: '0.75rem 1.1rem' }}
                        onClick={() => setPairModalOpen(true)}
                    >
                        <Scan size={18} aria-hidden />
                        {t('dashboard.pair_devices')}
                    </button>
                </div>
            </header>

            <div className="ops-surface-frame">
                <div className="ops-surface-frame__accent" aria-hidden />
                <div className="dashboard-frame__inner">
                    <div className="dashboard-frame__grid">
                        <div className="dashboard-frame__camera">
                            <CameraFeed />
                        </div>
                        <div className="dashboard-frame__cards">
                            <StatusCard
                                type="temp"
                                label={t('dashboard.sensors.temp')}
                                value={String(sensorValues.temp)}
                                unit="°C"
                                threshold={50}
                                isInverseThreshold
                                maxValue={100}
                                updatedAt={updatedRef.current.temp}
                            />
                            <StatusCard
                                type="battery"
                                label={t('dashboard.sensors.battery')}
                                value={String(sensorValues.battery)}
                                unit="%"
                                threshold={20}
                                maxValue={100}
                                updatedAt={updatedRef.current.battery}
                            />
                            <StatusCard
                                type="water"
                                label={t('dashboard.sensors.water')}
                                value={String(sensorValues.water)}
                                unit="%"
                                threshold={15}
                                maxValue={100}
                                updatedAt={updatedRef.current.water}
                            />
                            <StatusCard
                                type="pressure"
                                label={t('dashboard.sensors.pressure')}
                                value={pressure}
                                unit=" PSI"
                                maxValue={100}
                                onValueChange={setPressure}
                                threshold={0}
                                updatedAt={updatedRef.current.pressure}
                            />
                        </div>
                    </div>

                    <div className="dashboard-frame__map">
                        <HouseMap />
                    </div>
                </div>
            </div>

            <PairDevicesModal open={pairModalOpen} onClose={() => setPairModalOpen(false)} />
        </div>
    );
};

export default Dashboard;
