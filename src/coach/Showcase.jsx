import React, { useState } from 'react';
import './../coach.css';
import { ScoreRing, Meter, Waveform, VoiceOrb, ProgressDots, RadioCard, Badge, scoreBand } from './primitives.jsx';
import { Mic, Keyboard, Sparkles } from 'lucide-react';

// Dev-only showcase to visually verify the Phase-1 design system + primitives.
// Reachable at /coach-preview. Remove before launch.
export default function Showcase() {
    const [seg, setSeg] = useState('voice');
    const [sw, setSw] = useState(true);
    const [pick, setPick] = useState('behavioral');

    return (
        <div className="rn-dark">
            <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>
                <div className="row jsb ac" style={{ marginBottom: 28 }}>
                    <div className="brand">
                        <div className="mark">R</div>
                        <div className="wm">Renonym <b>Coach</b></div>
                    </div>
                    <Badge variant="gold" dot>Premium</Badge>
                </div>

                <span className="eyebrow">Design system</span>
                <h1 className="h1" style={{ margin: '8px 0 6px' }}>Phase 1 — <span className="gold italic">primitives</span></h1>
                <p className="lead" style={{ marginBottom: 40 }}>Tokens, type, and the new Coach components rendering in dark + gold.</p>

                {/* Buttons */}
                <div className="card" style={{ padding: 28, marginBottom: 24 }}>
                    <span className="label">Buttons</span>
                    <div className="row gap-12 wrap-f ac" style={{ marginTop: 14 }}>
                        <button className="btn btn-gold">Start an interview</button>
                        <button className="btn btn-ghost">Ghost</button>
                        <button className="btn btn-outline">Outline</button>
                        <button className="btn btn-light">Light</button>
                        <button className="btn btn-gold btn-sm">Small</button>
                        <button className="btn btn-gold btn-lg">Large</button>
                        <button className="btn btn-ghost" disabled>Disabled</button>
                    </div>
                </div>

                {/* Badges / chips / pills */}
                <div className="card" style={{ padding: 28, marginBottom: 24 }}>
                    <span className="label">Badges · Chips · Pills</span>
                    <div className="row gap-10 wrap-f ac" style={{ marginTop: 14 }}>
                        <Badge>Default</Badge>
                        <Badge variant="gold" dot>Premium</Badge>
                        <Badge variant="green" dot>+14</Badge>
                        <Badge variant="blue">Voice</Badge>
                        <Badge variant="amber">Improve</Badge>
                        <span className="chip">Behavioral</span>
                        <span className="chip on">Selected</span>
                        <span className="pill"><span className="dot" />Listening — speak naturally</span>
                    </div>
                </div>

                {/* Form */}
                <div className="card" style={{ padding: 28, marginBottom: 24 }}>
                    <span className="label">Form</span>
                    <div className="grid gap-16" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 14 }}>
                        <div className="field"><span className="input-lbl">Company</span><input className="input" placeholder="e.g. Stripe" /></div>
                        <div className="field"><span className="input-lbl">Job title</span><input className="input" placeholder="Senior Engineer" /></div>
                    </div>
                    <textarea className="textarea" placeholder="Paste the job description…" style={{ marginTop: 14 }} />
                    <div className="row gap-16 ac" style={{ marginTop: 14 }}>
                        <div className="seg">
                            <button className={seg === 'voice' ? 'on' : ''} onClick={() => setSeg('voice')}>Voice</button>
                            <button className={seg === 'text' ? 'on' : ''} onClick={() => setSeg('text')}>Text</button>
                        </div>
                        <div className={'switch' + (sw ? ' on' : '')} onClick={() => setSw(!sw)} role="switch" aria-checked={sw} />
                        <span className="sm">Difficulty boost</span>
                    </div>
                </div>

                {/* RadioCards */}
                <div className="grid gap-16" style={{ gridTemplateColumns: '1fr 1fr', marginBottom: 24 }}>
                    <RadioCard selected={pick === 'behavioral'} onClick={() => setPick('behavioral')}
                               icon={<Mic size={18} color="var(--gold)" />} title="Behavioral" desc="STAR-style stories from your résumé." />
                    <RadioCard selected={pick === 'technical'} onClick={() => setPick('technical')}
                               icon={<Keyboard size={18} color="var(--muted)" />} title="Technical" desc="Role-specific problem solving." />
                </div>

                {/* Data viz */}
                <div className="grid gap-24" style={{ gridTemplateColumns: '280px 1fr', marginBottom: 24 }}>
                    <div className="card-gold" style={{ padding: 28, display: 'grid', placeItems: 'center' }}>
                        <ScoreRing value={72} size={200} />
                        <Badge variant="green" dot style={{ marginTop: 18 }}>▲ +14 vs first rep</Badge>
                    </div>
                    <div className="col gap-16" style={{ justifyContent: 'center' }}>
                        {[['Communication', 84], ['Confidence', 76], ['Structure', 78], ['Technical relevance', 54]].map(([k, v]) => (
                            <div key={k}>
                                <div className="row jsb ac" style={{ marginBottom: 8 }}>
                                    <span className="h5">{k}</span>
                                    <span className="h5" style={{ color: BANDVAR(v) }}>{v}</span>
                                </div>
                                <Meter value={v} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Voice bits */}
                <div className="card" style={{ padding: 40, marginBottom: 24, display: 'grid', placeItems: 'center', gap: 24 }}>
                    <ProgressDots total={6} current={2} />
                    <VoiceOrb size={120} state="listening" />
                    <Waveform bars={28} live height={44} />
                    <span className="pill"><span className="dot" />Listening — speak naturally</span>
                    <Sparkles size={18} color="var(--gold)" />
                </div>
            </div>
        </div>
    );
}

function BANDVAR(v) {
    const b = scoreBand(v);
    return b === 'green' ? 'var(--green)' : b === 'amber' ? 'var(--amber)' : 'var(--gold)';
}
