import React, { useState } from 'react';
import { ChevronRight, Shield, Camera, Divide, Check } from 'lucide-react';

const Onboarding = ({ onComplete }) => {
    const [step, setStep] = useState(0);

    const screens = [
        {
            title: "Welcome Home",
            desc: "Your smart home monitors safety, comfort, and peace of mind.",
            icon: <div className="glass-panel" style={{ width: 80, height: 80, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🏠</div>
        },
        {
            title: "Monitor & Protect",
            desc: "Live camera feeds and smart map tracking keep you aware of everything.",
            icon: <Camera size={48} color="var(--accent-blue)" />
        },
        {
            title: "Smart Automation",
            desc: "Patrols and system checks happen automatically to keep you safe.",
            icon: <Shield size={48} color="var(--accent-success)" />
        },
        {
            title: "You're in Control",
            desc: "Manage everything from one simple, beautiful dashboard.",
            icon: <Divide size={48} color="var(--accent-amber)" />
        }
    ];

    const handleNext = () => {
        if (step < screens.length - 1) {
            setStep(step + 1);
        } else {
            onComplete();
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-gradient)'
        }}>
            <div className="glass-panel animate-enter" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '3rem',
                borderRadius: 'var(--radius-xl)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '2rem', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {screens[step].icon}
                </div>

                <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: '300', marginBottom: '1rem' }}>
                    {screens[step].title}
                </h1>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                    {screens[step].desc}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '3rem' }}>
                    {screens.map((_, i) => (
                        <div key={i} style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: i === step ? 'var(--accent-blue)' : 'var(--glass-border)',
                            transition: 'all 0.3s'
                        }} />
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    style={{
                        background: 'var(--text-primary)',
                        color: 'black',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 20px rgba(255,255,255,0.2)'
                    }}
                >
                    {step === screens.length - 1 ? <Check size={24} /> : <ChevronRight size={24} />}
                </button>
            </div>
        </div>
    );
};

export default Onboarding;
