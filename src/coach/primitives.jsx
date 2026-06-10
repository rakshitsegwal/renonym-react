import React, { useEffect, useRef, useState } from 'react';

// ─── Score band helper (shared by ScoreRing, Meter, score Badges) ────────────
// ≥75 green · 60–74 gold · <60 amber
export function scoreBand(score) {
    if (score >= 75) return 'green';
    if (score >= 60) return 'gold';
    return 'amber';
}
export const BAND_VAR = { green: 'var(--green)', gold: 'var(--gold)', amber: 'var(--amber)' };

const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ─── ScoreRing — SVG ring with count-up on mount ─────────────────────────────
export function ScoreRing({ value = 0, size = 240, stroke = 14, max = 100, label = 'out of 100' }) {
    const v = Math.max(0, Math.min(max, value));
    const r = size / 2 - stroke / 2 - 2;
    const circ = 2 * Math.PI * r;
    const band = scoreBand((v / max) * 100);
    const color = BAND_VAR[band];

    const [shown, setShown] = useState(prefersReducedMotion() ? v : 0);
    const raf = useRef(0);

    useEffect(() => {
        if (prefersReducedMotion()) { setShown(v); return; }
        const dur = 900, start = performance.now(), from = 0;
        const tick = (now) => {
            const t = Math.min(1, (now - start) / dur);
            const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
            setShown(Math.round(from + (v - from) * eased));
            if (t < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [v]);

    const offset = circ * (1 - shown / max);

    return (
        <div className="ring" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
            </svg>
            <div className="ring-val">
                <b style={{ fontFamily: 'var(--rn-serif)', fontSize: size * 0.325, lineHeight: 1 }}>{shown}</b>
                {label && <span className="label" style={{ marginTop: 4 }}>{label}</span>}
            </div>
        </div>
    );
}

// ─── Meter — score bar; tone auto-derives from value unless overridden ───────
export function Meter({ value = 0, max = 100, tone, style }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    const band = tone || scoreBand(pct);
    const cls = 'meter' + (band === 'gold' ? '' : ' ' + band);
    return (
        <div className={cls} style={style}>
            <span style={{ width: pct + '%' }} />
        </div>
    );
}

// ─── Waveform — live (animated) or static amplitude bars ─────────────────────
export function Waveform({ bars = 22, live = false, height = 40, style }) {
    // Deterministic amplitude pattern so static bars look intentional.
    const heights = Array.from({ length: bars }, (_, i) => {
        const a = 0.35 + 0.65 * Math.abs(Math.sin(i * 1.3) * Math.cos(i * 0.7));
        return Math.max(6, Math.round(a * height));
    });
    return (
        <div className={'wave' + (live ? ' live' : '')} style={{ height, ...style }}>
            {heights.map((h, i) => (
                <span key={i} style={{ height: h, transformOrigin: 'center' }} />
            ))}
        </div>
    );
}

// ─── VoiceOrb — idle / listening (pulse) / speaking ──────────────────────────
export function VoiceOrb({ size = 140, state = 'idle' }) {
    return (
        <div
            className={'orb' + (state === 'listening' ? ' pulse' : '')}
            style={{ width: size, height: size, opacity: state === 'speaking' ? 1 : 0.96 }}
            aria-hidden="true"
        />
    );
}

// ─── ProgressDots — interview question progress (done / now / upcoming) ──────
export function ProgressDots({ total = 6, current = 0, style }) {
    return (
        <div className="row gap-6 ac" style={style}>
            {Array.from({ length: total }, (_, i) => {
                const done = i < current;
                const now = i === current;
                return (
                    <span key={i} style={{
                        width: now ? 26 : 18, height: 5, borderRadius: 999,
                        background: done ? 'var(--gold)' : now ? 'var(--gold)' : 'var(--surface-4)',
                        opacity: now ? 1 : done ? 0.85 : 1,
                        boxShadow: now ? '0 0 0 3px var(--gold-soft)' : 'none',
                        transition: 'all .2s var(--ease)',
                    }} />
                );
            })}
        </div>
    );
}

// ─── RadioCard — selectable option card (gold when selected) ─────────────────
export function RadioCard({ selected, onClick, title, desc, icon, style }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={'card' + (selected ? ' card-gold' : '')}
            style={{
                textAlign: 'left', padding: '18px 18px', display: 'flex', gap: 14, alignItems: 'flex-start',
                borderColor: selected ? 'var(--gold-line)' : 'var(--line)', cursor: 'pointer', width: '100%',
                ...style,
            }}
        >
            <span style={{
                width: 20, height: 20, borderRadius: '50%', flex: 'none', marginTop: 2,
                border: '2px solid ' + (selected ? 'var(--gold)' : 'var(--line-3)'),
                display: 'grid', placeItems: 'center',
            }}>
                {selected && <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'var(--gold)' }} />}
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
                <span className="row ac gap-8">
                    {icon}
                    <span className="h5">{title}</span>
                </span>
                {desc && <span className="sm" style={{ display: 'block', marginTop: 4 }}>{desc}</span>}
            </span>
        </button>
    );
}

// ─── Badge — status marker; gold variant marks Premium ───────────────────────
export function Badge({ variant = 'default', dot = false, children, style }) {
    const cls = 'badge' + (variant !== 'default' ? ' ' + variant : '');
    return (
        <span className={cls} style={style}>
            {dot && <span className="dot" />}
            {children}
        </span>
    );
}
