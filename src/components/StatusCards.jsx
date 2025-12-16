import React, { useState } from 'react';
import { Zap, Droplets, Gauge, Thermometer, Activity } from 'lucide-react';

const DataNode = ({ title, unit, icon: Icon, defaultVal, maxVal, threshold, thresholdLabel, color, isReverseThreshold = false, index }) => {
    const [value, setValue] = useState(defaultVal);
    const isCritical = isReverseThreshold ? value < threshold : value > threshold;
    const statusColor = isCritical ? 'var(--status-critical)' : 'var(--text-primary)';
    const percent = (value / maxVal) * 100;

    return (
        <div
            className={`premium-card animate-enter animate-enter-delay-${index + 1}`}
            style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Background Gradient for Critical State */}
            {isCritical && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: `radial-gradient(circle at top right, ${statusColor}22, transparent 70%)`,
                    pointerEvents: 'none'
                }} />
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        padding: '8px', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                        color: isCritical ? statusColor : 'var(--text-secondary)'
                    }}>
                        <Icon size={18} />
                    </div>
                    <div>
                        <span style={{
                            fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600,
                            color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                            {title}
                        </span>
                        <div style={{ fontSize: '0.7rem', color: isCritical ? statusColor : 'var(--text-tertiary)' }}>
                            {thresholdLabel}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Value */}
            <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                    <span style={{
                        fontFamily: 'var(--font-mono)', fontSize: '2.5rem', fontWeight: 500,
                        color: isCritical ? statusColor : 'var(--text-primary)',
                        letterSpacing: '-0.05em'
                    }}>
                        {value}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1rem', color: 'var(--text-tertiary)' }}>
                        {unit}
                    </span>
                </div>
            </div>

            {/* Meter */}
            <div style={{ marginTop: '1.25rem' }}>
                <div style={{
                    height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden',
                    display: 'flex', alignItems: 'center'
                }}>
                    <div style={{
                        height: '100%', width: `${percent}%`,
                        background: isCritical ? statusColor : 'var(--text-primary)',
                        transition: 'width 0.5s var(--ease-premium)',
                        borderRadius: '99px'
                    }} />
                </div>
            </div>

            {/* Hidden Input for Simulation */}
            <input
                type="range" min="0" max={maxVal} value={value}
                onChange={(e) => setValue(parseInt(e.target.value))}
                style={{
                    position: 'absolute', inset: 0, opacity: 0, cursor: 'ns-resize'
                }}
                title="Drag to simulate sensor data"
            />
        </div>
    );
};

const StatusCards = () => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', width: '100%' }}>
            <DataNode
                index={0}
                title="Power Cell" unit="%" defaultVal={82} maxVal={100} threshold={20}
                thresholdLabel="BATTERY LEVEL" icon={Zap} isReverseThreshold={true}
            />
            <DataNode
                index={1}
                title="H2O Reserve" unit="%" defaultVal={64} maxVal={100} threshold={15}
                thresholdLabel="LIQUID STORAGE" icon={Droplets} isReverseThreshold={true}
            />
            <DataNode
                index={2}
                title="Pressure" unit="BAR" defaultVal={1.07} maxVal={3.00} threshold={2.50}
                thresholdLabel="HYDRAULICS" icon={Gauge}
            />
            <DataNode
                index={3}
                title="Core Temp" unit="°C" defaultVal={24} maxVal={50} threshold={30}
                thresholdLabel="THERMAL" icon={Thermometer}
            />
        </div>
    );
};

export default StatusCards;
