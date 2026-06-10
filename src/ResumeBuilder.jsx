import React from 'react';
import { getLayout } from './ResumeLayouts.jsx';
import { AuthModal, CreditGateModal, UserPill } from './AuthModal.jsx';



// ─── Constants ────────────────────────────────────────────────────────────────

const RAILWAY_URL = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV
    ? '/api'
    : 'https://salesforce-resume-pdf-server-production.up.railway.app';

const STEPS = {
    ONBOARDING: 'onboarding',
    GALLERY:    'gallery',
    AI_FLOW:    'ai-flow',
    METHOD:     'method',
    BUILD:        'build',
    CALORIE_CALC: 'calorie-calc'
};

const SECTIONS = {
    PROFILE:    'profile',
    SKILLS:     'skills',
    EXPERIENCE: 'experience',
    EDUCATION:  'education',
    AI:         'ai',
    DESIGN:     'design',
    JOB_MATCH:  'jobmatch'
};

const TEMPLATE_GALLERY = [
    { key: 'sf-classic',   name: 'Classic Pro',   tag: 'Salesforce Blue',    tagColor: '#032d60', cat: 'executive' },
    { key: 'sf-modern',    name: 'Modern Clean',  tag: 'Bold Minimal',       tagColor: '#111827', cat: 'minimal' },
    { key: 'sf-minimal',   name: 'Minimal ATS',   tag: 'ATS Optimised',      tagColor: '#374151', cat: 'minimal' },
    { key: 'sf-tech',      name: 'Dark Tech',     tag: 'Dark Sidebar',       tagColor: '#0f172a', cat: 'bold' },
    { key: 'sf-executive', name: 'Executive',     tag: 'Serif Luxury',       tagColor: '#b8860b', cat: 'executive' },
    { key: 'nordic-clean',  name: 'Nordic Clean',  tag: 'Scandinavian',       tagColor: '#2e7d9a', cat: 'minimal' },
    { key: 'emerald-pro',   name: 'Emerald Pro',   tag: 'Bold Green',         tagColor: '#065f46', cat: 'bold' },
    { key: 'graphite',      name: 'Graphite',      tag: 'Corporate Sharp',    tagColor: '#1f2937', cat: 'executive' },
    { key: 'mauve-creative',name: 'Mauve Creative',tag: 'Creative Studio',    tagColor: '#6d28d9', cat: 'bold' },
    { key: 'terracotta',    name: 'Terracotta',    tag: 'Warm Agency',        tagColor: '#9a3412', cat: 'bold' }
];

const FONT_FAMILIES = [
    { key: 'Inter',          label: 'Inter',    preview: 'Aa' },
    { key: 'Helvetica',      label: 'Helvetica',preview: 'Aa' },
    { key: 'Georgia',        label: 'Georgia',  preview: 'Ag' },
    { key: 'Times New Roman',label: 'Times NR', preview: 'Ag' },
    { key: 'Poppins',        label: 'Poppins',  preview: 'Aa' },
    { key: 'Roboto',         label: 'Roboto',   preview: 'Aa' },
    { key: 'system-ui',      label: 'System',   preview: 'Aa' }
];

const AI_PROMPT_EXAMPLES = [
    { label: 'Apple Minimal',       prompt: 'Apple-style minimal resume with elegant typography, generous whitespace, and subtle grey accents' },
    { label: 'Dark Tech',           prompt: 'Modern tech resume with dark sidebar, monospace font accents, and cyan highlights' },
    { label: 'Consulting',          prompt: 'Clean consulting resume with classic serif headings, navy blue accents, and professional grid layout' },
    { label: 'Google PM',           prompt: 'Google PM resume with clean data-forward design, bold section headers, and ample breathing room' },
    { label: 'Creative Director',   prompt: 'Creative director resume with bold typography, editorial layout, and strong visual hierarchy' },
    { label: 'Netflix BnW',         prompt: 'Minimal Netflix-inspired black and white resume with sharp contrast and cinematic spacing' }
];

const DEFAULT_FORM = () => ({
    recordId: null,
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    summary: '',
    photoUrl: '',
    skills: [],
    experiences: [],
    education: [],
    certifications: []
});

let uidCounter = 0;
const uid = () => `k-${Date.now()}-${++uidCounter}`;

// ─── Component ────────────────────────────────────────────────────────────────


const CDN = {
    html2canvas: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
    jsPDF:       'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    pdfjs:       'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
    mammoth:     'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js'
};
function loadFromCDN(url) {
    return new Promise(function(resolve, reject) {
        if (document.querySelector('script[src="' + url + '"]')) { resolve(); return; }
        var s = document.createElement('script');
        s.src = url; s.onload = resolve; s.onerror = reject;
        document.head.appendChild(s);
    });
}


function makeReactive(instance, keys) {
    const _state = {};
    keys.forEach(key => {
        Object.defineProperty(instance, key, {
            get() { return _state[key]; },
            set(value) {
                _state[key] = value;
                if (instance._isMounted) instance.forceUpdate();
            },
            configurable: true, enumerable: true
        });
    });
    return _state;
}

class ResumeBuilder extends React.Component {
    constructor(props) {
        super(props);
        this._isMounted  = false;
        this._root       = null;
        this._statusTimer = null;
        const _state = makeReactive(this, ['defaultTemplate', 'clientId', 'formData', 'currentStep', 'activeSection', 'selectedGalleryTemplate', 'galleryFilter', 'inspirationBase64', 'inspirationMimeType', 'inspirationFileName', 'newSkill', 'newCert', 'templateStyle', 'templatePrompt', 'aiGeneratedCss', 'fontFamily', 'fontSize', 'jobDescription', 'foodImageBase64', 'foodImageMimeType', 'foodImagePreview', 'isAnalyzingFood', 'foodResult', 'foodError', 'hasLoadedResume', 'isAnalyzingJob', 'isOptimizingJob', 'isExporting', 'jobMatchResult', 'optimizedResume', 'showOptimizeModal', 'isApplyingOptimization', 'aiStyleMethod', 'isSaving', 'isGeneratingAi', 'isParsingResume', 'statusMessage', 'statusKind', 'analysisFeedback', 'showAnalysisModal', 'pdfLibInitialized', 'pdfLibLoaded', 'mammothLibLoaded', 'selectedMode', 'aiFlowStep', 'aiFlowMethod', 'jmResumeText', 'jmResumeFileName', 'jmIsParsingResume', 'aiGeneratedLayout', 'aiGeneratedTokens', 'currentUser', 'authToken', 'showAuthModal', 'authReason', 'showCreditGate', 'creditReason']);
        Object.assign(_state, {
            defaultTemplate: 'sf-classic',
            clientId: '',
            formData: DEFAULT_FORM(),
            currentStep: STEPS.GALLERY,
            activeSection: SECTIONS.PROFILE,
            selectedGalleryTemplate: '',
            galleryFilter: 'all',
            inspirationBase64: '',
            inspirationMimeType: '',
            inspirationFileName: '',
            newSkill: '',
            newCert: '',
            templateStyle: 'sf-classic',
            templatePrompt: '',
            aiGeneratedCss: '',
            fontFamily: 'Inter',
            fontSize: 'medium',
            jobDescription: '',
            foodImageBase64: '',
            foodImageMimeType: '',
            foodImagePreview: '',
            isAnalyzingFood: false,
            foodResult: null,
            foodError: '',
            hasLoadedResume: false,
            isAnalyzingJob: false,
            isOptimizingJob: false,
            isExporting: false,
            jobMatchResult: null,
            optimizedResume: null,
            showOptimizeModal: false,
            isApplyingOptimization: false,
            aiStyleMethod: '',
            isSaving: false,
            isGeneratingAi: false,
            isParsingResume: false,
            statusMessage: '',
            statusKind: 'info',
            analysisFeedback: '',
            showAnalysisModal: false,
            pdfLibInitialized: false,
            pdfLibLoaded: false,
            mammothLibLoaded: false,
            selectedMode: '',
            aiFlowStep: 1,
            aiFlowMethod: '',
            jmResumeText: '',
            jmResumeFileName: '',
            jmIsParsingResume: false,
            aiGeneratedLayout: 'two-col',
            aiGeneratedTokens: null,
            currentUser: null,
            authToken: null,
            showAuthModal: false,
            authReason: 'export',
            showCreditGate: false,
            creditReason: 'pro_required',
        });
    }



    defaultTemplate = 'sf-classic';
    clientId        = '';
    currentUser     = null;
    authToken       = null;
    showAuthModal   = false;
    authReason      = 'export';
    showCreditGate  = false;
    creditReason    = 'pro_required';
    formData = DEFAULT_FORM();
    placeholderData = {
        fullName:   'Alex Morgan',
        title:      'Senior Product Designer',
        email:      'alex.morgan@example.com',
        phone:      '+1 (555) 482-9210',
        location:   'San Francisco, California',
        summary:    'Creative and detail-oriented product designer with 7+ years of experience building intuitive digital experiences for fast-growing technology companies. Passionate about crafting scalable design systems, improving usability, and delivering elegant user-centric products.',
        skills:     ['Product Design', 'UI/UX', 'Figma', 'Design Systems', 'User Research', 'Prototyping', 'Framer', 'Interaction Design'],
        experiences: [
            {
                key: 1,
                company: 'Stripe',
                title: 'Senior Product Designer',
                dateRange: '2021 - Present',
                bullets: [
                    'Led redesign of core onboarding experience improving conversion by 28%.',
                    'Built scalable cross-platform design systems used across multiple teams.',
                    'Collaborated closely with product and engineering to ship polished user experiences.'
                ]
            },
            {
                key: 2,
                company: 'Notion',
                title: 'Product Designer',
                dateRange: '2018 - 2021',
                bullets: [
                    'Designed collaborative editing features adopted by 2M+ users.',
                    'Ran user research studies improving task completion rate by 35%.'
                ]
            }
        ],
        education: [
            { key: 3, degree: 'BFA Graphic Design', field: 'Graphic Design', school: 'Rhode Island School of Design', years: '2014 - 2018' }
        ],
        certifications: ['Google UX Design Certificate', 'Figma Advanced Certification']
    }

    // ── Step / flow state ──────────────────────────────────────────────────
    currentStep    = STEPS.GALLERY;
    selectedMode   = '';          // 'templates' | 'ai'
    activeSection  = SECTIONS.PROFILE;

    // ── Gallery state ─────────────────────────────────────────────────────
    selectedGalleryTemplate = '';
    galleryFilter = 'all';

    // ── AI Flow state ─────────────────────────────────────────────────────
    aiFlowStep     = 1;           // 1 | 2 | 3
    aiFlowMethod   = '';          // 'upload' | 'manual'
    inspirationBase64 = '';
    inspirationMimeType = '';
    inspirationFileName = '';

    // ── Form helpers ───────────────────────────────────────────────────────
    newSkill = '';
    newCert  = '';

    // ── Template ──────────────────────────────────────────────────────────
    templateStyle  = 'sf-classic';
    templatePrompt = '';
    aiGeneratedCss    = '';
    aiGeneratedLayout = 'two-col';
    aiGeneratedTokens = null;

    // ── Font customization ────────────────────────────────────────────────
    fontFamily = 'Inter';
    fontSize   = 'medium';

    // ── Job Match state ───────────────────────────────────────────────────
    jobDescription    = '';
    foodImageBase64   = '';
    foodImageMimeType = '';
    foodImagePreview  = '';
    isAnalyzingFood   = false;
    foodResult        = null;
    foodError         = '';
    hasLoadedResume   = false;
    jmResumeText      = '';       // raw text from an uploaded resume (JM-specific)
    jmResumeFileName  = '';       // filename of uploaded resume
    jmIsParsingResume = false;    // parsing the JM-specific resume upload
    isAnalyzingJob    = false;
    isOptimizingJob   = false;
    isExporting       = false;
    jobMatchResult    = null;
    optimizedResume   = null;
    showOptimizeModal      = false;
    isApplyingOptimization = false;

    // ── AI style method (step 2 choice) ───────────────────────────────────
    aiStyleMethod  = '';

    // ── Loading / status ──────────────────────────────────────────────────
    isSaving        = false;
    isGeneratingAi  = false;
    isParsingResume = false;
    statusMessage   = '';
    statusKind      = 'info';
    _statusTimer    = null;

    // ── Analysis modal ────────────────────────────────────────────────────
    analysisFeedback  = '';
    showAnalysisModal = false;

    // ── Library load flags ────────────────────────────────────────────────
    pdfLibInitialized  = false;
    pdfLibLoaded       = false;
    mammothLibLoaded   = false;

    // ═══════════════════════════════════════════════════════════════════════
    // LIFECYCLE
    // ═══════════════════════════════════════════════════════════════════════

    componentDidMount() {
        this._isMounted = true;
        this.connectedCallback();
        // Apply entry mode from landing page prop
        const mode = this.props && this.props.initialMode;
        if (mode === 'ai') {
            this.selectedMode = 'ai';
            this.currentStep  = STEPS.AI_FLOW;
            this.aiFlowStep   = 1;
        } else if (mode === 'jobmatch') {
            this.selectedMode  = 'templates';
            this.currentStep   = STEPS.BUILD;
            this.activeSection = SECTIONS.JOB_MATCH;
        } else {
            this.selectedMode = 'templates';
            this.currentStep  = STEPS.GALLERY;
        }
    }
    componentWillUnmount() { this._isMounted = false; }
    // Called from main.jsx when user arrives from landing page CTA
    enterAtAiFlow() {
        this.selectedMode = 'ai';
        this.currentStep  = STEPS.AI_FLOW;
        this.aiFlowStep   = 1;
    }

    enterAtGallery() {
        this.selectedMode = 'templates';
        this.currentStep  = STEPS.GALLERY;
    }

    connectedCallback() {

        // Restore an in-progress draft. Anonymous users have no account, so this
        // localStorage draft is the only thing protecting their work against a
        // refresh or navigating away and back.
        try {
            const draft = localStorage.getItem('rb-draft');
            if (draft) {
                const parsed = JSON.parse(draft);
                if (parsed && typeof parsed === 'object') {
                    this.formData = { ...DEFAULT_FORM(), ...parsed };
                }
            }
        } catch (e) { /* ignore corrupt draft */ }

        if (!this.formData.experiences.length) {
            this.formData = {
                ...this.formData,
                experiences: [this._newExperience()],
                education:   [this._newEducation()]
            };
        }

        let clientId = localStorage.getItem('rb-client-id');
        if (!clientId) {
            clientId = crypto.randomUUID();
            localStorage.setItem('rb-client-id', clientId);
        }
        this.clientId = clientId;

        // Restore auth session if token exists
        const savedToken = localStorage.getItem('rn-auth-token');
        const savedUser  = localStorage.getItem('rn-auth-user');
        if (savedToken && savedUser) {
            try {
                this.authToken   = savedToken;
                this.currentUser = JSON.parse(savedUser);
            } catch(e) { /* ignore corrupt */ }
        }
    }

    componentDidUpdate() { this._renderedCallback(); }
    async _renderedCallback() {
        if (!this.pdfLibInitialized) {
            this.pdfLibInitialized = true;
            try {
                await Promise.all([
                    loadFromCDN(CDN.html2canvas),
                    loadFromCDN(CDN.jsPDF)
                ]);
            } catch (e) {
                console.error('PDF library load failed', e);
            }
        }
        this._syncTextareas();
        this._saveDraft();
    }

    // Debounced auto-save of the in-progress resume to localStorage.
    _saveDraft() {
        clearTimeout(this._draftTimer);
        this._draftTimer = setTimeout(() => {
            try { localStorage.setItem('rb-draft', JSON.stringify(this.formData)); } catch (e) { /* quota/full */ }
        }, 400);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COMPUTED GETTERS — Step & visibility
    // ═══════════════════════════════════════════════════════════════════════

    get isStepGallery()    { return this.currentStep === STEPS.GALLERY; }
    get isStepAiFlow()     { return this.currentStep === STEPS.AI_FLOW; }
    get isStepMethod()     { return this.currentStep === STEPS.METHOD; }
    get isStepBuild()      { return this.currentStep === STEPS.BUILD; }
    get isStepCalorieCalc()  { return this.currentStep === STEPS.CALORIE_CALC; }
    get hasFoodImage()              { return !!this.foodImageBase64; }
    get analyseButtonDisabled()     { return !this.hasFoodImage || this.isAnalyzingFood; }
    get hasFoodError()              { return !!this.foodError; }
    get hasFoodResult()      { return !!this.foodResult; }
    get foodItems()          { return (this.foodResult?.items || []).map((it,i) => ({...it, key:'fi'+i})); }
    get foodTotalCalories()  { return this.foodResult?.totalCalories ?? 0; }
    get foodTotalProtein()   { return this.foodResult?.totalProtein  ?? 0; }
    get foodTotalCarbs()     { return this.foodResult?.totalCarbs    ?? 0; }
    get foodTotalFat()       { return this.foodResult?.totalFat      ?? 0; }
    get foodNotes()          { return this.foodResult?.notes         ?? ''; }
    get foodConfidenceClass() {
        return 'rp-cal-conf rp-cal-conf--' + (this.foodResult?.confidence || 'medium');
    }
    get foodProteinPct() {
        const t = this.foodTotalProtein + this.foodTotalCarbs + this.foodTotalFat;
        return t > 0 ? Math.round((this.foodTotalProtein / t) * 100) : 33;
    }
    get foodCarbsPct() {
        const t = this.foodTotalProtein + this.foodTotalCarbs + this.foodTotalFat;
        return t > 0 ? Math.round((this.foodTotalCarbs / t) * 100) : 33;
    }
    get foodFatPct() {
        const t = this.foodTotalProtein + this.foodTotalCarbs + this.foodTotalFat;
        return t > 0 ? Math.round((this.foodTotalFat / t) * 100) : 34;
    }
    get foodProteinBarStyle() { return { width: this.foodProteinPct + '%' }; }
    get foodCarbsBarStyle()   { return { width: this.foodCarbsPct + '%' }; }
    get foodFatBarStyle()     { return { width: this.foodFatPct + '%' }; }


    get showTopbar() { return this.currentStep !== STEPS.CALORIE_CALC; }

    get isAiMode()   { return this.selectedMode === 'ai'; }
    get hasAiCss()   { return !!this.aiGeneratedCss; }

    // ── Gallery computed ──────────────────────────────────────────────────
    get galleryClass() {
        return 'rp-gallery' + (this.selectedGalleryTemplate ? ' rp-gallery--has-selection' : '');
    }

    get galleryCTAClass() {
        return 'rp-gallery__cta-bar' + (this.selectedGalleryTemplate ? ' rp-gallery__cta-bar--visible' : '');
    }

    get selectedTemplateName() {
        const t = TEMPLATE_GALLERY.find(t => t.key === this.selectedGalleryTemplate);
        return t ? t.name : '';
    }

    get templateGallery() {
        const f = this.galleryFilter || 'all';
        return TEMPLATE_GALLERY
            .filter(t => f === 'all' || t.cat === f)
            .map(t => ({
            ...t,
            tileClass: 'rp-tpl-tile' + (this.selectedGalleryTemplate === t.key ? ' rp-tpl-tile--selected' : ''),
            thumbClass: `rp-tpl-tile__thumb rp-tpl-thumb rp-tpl-thumb--${t.key}`,
            isSelected: this.selectedGalleryTemplate === t.key
        }));
    }

    // ── AI Flow computed — 2 steps ───────────────────────────────────────
    get isAiFlowStep1() { return this.currentStep === STEPS.AI_FLOW && this.aiFlowStep === 1; }
    get isAiFlowStep2() { return this.currentStep === STEPS.AI_FLOW && this.aiFlowStep === 2; }

    get aiFlowStepPill() { return `Step ${this.aiFlowStep} of 2`; }

    get aiProgDot1Class()  { return this._aiProgDotCls(1); }
    get aiProgDot2Class()  { return this._aiProgDotCls(2); }
    get aiProgStep1Class() { return 'rp-ai-flow__prog-step' + (this.aiFlowStep === 1 ? ' rp-ai-flow__prog-step--active' : ''); }
    get aiProgStep2Class() { return 'rp-ai-flow__prog-step' + (this.aiFlowStep === 2 ? ' rp-ai-flow__prog-step--active' : ''); }
    get aiProgLine1Class() { return 'rp-ai-flow__prog-line' + (this.aiFlowStep > 1 ? ' rp-ai-flow__prog-line--done' : ''); }

    get hasInspirationFile() { return !!this.inspirationFileName; }
    get hasTemplatePrompt()  { return !!(this.templatePrompt && this.templatePrompt.trim().length > 0); }

    // Prompt becomes optional once an inspiration image is uploaded
    get promptIsOptional()   { return !!this.inspirationBase64; }

    get aiPromptExamples()   { return AI_PROMPT_EXAMPLES; }

    // Dynamic generate button label
    get aiGenerateBtnLabel() {
        const hasPrompt = this.hasTemplatePrompt;
        const hasImage  = !!this.inspirationBase64;
        if (hasPrompt && hasImage) return '\u2726 Generate with description + inspiration';
        if (hasImage)              return '\u2726 Generate from inspiration';
        if (hasPrompt)             return '\u2726 Generate with my description';
        return '\u2726 Generate resume';
    }

    // Label above text prompt changes based on whether inspiration is uploaded
    get promptSectionLabel() {
        return this.inspirationBase64
            ? 'Add a text description too (optional)'
            : 'Describe your ideal style';
    }

    _aiProgDotCls(step) {
        if (this.aiFlowStep > step)   return 'rp-ai-flow__prog-dot rp-ai-flow__prog-dot--done';
        if (this.aiFlowStep === step) return 'rp-ai-flow__prog-dot rp-ai-flow__prog-dot--active';
        return 'rp-ai-flow__prog-dot';
    }

    // ── Font customization computed ───────────────────────────────────────
    get resumeFont()     { return this.fontFamily || 'Inter'; }
    get resumeFontSize() { return this.fontSize   || 'medium'; }

    get fontFamilyList() {
        return FONT_FAMILIES.map(f => ({
            ...f,
            btnClass: 'rp-font-btn' + (this.fontFamily === f.key ? ' rp-font-btn--active' : '')
        }));
    }

    get fontSizeBtnClassSm() { return this._fontSizeCls('small'); }
    get fontSizeBtnClassMd() { return this._fontSizeCls('medium'); }
    get fontSizeBtnClassLg() { return this._fontSizeCls('large'); }

    _fontSizeCls(size) {
        return 'rp-font-size-btn rp-font-size-btn--' + size.charAt(0) + 'm'[size === 'medium' ? 0 : -1] +
               (this.fontSize === size ? ' rp-font-size-btn--active' : '');
    }

    // Fix: cleaner size class builder
    get fontSizeSmClass() { return 'rp-font-size-btn rp-font-size-btn--sm' + (this.fontSize === 'small'  ? ' rp-font-size-btn--active' : ''); }
    get fontSizeMdClass() { return 'rp-font-size-btn rp-font-size-btn--md' + (this.fontSize === 'medium' ? ' rp-font-size-btn--active' : ''); }
    get fontSizeLgClass() { return 'rp-font-size-btn rp-font-size-btn--lg' + (this.fontSize === 'large'  ? ' rp-font-size-btn--active' : ''); }

    // Topbar font-size buttons
    get topFontSizeSmClass() { return 'rp-topbar__font-size-btn' + (this.fontSize === 'small'  ? ' rp-topbar__font-size-btn--active' : ''); }
    get topFontSizeMdClass() { return 'rp-topbar__font-size-btn' + (this.fontSize === 'medium' ? ' rp-topbar__font-size-btn--active' : ''); }
    get topFontSizeLgClass() { return 'rp-topbar__font-size-btn' + (this.fontSize === 'large'  ? ' rp-topbar__font-size-btn--active' : ''); }

    // Quick template buttons in design panel
    get tplQuickGallery() {
        return TEMPLATE_GALLERY.map(t => ({
            ...t,
            btnClass: 'rp-tpl-quick-btn' + (this.templateStyle === t.key ? ' rp-tpl-quick-btn--active' : '')
        }));
    }

    // ── Topbar step trail classes ─────────────────────────────────────────
    get topbarStepClassProfile()    { return this._topbarCls('profile'); }
    get topbarStepClassSkills()     { return this._topbarCls('skills'); }
    get topbarStepClassExperience() { return this._topbarCls('experience'); }
    get topbarStepClassEducation()  { return this._topbarCls('education'); }
    get topbarStepClassAi()         { return this._topbarCls('ai'); }
    get topbarStepClassDesign()     { return this._topbarCls('design'); }

    _topbarCls(section) {
        return 'rp-step-btn' + (this.activeSection === section ? ' rp-step-btn--active' : '');
    }

    // ── Sidenav item classes ──────────────────────────────────────────────
    get sidenavClassProfile()    { return this._sidenavCls('profile'); }
    get sidenavClassSkills()     { return this._sidenavCls('skills'); }
    get sidenavClassExperience() { return this._sidenavCls('experience'); }
    get sidenavClassEducation()  { return this._sidenavCls('education'); }
    get sidenavClassAi()         { return this._sidenavCls('ai'); }
    get sidenavClassDesign()     { return this._sidenavCls('design'); }

    _sidenavCls(section) {
        return 'rp-sidenav__item' + (this.activeSection === section ? ' rp-sidenav__item--active' : '');
    }

    // ── Editor section show/hide classes ─────────────────────────────────
    get editorSectionClassProfile()    { return this._editorCls('profile'); }
    get editorSectionClassSkills()     { return this._editorCls('skills'); }
    get editorSectionClassExperience() { return this._editorCls('experience'); }
    get editorSectionClassEducation()  { return this._editorCls('education'); }
    get editorSectionClassAi()         { return this._editorCls('ai'); }
    get editorSectionClassDesign()     { return this._editorCls('design'); }

    _editorCls(section) {
        return 'rp-editor-section' + (this.activeSection === section ? ' rp-editor-section--active' : '');
    }

    // ── Job Match ─────────────────────────────────────────────────────────
    get isJobMatchSection()  { return this.activeSection === SECTIONS.JOB_MATCH; }
    get isNormalSection()    { return this.activeSection !== SECTIONS.JOB_MATCH; }
    get sidenavClassJobMatch() { return this._sidenavCls('jobmatch'); }
    get jdIsReady()          { return !!(this.jobDescription && this.jobDescription.trim().length > 50); }
    get hasJobMatchResult()  { return !!this.jobMatchResult; }
    get jobMatchEmpty()      { return !this.jobMatchResult && !this.isAnalyzingJob; }
    get hasOptimizedResume() { return !!this.optimizedResume; }
    get jmAtsScore()         { return this.jobMatchResult?.atsScore        ?? 0; }
    get jmJdMatch()          { return this.jobMatchResult?.jdMatch         ?? 0; }
    get jmKeywordCoverage()  { return this.jobMatchResult?.keywordCoverage ?? 0; }
    get jmSkillsCoverage()   { return this.jobMatchResult?.skillsCoverage  ?? 0; }
    get jmSkillsIsZero()     { return this.hasJobMatchResult && this.jmSkillsCoverage === 0; }
    // ── JM resume source ─────────────────────────────────────────────────
    get hasBuilderResume() {
        return !!(this.formData?.fullName?.trim() || this.formData?.summary?.trim() ||
                  this.formData?.experiences?.length);
    }

    get hasJmUploadedResume() { return !!this.jmResumeText; }

    get jmResumeReady() { return this.hasBuilderResume || this.hasJmUploadedResume; }

    get jmBuilderResumeLabel() {
        const name  = this.formData?.fullName?.trim();
        const title = this.formData?.title?.trim();
        if (name && title) return name + ' — ' + title;
        if (name)  return name;
        if (title) return title;
        if (this.jmResumeFileName) return this.jmResumeFileName;
        return 'Your resume';
    }

    get canAnalyze() { return this.jdIsReady && this.jmResumeReady; }

    get globalOverlayActive() {
        return this.isGeneratingAi || this.isOptimizingJob || this.isApplyingOptimization || this.isExporting ||
               this.isParsingResume || this.jmIsParsingResume || this.isAnalyzingFood;
    }

    get globalOverlayMessage() {
        if (this.isGeneratingAi)         return 'Generating AI Resume Style...';
        if (this.isOptimizingJob)        return 'Optimizing Resume for this role...';
        if (this.isApplyingOptimization) return 'Applying Optimizations...';
        if (this.jmIsParsingResume)      return 'Reading and parsing your resume...';
        if (this.isParsingResume)        return 'Importing resume...';
        if (this.isAnalyzingFood)        return 'Analysing your meal with GPT-4o...';
        return 'Processing...';
    }

    get analyzeButtonDisabled() { return this.isAnalyzingJob || !this.canAnalyze; }

    get analyzeValidationHint() {
        if (this.isAnalyzingJob) return '';
        if (!this.jmResumeReady && !this.jdIsReady) return 'Upload your resume and paste a job description to continue';
        if (!this.jmResumeReady) return 'Please upload your resume first';
        if (!this.jdIsReady)     return 'Paste a job description (min 50 characters)';
        return '';
    }

    get showAnalyzeHint() { return !!this.analyzeValidationHint; }

    get jmResumeStatus() {
        if (this.jmIsParsingResume)    return 'parsing';
        if (this.hasJmUploadedResume)  return 'uploaded';
        if (this.hasBuilderResume)     return 'builder';
        return 'empty';
    }

    get jmResumeIsBuilder()  { return this.jmResumeStatus === 'builder'; }
    get jmResumeIsUploaded() { return this.jmResumeStatus === 'uploaded'; }
    get jmResumeIsEmpty()    { return this.jmResumeStatus === 'empty'; }
    get jmResumeIsParsing()  { return this.jmResumeStatus === 'parsing'; }


    get jmAtsRingStyle()     { return this._ringStyle(this.jmAtsScore); }
    get jmJdMatchRingStyle() { return this._ringStyle(this.jmJdMatch); }
    get jmKeywordRingStyle() { return this._ringStyle(this.jmKeywordCoverage); }
    get jmSkillsRingStyle()  { return this._ringStyle(this.jmSkillsCoverage); }
    get jmAtsBarStyle()      { return this._barStyle(this.jmAtsScore); }
    get jmJdMatchBarStyle()  { return this._barStyle(this.jmJdMatch); }
    get jmKeywordBarStyle()  { return this._barStyle(this.jmKeywordCoverage); }
    get jmSkillsBarStyle()   { return this._barStyle(this.jmSkillsCoverage); }
    get jmMissingKeywords()    { return this._keyedList(this.jobMatchResult?.missingKeywords, 'mk'); }
    get jmMissingSkills()      { return this._keyedList(this.jobMatchResult?.missingSkills,   'ms'); }
    get jmStrengths()          { return this._keyedList(this.jobMatchResult?.strengths,        'st'); }
    get jmWeaknesses()         { return this._keyedList(this.jobMatchResult?.weaknesses,       'wk'); }
    get jmSummarySuggestions() { return this._keyedList(this.jobMatchResult?.summarySuggestions,    'ss'); }
    get jmExpSuggestions()     { return this._keyedList(this.jobMatchResult?.experienceSuggestions, 'es'); }
    get hasMissingKeywords()    { return this.jmMissingKeywords.length > 0; }
    get hasMissingSkills()      { return this.jmMissingSkills.length > 0; }
    get hasStrengths()          { return this.jmStrengths.length > 0; }
    get hasWeaknesses()         { return this.jmWeaknesses.length > 0; }
    get hasSummarySuggestions() { return this.jmSummarySuggestions.length > 0; }
    get hasExpSuggestions()     { return this.jmExpSuggestions.length > 0; }

    get jmStrengthsCount()        { return this.jmStrengths.length; }
    get jmWeaknessesCount()       { return this.jmWeaknesses.length; }
    get jmMissingKeywordsCount()  { return this.jmMissingKeywords.length; }
    get jmMissingSkillsCount()    { return this.jmMissingSkills.length; }

    get optimizedExperiences() {
        return (this.optimizedResume?.experiences || []).map((exp, i) => {
            const orig = (this.formData.experiences || [])[i] || {};
            return { key: 'oe-'+i, company: exp.company||orig.company||'', title: exp.title||orig.title||'', dateRange: orig.dateRange||'', bullets: (exp.bullets||[]).map((b,bi)=>({key:'ob-'+i+'-'+bi, text:b})) };
        });
    }
    get optimizedSkills() { return (this.optimizedResume?.skills||[]).map((s,i)=>({key:'os-'+i,text:s})); }
    _ringStyle(score) { return { '--ring-color': this._scoreColor(score), '--ring-pct': score+'%' }; }
    _barStyle(score)  { return { width: score+'%', background: this._scoreColor(score) }; }
    _scoreColor(s)    { return s>=85?'#10b981':s>=70?'#3b82f6':s>=50?'#f59e0b':'#ef4444'; }
    _keyedList(arr,p) { return (arr||[]).map((text,i)=>({key:p+'-'+i,text})); }

    // ── AI Style method (step 2) ──────────────────────────────────────────
    get isStyleDescribe()       { return this.aiStyleMethod === 'describe'; }
    get isStyleUpload()         { return this.aiStyleMethod === 'upload'; }
    get styleDescribeBtnClass() { return 'rp-style-choice-card'+(this.aiStyleMethod==='describe'?' rp-style-choice-card--active':''); }
    get styleUploadBtnClass()   { return 'rp-style-choice-card'+(this.aiStyleMethod==='upload'  ?' rp-style-choice-card--active':''); }



    // ═══════════════════════════════════════════════════════════════════════
    // COMPUTED GETTERS — Resume data
    // ═══════════════════════════════════════════════════════════════════════

    get activeResumeData() {
        // Once any meaningful data exists, ALWAYS use formData — never fall back to placeholder
        const hasAnyData =
            this.hasLoadedResume ||
            this.formData.fullName?.trim() ||
            this.formData.summary?.trim() ||
            this.formData.skills?.length ||
            this.formData.experiences?.some(e => e.company || e.title) ||
            this.formData.education?.some(e => e.degree || e.school);
        return hasAnyData ? this.formData : this.placeholderData;
    }

    get displayName()  { return this.activeResumeData.fullName || ''; }
    get displayTitle() { return this.activeResumeData.title    || ''; }

    get initials() {
        // Always use formData for initials — never the placeholder persona.
        // Match only Unicode letters so HTML tags, symbols, and emoji never leak
        // into the avatar (e.g. "<script>…" → no "<", "🚀 Test" → "T").
        const words = (this.formData?.fullName || '').match(/\p{L}+/gu) || [];
        return ((words[0]?.[0] || '') + (words[1]?.[0] || '')).toUpperCase();
    }

    get hasPhoto()          { return !!this.formData.photoUrl; }
    get hasSkills()         { return this.activeResumeData.skills?.length; }
    get hasCertifications() { return this.activeResumeData.certifications?.length > 0; }

    get hasExperience() {
        return (this.activeResumeData.experiences || []).some(
            e => e.company || e.title || e.bullets?.length
        );
    }

    get hasEducation() {
        return (this.activeResumeData.education || []).some(
            e => e.degree || e.school
        );
    }

    get resumeClass() {
        const base = `rb-resume rb-resume--${this.templateStyle || 'sf-classic'}`;
        // When an AI theme is active, add the token-consuming class so the
        // color-only var(--rn-*) rules in app.css apply. Structure stays hardcoded.
        return (this.templateStyle === 'ai-generated' && this.aiGeneratedTokens)
            ? `${base} rb-resume--ai-tokens`
            : base;
    }

    // AI design tokens → inline CSS custom properties on the resume root.
    // These are the ONLY way AI styling reaches the resume: colors/fonts as
    // data values applied to a fixed layout. The AI never authors CSS, so it
    // cannot touch grid/position/size — layout is structurally unbreakable.
    // Inline vars also serialize into outerHTML, so the PDF payload carries them.
    get resumeTokenStyle() {
        const t = this.aiGeneratedTokens;
        if (!t) return {};
        const pairs = [
            ['--rn-hbg',     t.headerBg],
            ['--rn-htx',     t.headerText],
            ['--rn-hsub',    t.headerSub],
            ['--rn-sbg',     t.sidebarBg],
            ['--rn-stx',     t.sidebarText],
            ['--rn-stitle',  t.sidebarTitle],
            ['--rn-accent',  t.accent],
            ['--rn-mbg',     t.mainBg],
            ['--rn-mtx',     t.mainText],
            ['--rn-mtitle',  t.mainTitle],
            ['--rn-mrole',   t.mainRole],
            ['--rn-skillbg', t.skillBg],
            ['--rn-skilltx', t.skillText],
            ['--rn-certbg',  t.certBg],
            ['--rn-certtx',  t.certText],
            ['--rn-font',    t.fontBody],
            ['--rn-font-h',  t.fontHeading],
        ];
        const style = {};
        pairs.forEach(([k, v]) => { if (v) style[k] = v; });
        return style;
    }

    get statusClass() {
        return `rp-status rp-status--${this.statusKind}`;
    }

    // ═══════════════════════════════════════════════════════════════════════

    // ═══════════════════════════════════════════════════════════════════════

    handleSelectMode(event) {
        const mode = event.currentTarget.dataset.mode;

        this.selectedMode = mode;

        if (mode === 'templates') {
            this.currentStep = STEPS.GALLERY;
        } else if (mode === 'ai') {
            this.aiFlowStep  = 1;
            this.currentStep = STEPS.AI_FLOW;
        } else if (mode === 'jobmatch') {
            this.currentStep   = STEPS.BUILD;
            this.activeSection = SECTIONS.JOB_MATCH;
        } else if (mode === 'calorie-calc') {
            // Reset any previous session then go to the calorie page
            this.foodImageBase64   = '';
            this.foodImageMimeType = '';
            this.foodImagePreview  = '';
            this.foodResult        = null;
            this.foodError         = '';
            this.currentStep       = STEPS.CALORIE_CALC;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TEMPLATE GALLERY
    // ═══════════════════════════════════════════════════════════════════════

    handleSelectGalleryTemplate(event) {
        this.selectedGalleryTemplate = event.currentTarget.dataset.tpl;
    }


    handleStartAiFlow() {
        this.selectedMode = 'ai';
        this.currentStep  = STEPS.AI_FLOW;
        this.aiFlowStep   = 1;
        this.aiFlowMethod = '';
        this.templatePrompt = '';
    }

    handleGalleryConfirm() {
        if (!this.selectedGalleryTemplate) return;
        this.templateStyle = this.selectedGalleryTemplate;
        this.currentStep   = STEPS.METHOD;
    }

    handleGalleryFilterChange(event) {
        this.galleryFilter = event.currentTarget.dataset.filter;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // AI FLOW — MULTI-STEP ONBOARDING
    // ═══════════════════════════════════════════════════════════════════════

    handleAiFlowMethod(event) {
        const method = event.currentTarget.dataset.method;
        this.aiFlowMethod = method;
        if (method === 'manual') {
            this.aiFlowStep = 2;
        }
        // For 'upload', file input triggers handleResumeUploadAiFlow
    }

    async handleResumeUploadAiFlow(event) {
        this.aiFlowMethod = 'upload';
        await this.handleResumeUpload(event);
        // After parse, jump to AI prompt step instead of going directly to build
        if (this.currentStep === STEPS.BUILD) {
            this.currentStep = STEPS.AI_FLOW;
            this.aiFlowStep  = 2;
        }
    }

    handleAiFlowNext() {
        if (this.aiFlowStep < 3) {
            this.aiFlowStep += 1;
        }
    }

    handleAiFlowBack() {
        if (this.aiFlowStep > 1) {
            this.aiFlowStep -= 1;
            this.aiStyleMethod = '';
        } else {
            this.currentStep = STEPS.GALLERY;
        }
    }

    handleAiFlowSkipInspiration() {
        this._launchAiBuild();
    }

    async handleAiFlowGenerate() {
        await this._launchAiBuild();
    }

    async _launchAiBuild() {
        if (this.aiFlowMethod === 'manual') {
            this.currentStep   = STEPS.BUILD;
            this.activeSection = SECTIONS.PROFILE;
        }
        await this.generateAiTemplate();
        // Always land in BUILD step so user sees the result (or the error message)
        this.currentStep   = STEPS.BUILD;
        this.activeSection = SECTIONS.AI;
    }

    async handleInspirationUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const isImage = file.type.startsWith('image/');

        if (!allowedTypes.includes(file.type) && !file.name.endsWith('.docx')) {
            this._setStatus('Please upload a PDF, DOCX, PNG, or JPG file.', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this._setStatus('Inspiration file must be under 5 MB.', 'error');
            return;
        }

        try {
            if (isImage || file.type === 'application/pdf') {
                // Store as base64 for server-side vision analysis
                const base64 = await this._readAsBase64(file);
                this.inspirationBase64   = base64;
                this.inspirationMimeType = file.type;
                this.inspirationFileName = file.name;
            } else {
                // For DOCX — just store name, server will handle
                this.inspirationFileName = file.name;
                this.inspirationBase64   = '';
                this.inspirationMimeType = '';
            }
            this._setStatus('Inspiration file ready ✓', 'success');
        } catch (e) {
            this._setStatus('Failed to read inspiration file.', 'error');
        }
    }

    handleRemoveInspiration() {
        this.inspirationBase64   = '';
        this.inspirationMimeType = '';
        this.inspirationFileName = '';
    }

    handleInspirationDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('rp-inspiration-drop--drag-over');
    }

    handleInspirationDragLeave(event) {
        event.currentTarget.classList.remove('rp-inspiration-drop--drag-over');
    }

    async handleInspirationDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('rp-inspiration-drop--drag-over');
        const file = event.dataTransfer?.files?.[0];
        if (file) {
            await this.handleInspirationUpload({ target: { files: [file] } });
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FONT CUSTOMIZATION
    // ═══════════════════════════════════════════════════════════════════════

    handleFontFamily(event) {
        this.fontFamily = event.currentTarget.dataset.font;
        this._applyFontAttributes();
    }

    handleFontSize(event) {
        this.fontSize = event.currentTarget.dataset.size;
        this._applyFontAttributes();
    }

    handleFontFamilySelect(event) {
        this.fontFamily = event.target.value;
        this._applyFontAttributes();
    }

    handleQuickTemplate(event) {
        this.templateStyle = event.currentTarget.dataset.tpl;
    }

    _applyFontAttributes() {
        // Apply data attributes to the live resume element
        const resumeEl = this._root && this._root.querySelector('[data-id="resume-preview"]');
        if (resumeEl) {
            resumeEl.setAttribute('data-font',      this.fontFamily);
            resumeEl.setAttribute('data-font-size', this.fontSize);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // NAVIGATION
    // ═══════════════════════════════════════════════════════════════════════

    goBack() {
        if (this.currentStep === STEPS.METHOD) {
            this.currentStep = STEPS.GALLERY;
        } else if (this.currentStep === STEPS.GALLERY) {
            if (this.props && this.props.onGoToLanding) this.props.onGoToLanding();
        } else if (this.currentStep === STEPS.AI_FLOW) {
            this.handleAiFlowBack();
        } else if (this.currentStep === STEPS.BUILD) {
            if (this.selectedMode === 'ai') {
                this.currentStep = STEPS.AI_FLOW; this.aiFlowStep = 2;
            } else {
                this.currentStep = STEPS.METHOD;
            }
        }
    }

    startManualBuild() {
        // Reset to a completely blank resume — no placeholder data leaking in
        this.formData = {
            fullName: '', title: '', email: '', phone: '',
            location: '', linkedIn: '', summary: '',
            skills: [], certifications: [],
            experiences: [], education: [],
            photoUrl: '', photoBase64: ''
        };
        this.hasLoadedResume   = false;
        this.jmResumeText      = '';
        this.jmResumeFileName  = '';
        this.jobMatchResult    = null;
        this.optimizedResume   = null;
        this.currentStep       = STEPS.BUILD;
        this.activeSection     = SECTIONS.PROFILE;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION NAVIGATION
    // ═══════════════════════════════════════════════════════════════════════

    handleSectionNav(event) {
        const section = event.currentTarget.dataset.section;
        if (section) this.activeSection = section;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FORM INPUT HANDLERS
    // ═══════════════════════════════════════════════════════════════════════

    // Per-field length caps — enforced here so oversized values can't slip in
    // via paste or programmatic input events, not just typing.
    static FIELD_LIMITS = { fullName: 100, title: 120, email: 254, phone: 40, location: 120, linkedIn: 200, summary: 2000 };

    handleInput(event) {
        const field = event.target.dataset.field;
        if (!field) return;
        const cap = ResumeBuilder.FIELD_LIMITS[field];
        const value = cap ? event.target.value.slice(0, cap) : event.target.value;
        this.formData = { ...this.formData, [field]: value };
    }

    handleTemplateChange(event) {
        this.templateStyle = event.target.value;
    }

    handleTemplatePrompt(event) {
        this.templatePrompt = event.target.value;
    }

    // ─── Photo ────────────────────────────────────────────────────────────
    handlePhotoUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            this._setStatus('Photo must be under 2 MB.', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            this.formData = { ...this.formData, photoUrl: e.target.result };
        };
        reader.readAsDataURL(file);
    }

    // ─── Skills ───────────────────────────────────────────────────────────
    handleSkillInput   = (event) => { this.newSkill = event.target.value; };
    handleSkillKeydown(event) { if (event.key === 'Enter') { event.preventDefault(); this.handleAddSkill(); } };

    handleAddSkill() {
        const v = (this.newSkill || '').trim();
        if (!v || this.formData.skills.includes(v)) { this.newSkill = ''; return; }
        this.formData = { ...this.formData, skills: [...this.formData.skills, v] };
        this.newSkill = '';
    }

    handleRemoveSkill(event) {
        const idx  = parseInt(event.currentTarget.dataset.index, 10);
        const next = [...this.formData.skills];
        next.splice(idx, 1);
        this.formData = { ...this.formData, skills: next };
    }

    // ─── Certifications ───────────────────────────────────────────────────
    handleCertInput   = (event) => { this.newCert = event.target.value; };
    handleCertKeydown(event) { if (event.key === 'Enter') { event.preventDefault(); this.handleAddCert(); } };

    handleAddCert() {
        const v = (this.newCert || '').trim();
        if (!v || this.formData.certifications.includes(v)) { this.newCert = ''; return; }
        this.formData = { ...this.formData, certifications: [...this.formData.certifications, v] };
        this.newCert  = '';
    }

    handleRemoveCert(event) {
        const idx  = parseInt(event.currentTarget.dataset.index, 10);
        const next = [...this.formData.certifications];
        next.splice(idx, 1);
        this.formData = { ...this.formData, certifications: next };
    }

    // ─── Experience ───────────────────────────────────────────────────────
    _newExperience() {
        return { key: uid(), company: '', title: '', startDate: '', endDate: '', bulletsRaw: '', bullets: [], dateRange: '', initials: '' };
    }

    handleAddExperience() {
        this.formData = { ...this.formData, experiences: [...this.formData.experiences, this._newExperience()] };
    }

    handleRemoveExperience(event) {
        const idx  = parseInt(event.currentTarget.dataset.index, 10);
        const next = [...this.formData.experiences];
        next.splice(idx, 1);
        this.formData = { ...this.formData, experiences: next };
    }

    handleExperienceChange(event) {
        const idx   = parseInt(event.currentTarget.dataset.index, 10);
        const field = event.currentTarget.dataset.field;
        const val   = event.target.value;

        const next = this.formData.experiences.map((e, i) => {
            if (i !== idx) return e;
            const updated    = { ...e, [field]: val };
            updated.dateRange = [updated.startDate, updated.endDate].filter(Boolean).join(' – ');
            updated.bullets   = (updated.bulletsRaw || '')
                .split('\n')
                .map(b => b.trim().replace(/^[•·\-*\u2022\u00B7]\s*/, '').trim())
                .filter(b => b.length > 0);
            updated.initials  = (updated.company || '').trim().slice(0, 2).toUpperCase() || '—';
            return updated;
        });

        this.formData = { ...this.formData, experiences: next };
    }

    // ─── Education ────────────────────────────────────────────────────────
    _newEducation() {
        return { key: uid(), degree: '', field: '', school: '', years: '' };
    }

    handleAddEducation() {
        this.formData = { ...this.formData, education: [...this.formData.education, this._newEducation()] };
    }

    handleRemoveEducation(event) {
        const idx  = parseInt(event.currentTarget.dataset.index, 10);
        const next = [...this.formData.education];
        next.splice(idx, 1);
        this.formData = { ...this.formData, education: next };
    }

    handleEducationChange(event) {
        const idx   = parseInt(event.currentTarget.dataset.index, 10);
        const field = event.currentTarget.dataset.field;
        const val   = event.target.value;
        const next  = this.formData.education.map(
            (e, i) => i === idx ? { ...e, [field]: val } : e
        );
        this.formData = { ...this.formData, education: next };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // AI PROMPT EXAMPLE CHIPS
    // ═══════════════════════════════════════════════════════════════════════

    setAiPromptExample(event) {
        this.templatePrompt = event.currentTarget.dataset.prompt || '';
    }

    // ═══════════════════════════════════════════════════════════════════════
    // AI TEMPLATE GENERATION
    // ═══════════════════════════════════════════════════════════════════════

    async generateAiTemplate() {
        if (!this._requireLogin('feature')) return;   // premium action — login required
        const hasInspiration = !!(this.inspirationBase64 && this.inspirationMimeType);

        // Allow generation from inspiration image alone — no text prompt required
        if (!this.templatePrompt?.trim()) {
            if (hasInspiration) {
                this.templatePrompt = 'Create a professional resume style inspired by the uploaded reference. Match its color palette, typography, and overall aesthetic.';
            } else {
                this._setStatus('Please describe your ideal style — or pick one of the examples above.', 'error');
                return;
            }
        }

        this.isGeneratingAi = true;

        try {
            this._setStatus(hasInspiration ? 'Analysing inspiration image… (up to 60s)' : 'Generating AI theme…', 'info');

            const body = {
                prompt:     this.templatePrompt,
                resumeData: this.formData,
                metadata: {
                    hasPhoto:           this.hasPhoto,
                    experienceCount:    this.formData.experiences?.length || 0,
                    skillCount:         this.formData.skills?.length || 0,
                    certificationCount: this.formData.certifications?.length || 0,
                    educationCount:     this.formData.education?.length || 0,
                    summaryLength:      this.formData.summary?.length || 0,
                    totalBullets:       (this.formData.experiences || [])
                        .reduce((sum, e) => sum + (e.bullets?.length || 0), 0)
                }
            };

            if (hasInspiration) {
                body.inspirationBase64   = this.inspirationBase64;
                body.inspirationMimeType = this.inspirationMimeType;
            }

            const timeoutMs = hasInspiration ? 90000 : 45000;

            const response = await this.apiFetch(`${RAILWAY_URL}/generate-template`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'x-client-id': this.clientId },
                body:    JSON.stringify(body)
            }, timeoutMs);

            if (await this._isGated(response)) return;   // login / quota gate
            if (response.status === 429) {
                this._setStatus('Too many AI requests. Please wait a few minutes.', 'error');
                return;
            }
            if (!response.ok) throw new Error('Template generation failed');

            const result = await response.json();
            if (!result.tokens && !result.layout) throw new Error('Invalid response from server');

            // Remove any leftover old-style CSS tag
            const oldTag = document.getElementById('rp-ai-template-style');
            if (oldTag) oldTag.remove();

            this.aiGeneratedTokens = result.tokens || null;
            this.aiGeneratedLayout = result.layout  || 'two-col';
            this.aiGeneratedCss    = '';
            this.templateStyle     = 'ai-generated';

            this._setStatus('AI theme applied! 🎨', 'success');

        } catch (e) {
            console.error('AI template generation failed:', e);
            this._setStatus('AI generation failed. Check your connection and try again.', 'error');
        } finally {
            this.isGeneratingAi = false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RESUME UPLOAD & AI PARSING
    // ═══════════════════════════════════════════════════════════════════════

    async handleResumeUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const allowed = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|docx|txt)$/i)) {
            this._setStatus('Please upload a PDF, DOCX, or TXT file. Images are not supported here.', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this._setStatus('Resume file must be under 5 MB.', 'error');
            return;
        }

        this.isParsingResume = true;
        this._setStatus('Extracting text from file…', 'info');

        try {
            let text = '';

            if (file.type === 'application/pdf') {
                text = await this._extractTextFromPDF(file);
            } else if (
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.name.endsWith('.docx')
            ) {
                text = await this._extractTextFromDOCX(file);
            } else {
                text = await this._readTextFile(file);
            }

            if (!text || text.length < 10) {
                this._setStatus('Could not extract text from this file. Try a different format.', 'error');
                return;
            }

            this._setStatus('AI is parsing your resume…', 'info');

            console.log('[extract-resume] Sending text length:', text.length, 'clientId:', this.clientId);
            const response = await this.apiFetch(`${RAILWAY_URL}/extract-resume`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'x-client-id': this.clientId },
                body:    JSON.stringify({ text })
            });
            console.log('[extract-resume] Response status:', response.status);

            if (response.status === 429) {
                this._setStatus('Too many AI requests. Please wait a few minutes.', 'error');
                return;
            }

            if (!response.ok) {
                let errBody = '';
                try { errBody = await response.text(); } catch(e) {}
                console.error('[extract-resume] Server error', response.status, errBody);
                throw new Error('AI extraction failed: ' + response.status + ' ' + errBody.slice(0,200));
            }

            const parsed = await response.json();

            const merged     = { ...this.formData };
            const textFields = ['fullName', 'title', 'email', 'phone', 'location', 'linkedIn', 'summary'];
            textFields.forEach(f => {
                if (parsed[f] && String(parsed[f]).trim().length > 0) merged[f] = parsed[f];
            });
            if (parsed.skills?.length)         merged.skills         = parsed.skills;
            if (parsed.certifications?.length)  merged.certifications = parsed.certifications;

            if (parsed.experiences?.length) {
                merged.experiences = parsed.experiences.map(e => ({
                    key:        uid(),
                    company:    e.company    || '',
                    title:      e.title      || '',
                    startDate:  e.startDate  || '',
                    endDate:    e.endDate    || '',
                    bulletsRaw: (e.bullets || []).filter(b => b && String(b).trim()).join('\n'),
                    bullets:    (e.bullets || []).filter(b => b && String(b).trim()),
                    dateRange:  [e.startDate, e.endDate].filter(Boolean).join(' – '),
                    initials:   (e.company || '').trim().slice(0, 2).toUpperCase() || '—'
                }));
            }

            if (parsed.education?.length) {
                merged.education = parsed.education.map(e => ({
                    key:    uid(),
                    degree: e.degree || '',
                    field:  e.field  || '',
                    school: e.school || '',
                    years:  e.years  || ''
                }));
            }

            this.formData       = merged;
            this.hasLoadedResume = true;
            this.currentStep    = STEPS.BUILD;
            this.activeSection = this.selectedMode === 'ai' ? SECTIONS.AI : SECTIONS.PROFILE;

            if (this.selectedMode === 'ai' && !this.templatePrompt) {
                this.templatePrompt =
                    'Create the best modern ATS-friendly resume template for this imported resume. ' +
                    'Keep it single-page, premium, elegant and compact.';
            }

            this._setStatus('Resume imported successfully! Review and adjust your details.', 'success');

        } catch (e) {
            console.error('Resume upload failed:', e);
            this._setStatus('Failed to parse resume. Please try again.', 'error');
        } finally {
            this.isParsingResume = false;
            // Reset the file input so re-selecting the SAME file fires onChange
            // again, and no stale selection can be re-submitted.
            try { if (event?.target) event.target.value = ''; } catch (_) {}
        }
    }

    // ─── Text extraction helpers ──────────────────────────────────────────

    async _extractTextFromPDF(file) {
        if (!this.pdfLibLoaded) {
            await loadFromCDN(CDN.pdfjs);
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = null;
            this.pdfLibLoaded = true;
        }

        const arrayBuffer = await this._readAsArrayBuffer(file);
        const pdf         = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let   fullText    = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page     = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1 });
            const content  = await page.getTextContent();
            const pageWidth = viewport.width;
            const midX     = pageWidth * 0.45;
            const leftCol  = [];
            const rightCol = [];

            content.items.forEach(item => {
                const x = item.transform[4];
                const y = item.transform[5];
                (x < midX ? leftCol : rightCol).push({ text: item.str, x, y });
            });

            const sortDesc  = arr => arr.sort((a, b) => b.y - a.y);
            sortDesc(leftCol);
            sortDesc(rightCol);

            const colToLines = col => {
                let out = '', lastY = null;
                col.forEach(({ text, y }) => {
                    if (!text.trim()) return;
                    if (lastY !== null && Math.abs(lastY - y) > 3) out += '\n';
                    out += text + ' ';
                    lastY = y;
                });
                return out.trim();
            };

            const leftText  = colToLines(leftCol);
            const rightText = colToLines(rightCol);

            if (leftText.length > 80 && rightText.length > 80) {
                fullText += `--- LEFT COLUMN ---\n${leftText}\n\n--- RIGHT COLUMN ---\n${rightText}\n\n`;
            } else {
                const all = [...leftCol, ...rightCol];
                sortDesc(all);
                fullText += colToLines(all) + '\n\n';
            }
        }

        return fullText;
    }

    async _extractTextFromDOCX(file) {
        if (!this.mammothLibLoaded) {
            await loadFromCDN(CDN.mammoth);
            this.mammothLibLoaded = true;
        }
        const arrayBuffer = await this._readAsArrayBuffer(file);
        const result      = await window.mammoth.extractRawText({ arrayBuffer });
        return result.value;
    }

    async _readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    async _readAsArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    async _readAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload  = e => resolve(e.target.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // AI CAPABILITIES
    // ═══════════════════════════════════════════════════════════════════════

    async handleImproveSummary() {
        if (!this.formData.fullName && !this.formData.summary) {
            this._setStatus('Add your name and some summary text first.', 'error');
            return;
        }

        this._setStatus('AI is improving your summary…', 'info');

        try {
            const response = await this.apiFetch(`${RAILWAY_URL}/improve-summary`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'x-client-id': this.clientId },
                body:    JSON.stringify({
                    name:       this.formData.fullName,
                    title:      this.formData.title,
                    summary:    this.formData.summary,
                    skills:     this.formData.skills,
                    experience: this.formData.experiences
                })
            });

            if (response.status === 429) {
                this._setStatus('Too many AI requests. Please wait a few minutes.', 'error');
                return;
            }

            if (!response.ok) throw new Error('AI summary failed');

            const result = await response.json();
            this.formData = { ...this.formData, summary: result.summary };
            this._setStatus('Summary improved! ✦', 'success');

        } catch (e) {
            console.error(e);
            this._setStatus('AI summary generation failed. Check server connection.', 'error');
        }
    }

    async handleResumeAnalysis() {
        if (!this._requireLogin('feature')) return;   // premium action — login required
        this._setStatus('Analysing your resume…', 'info');

        try {
            const response = await this.apiFetch(`${RAILWAY_URL}/review-resume`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'x-client-id': this.clientId },
                body:    JSON.stringify({ formData: this.formData })
            });

            if (await this._isGated(response)) return;   // login / quota gate
            if (response.status === 429) {
                this._setStatus('Too many AI requests. Please wait a few minutes.', 'error');
                return;
            }

            if (!response.ok) throw new Error('Review failed');

            const result = await response.json();
            this.analysisFeedback  = result.feedback;
            this.showAnalysisModal = true;
            this._setStatus('Review complete.', 'success');

        } catch (e) {
            console.error(e);
            this._setStatus('Resume analysis failed.', 'error');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXPORT / SAVE
    // ═══════════════════════════════════════════════════════════════════════


    // ─── Auth methods ─────────────────────────────────────────────────────────

    handleAuthSuccess(token, user) {
        this.authToken   = token;
        this.currentUser = user;
        this.showAuthModal = false;
        localStorage.setItem('rn-auth-token', token);
        localStorage.setItem('rn-auth-user', JSON.stringify(user));
        // If they were trying to export, re-run the gated flow now that they're
        // signed in (handleExport applies the Pro check → download or upgrade gate).
        if (this.authReason === 'export') {
            this.handleExport();
        }
    }

    handleAuthClose() {
        this.showAuthModal = false;
    }

    handleLogout() {
        this.authToken   = null;
        this.currentUser = null;
        localStorage.removeItem('rn-auth-token');
        localStorage.removeItem('rn-auth-user');
        if (this.props && this.props.onGoToLanding) this.props.onGoToLanding();
    }

    handleCreditGateClose() {
        this.showCreditGate = false;
    }

    // Upgrade CTA from the gate → send the user to the pricing section.
    handleUpgrade() {
        this.showCreditGate = false;
        if (this.props && this.props.onGoToLanding) {
            this.props.onGoToLanding();
            setTimeout(() => { try { window.location.hash = '#pricing'; } catch (_) {} }, 60);
        }
    }

    async _proceedWithExport() {
        if (!this.formData.fullName?.trim()) {
            this._setStatus('Please fill in your Full Name before exporting.', 'error');
            return;
        }
        this.isExporting = true;
        try {
            await this.handleDownload();
        } finally {
            this.isExporting = false;
        }
    }

    async handleExport() {
        if (!this.formData.fullName?.trim()) {
            this._setStatus('Please fill in your Full Name before exporting.', 'error');
            return;
        }
        // Premium action — free tier requires an account.
        if (!this._requireLogin('export')) return;
        // Downloads are Pro-only. Free users see a watermarked + blurred preview
        // and an upgrade prompt — no clean file is ever produced.
        if (!this.isPro) {
            this.creditReason   = 'pro_required';
            this.showCreditGate = true;
            return;
        }
        this._proceedWithExport();
    }

    async handleDownload() {
        try {
            this._setStatus('Generating PDF…', 'info');

            const resumeEl = this._root && this._root.querySelector('[data-id="resume-preview"]');
            if (!resumeEl) {
                this._setStatus('Preview not found. Please wait for the page to load fully.', 'error');
                return;
            }

            // Apply font attributes before export
            resumeEl.setAttribute('data-font',      this.fontFamily);
            resumeEl.setAttribute('data-font-size', this.fontSize);

            const css  = await this.getCssText();
            const html = resumeEl.outerHTML;

            const response = await this.apiFetch(`${RAILWAY_URL}/generate-pdf`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'x-client-id': this.clientId },
                body:    JSON.stringify({ html, css })
            });

            if (await this._isGated(response)) return;   // login / Pro-required gate (defense in depth)
            if (response.status === 429) {
                this._setStatus('PDF export limit reached. Please try later.', 'error');
                return;
            }

            if (!response.ok) throw new Error('PDF generation failed');

            const blob     = await response.blob();
            const url      = window.URL.createObjectURL(blob);
            const a        = document.createElement('a');
            const safeName = (this.formData.fullName || 'resume').replace(/[^\w\-]+/g, '_');
            a.href         = url;
            a.download     = `${safeName}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            this._setStatus('PDF downloaded successfully.', 'success');

        } catch (e) {
            console.error(e);
            this._setStatus('Failed to generate PDF. Please try again.', 'error');
        }
    }

    async _save() {
        this.isSaving = true;
        try {
            const payload = {
                recordId:       this.formData.recordId,
                fullName:       this.formData.fullName,
                title:          this.formData.title,
                email:          this.formData.email,
                phone:          this.formData.phone,
                location:       this.formData.location,
                linkedIn:       this.formData.linkedIn,
                summary:        this.formData.summary,
                photoUrl:       this.formData.photoUrl,
                skills:         this.formData.skills,
                experiences:    this.formData.experiences.map(e => ({
                    company:   e.company,
                    title:     e.title,
                    startDate: e.startDate,
                    endDate:   e.endDate,
                    bullets:   e.bullets
                })),
                education:      this.formData.education,
                certifications: this.formData.certifications
            };

            const newId   = 'local-' + Date.now(); // Apex saveResume not available outside Salesforce
            this.formData = { ...this.formData, recordId: newId };
            this._setStatus('Saved to Salesforce.', 'success');

        } catch (err) {
            const msg = err?.body?.message || err?.message || 'Save failed.';
            this._setStatus('Could not save: ' + msg, 'error');
        } finally {
            this.isSaving = false;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CSS COLLECTION — gathers all page stylesheets for PDF export
    // ═══════════════════════════════════════════════════════════════════════

    async getCssText() {
        let css = '';

        // Include font CSS for the chosen font family (Google Fonts for web fonts)
        const webFonts = {
            'Inter':   "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');",
            'Poppins': "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');",
            'Roboto':  "@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');"
        };

        if (webFonts[this.fontFamily]) {
            css += webFonts[this.fontFamily] + '\n';
        }

        // Inline font override for PDF reliability
        const fontStack = {
            'Inter':            "'Inter', -apple-system, sans-serif",
            'Helvetica':        "Helvetica, Arial, sans-serif",
            'Georgia':          "Georgia, 'Times New Roman', serif",
            'Times New Roman':  "'Times New Roman', Times, serif",
            'Poppins':          "'Poppins', sans-serif",
            'Roboto':           "'Roboto', sans-serif",
            'system-ui':        "system-ui, -apple-system, sans-serif"
        };

        const sizeScale = { small: '9px', medium: '10px', large: '11px' };

        css += `.rb-resume { font-family: ${fontStack[this.fontFamily] || fontStack['Inter']} !important; font-size: ${sizeScale[this.fontSize] || '10px'} !important; }\n`;

        // Collect all document stylesheets
        Array.from(document.styleSheets).forEach(sheet => {
            try {
                Array.from(sheet.cssRules || []).forEach(rule => {
                    css += rule.cssText + '\n';
                });
            } catch (e) {
                // Cross-origin — skip
            }
        });

        // Inject AI token CSS variables for PDF rendering.
        // Tokens are already applied as inline style vars on the resume root (see
        // resumeTokenStyle) and serialize into outerHTML, so the PDF carries them.
        // This explicit .rb-resume--ai-tokens rule is belt-and-suspenders for Puppeteer.
        if (this.aiGeneratedTokens) {
            const t = this.aiGeneratedTokens;
            const pairs = [
                ['--rn-hbg',     t.headerBg],
                ['--rn-htx',     t.headerText],
                ['--rn-hsub',    t.headerSub],
                ['--rn-sbg',     t.sidebarBg],
                ['--rn-stx',     t.sidebarText],
                ['--rn-stitle',  t.sidebarTitle],
                ['--rn-accent',  t.accent],
                ['--rn-mbg',     t.mainBg],
                ['--rn-mtx',     t.mainText],
                ['--rn-mtitle',  t.mainTitle],
                ['--rn-mrole',   t.mainRole],
                ['--rn-skillbg', t.skillBg],
                ['--rn-skilltx', t.skillText],
                ['--rn-certbg',  t.certBg],
                ['--rn-certtx',  t.certText],
                ['--rn-font',    t.fontBody],
                ['--rn-font-h',  t.fontHeading],
            ];
            const vars = pairs.filter(([,v]) => v).map(([k,v]) => `  ${k}: ${v};`).join('\n');
            css += `\n.rb-resume--ai-tokens {\n${vars}\n}\n`;
        }

        return css;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TEXTAREA SYNC
    // ═══════════════════════════════════════════════════════════════════════

    _syncTextareas() {
        const summaryEl = this._root && this._root.querySelector('textarea[data-field="summary"]');
        if (summaryEl && (this.formData.summary || '') !== summaryEl.value) {
            summaryEl.value = this.formData.summary || '';
        }

        this._root && this._root.querySelectorAll('textarea[data-field="bulletsRaw"]').forEach(el => {
            const idx = parseInt(el.dataset.index, 10);
            const exp = (this.formData.experiences || [])[idx];
            if (exp && (exp.bulletsRaw || '') !== el.value) {
                el.value = exp.bulletsRaw || '';
            }
        });

        // Sync AI prompt textarea in both builder and AI flow
        this._root && this._root.querySelectorAll('textarea.rp-textarea--ai').forEach(el => {
            if ((this.templatePrompt || '') !== el.value) {
                el.value = this.templatePrompt || '';
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════

    _setStatus(message, kind = 'info') {
        this.statusMessage = message;
        this.statusKind    = kind;
        clearTimeout(this._statusTimer);
        this._statusTimer  = setTimeout(() => { this.statusMessage = ''; }, 5000);
    }


    // ── Style method choice ───────────────────────────────────────────────
    handleStyleMethodChoice(event) {
        const method = event.currentTarget.dataset.style;
        if (method === this.aiStyleMethod) return;
        this.aiStyleMethod = method;
        if (method === 'describe') { this.inspirationBase64=''; this.inspirationMimeType=''; this.inspirationFileName=''; }
        else if (method === 'upload') { this.templatePrompt=''; }
    }

    // ── Job Match handlers ────────────────────────────────────────────────

    // ═══════════════════════════════════════════════════════════════════════
    // JM RESUME UPLOAD — parse resume uploaded on the Job Match screen
    // ═══════════════════════════════════════════════════════════════════════

    async handleJmResumeUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            this._setStatus('Resume file must be under 5 MB.', 'error');
            return;
        }

        this.jmIsParsingResume = true;
        this.jmResumeText      = '';
        this.jmResumeFileName  = '';
        this.jobMatchResult    = null;
        this.optimizedResume   = null;

        try {
            // ── Step 1: extract raw text from the file ──────────────────────
            this._setStatus('Reading your resume…', 'info');

            let text = '';
            if (file.type === 'application/pdf') {
                text = await this._extractTextFromPDF(file);
            } else if (
                file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.name.endsWith('.docx')
            ) {
                text = await this._extractTextFromDOCX(file);
            } else {
                text = await this._readTextFile(file);
            }

            if (!text || text.length < 20) {
                this._setStatus('Could not extract text from this file. Try PDF or DOCX.', 'error');
                return;
            }

            // Keep raw text for the job match analysis call
            this.jmResumeText     = text;
            this.jmResumeFileName = file.name;

            // ── Step 2: parse with AI into structured formData ─────────────
            // This is the same step the regular resume upload does.
            // Without this, the preview stays blank and optimize uses empty data.
            this._setStatus('AI is parsing your resume — populating your profile…', 'info');

            const response = await this.apiFetch(`${RAILWAY_URL}/extract-resume`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json', 'x-client-id': this.clientId },
                body:    JSON.stringify({ text })
            }, 60000);

            if (response.status === 429) {
                this._setStatus('Too many AI requests. Please wait a minute.', 'error');
                // Still keep jmResumeText so analysis can proceed with raw text
                return;
            }

            if (!response.ok) {
                // Non-fatal: we still have jmResumeText for analysis, just no preview
                this._setStatus('Resume uploaded but could not be parsed — analysis will still work.', 'info');
                return;
            }

            const parsed = await response.json();

            // ── Step 3: merge parsed data into formData ────────────────────
            const merged     = { ...this.formData };
            const textFields = ['fullName', 'title', 'email', 'phone', 'location', 'linkedIn', 'summary'];
            textFields.forEach(f => {
                if (parsed[f] && String(parsed[f]).trim().length > 0) merged[f] = parsed[f];
            });

            if (parsed.skills?.length)         merged.skills         = parsed.skills;
            if (parsed.certifications?.length)  merged.certifications = parsed.certifications;

            if (parsed.experiences?.length) {
                merged.experiences = parsed.experiences.map(e => ({
                    key:        uid(),
                    company:    e.company    || '',
                    title:      e.title      || '',
                    startDate:  e.startDate  || '',
                    endDate:    e.endDate    || '',
                    bulletsRaw: (e.bullets || []).filter(b => b && String(b).trim()).join('\n'),
                    bullets:    (e.bullets || []).filter(b => b && String(b).trim()),
                    dateRange:  [e.startDate, e.endDate].filter(Boolean).join(' – '),
                    initials:   (e.company || '').trim().slice(0, 2).toUpperCase() || '—'
                }));
            }

            if (parsed.education?.length) {
                merged.education = parsed.education.map(e => ({
                    key:    uid(),
                    degree: e.degree || '',
                    field:  e.field  || '',
                    school: e.school || '',
                    years:  e.years  || ''
                }));
            }

            this.formData        = merged;
            this.hasLoadedResume = true;  // Kills the Alex Morgan placeholder immediately

            // Make sure we are in the build step so the preview is visible
            if (this.currentStep !== STEPS.BUILD) {
                this.currentStep = STEPS.BUILD;
            }

            this._setStatus('Resume imported — profile and preview updated.', 'success');

        } catch (e) {
            console.error('JM resume upload failed:', e);
            this._setStatus('Failed to read resume. Please try again.', 'error');
        } finally {
            this.jmIsParsingResume = false;
        }
    }

    handleJmRemoveResume() {
        this.jmResumeText     = '';
        this.jmResumeFileName = '';
        this.jobMatchResult   = null;
        this.optimizedResume  = null;
        // Reset formData to blank so preview clears
        this.formData = {
            fullName: '', title: '', email: '', phone: '',
            location: '', linkedIn: '', summary: '',
            skills: [], certifications: [], experiences: [], education: [],
            photoUrl: '', photoBase64: ''
        };
    }


    handleJobDescriptionInput(event) {
        this.jobDescription = event.target.value;
        if (!event.target.value.trim()) { this.jobMatchResult=null; this.optimizedResume=null; }
    }

    async handleAnalyzeJobMatch() {
        if (!this._requireLogin('feature')) return;   // premium action — login required
        // Hard guard — button should already be disabled but double-check
        if (!this.jmResumeReady) {
            this._setStatus('Please upload your resume first.', 'error');
            return;
        }
        if (!this.jdIsReady) {
            this._setStatus('Paste a job description (at least 50 characters).', 'error');
            return;
        }
        this.isAnalyzingJob=true; this.jobMatchResult=null; this.optimizedResume=null;
        try {
            this._setStatus('Analysing job match...','info');
            // Prefer structured formData (gives GPT more context) if populated from upload or builder.
            // Fall back to raw resumeText only when formData is truly empty.
            const hasStructuredData = !!(this.formData?.fullName || this.formData?.summary ||
                                         this.formData?.experiences?.length);
            const analyzeBody = hasStructuredData
                ? { resumeData: this.formData, resumeText: this.jmResumeText, jobDescription: this.jobDescription }
                : { resumeText: this.jmResumeText, jobDescription: this.jobDescription };
            const r = await this.apiFetch(RAILWAY_URL+'/analyze-job-match',{method:'POST',headers:{'Content-Type':'application/json','x-client-id':this.clientId},body:JSON.stringify(analyzeBody)},60000);
            if (await this._isGated(r)) { this.isAnalyzingJob = false; return; }   // login / quota gate
            if(r.status===429){this._setStatus('Too many requests. Please wait a minute.','error');return;}
            if(!r.ok) {
                const errData = await r.json().catch(() => ({}));
                this._setStatus(errData.error || 'Analysis failed. Try again.','error');
                return;
            }
            this.jobMatchResult = await r.json();
            this._setStatus('Analysis complete!','success');
        } catch(e){ this._setStatus('Analysis failed. Check your connection and try again.','error'); }
        finally { this.isAnalyzingJob=false; }
    }

    async handleOptimizeForJob() {
        if(!this.jobMatchResult){this._setStatus('Run analysis first.','error');return;}
        this.isOptimizingJob=true;
        try {
            this._setStatus('Optimising for this role...','info');
            const hasStructuredDataOpt = !!(this.formData?.fullName || this.formData?.summary ||
                                              this.formData?.experiences?.length);
            const optimizeBody = hasStructuredDataOpt
                ? { resumeData: this.formData, resumeText: this.jmResumeText, jobDescription: this.jobDescription }
                : { resumeText: this.jmResumeText, jobDescription: this.jobDescription };
            const r = await this.apiFetch(RAILWAY_URL+'/optimize-for-job',{method:'POST',headers:{'Content-Type':'application/json','x-client-id':this.clientId},body:JSON.stringify(optimizeBody)},60000);
            if(!r.ok) throw new Error('failed');
            const result = await r.json();
            this.optimizedResume=result.optimizedResume; this.showOptimizeModal=true;
            this._setStatus('Done — review the changes.','success');
        } catch(e){ this._setStatus('Optimisation failed.','error'); }
        finally { this.isOptimizingJob=false; }
    }

    async handleApplyOptimizations() {
        if (!this.optimizedResume) return;
        this.showOptimizeModal      = false;
        this.isApplyingOptimization = true;
        await new Promise(r => setTimeout(r, 40));
        try {
            const opt    = this.optimizedResume;
            const merged = { ...this.formData };

            // Profile fields
            if (opt.fullName?.trim())  merged.fullName  = opt.fullName;
            if (opt.title?.trim())     merged.title     = opt.title;
            if (opt.email?.trim())     merged.email     = opt.email;
            if (opt.phone?.trim())     merged.phone     = opt.phone;
            if (opt.location?.trim())  merged.location  = opt.location;
            if (opt.linkedIn?.trim())  merged.linkedIn  = opt.linkedIn;
            if (opt.summary?.trim())   merged.summary   = opt.summary;

            // Skills & certs
            if (opt.skills?.length)         merged.skills         = opt.skills;
            if (opt.certifications?.length) merged.certifications = opt.certifications;

            // Education
            if (opt.education?.length) {
                merged.education = opt.education.map((e, i) => {
                    const orig = (this.formData.education || [])[i] || {};
                    return { key: orig.key||uid(), degree:e.degree||orig.degree||'', field:e.field||orig.field||'',
                             school:e.school||orig.school||'', years:e.years||orig.years||'' };
                });
            }

            // Experiences — merge bullets onto original entries; preserve company/title/dates
            if (opt.experiences?.length) {
                const base = this.formData.experiences || [];
                const optExps = opt.experiences.map((optExp, i) => {
                    const orig    = base[i] || {};
                    const bullets = optExp.bullets?.length ? optExp.bullets : (orig.bullets || []);
                    return {
                        key:        orig.key       || uid(),
                        company:    orig.company   || optExp.company   || '',
                        title:      orig.title     || optExp.title     || '',
                        startDate:  orig.startDate || optExp.startDate || '',
                        endDate:    orig.endDate   || optExp.endDate   || '',
                        dateRange:  orig.dateRange || [orig.startDate||optExp.startDate, orig.endDate||optExp.endDate].filter(Boolean).join(' – '),
                        initials:   orig.initials  || (orig.company||optExp.company||'').trim().slice(0,2).toUpperCase()||'—',
                        bullets,
                        bulletsRaw: bullets.join('\n')
                    };
                });
                // Keep any extra original experiences the optimizer didn't touch
                const extra = base.slice(opt.experiences.length);
                merged.experiences = [...optExps, ...extra];
            }

            // Single atomic assignment — LWC re-renders once
            this.formData          = merged;
            this.hasLoadedResume   = true;
            this.activeSection     = SECTIONS.PROFILE;
        } finally {
            this.isApplyingOptimization = false;
        }
        this._setStatus('Resume fully optimised. Review each section.', 'success');
    }

    handleDismissOptimization() { this.showOptimizeModal=false; this.optimizedResume=null; };

    stopPropagation(event) { event.stopPropagation(); };

    closeAnalysisModal() {
        this.showAnalysisModal = false;
    }

    handleAddMissingKeyword(event) {
        const kw=event.currentTarget.dataset.keyword; if(!kw) return;
        if(!(this.formData.skills||[]).map(s=>s.toLowerCase()).includes(kw.toLowerCase())){
            this.formData={...this.formData,skills:[...(this.formData.skills||[]),kw]};
            this._setStatus('"'+kw+'" added to skills.','success');
        }
    }


    goToCalorieCalc() { this.currentStep = STEPS.CALORIE_CALC; };

    handleFoodImageUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            this.foodError = 'Image is too large. Please use a photo under 10 MB.';
            return;
        }

        this.foodError = '';
        const reader  = new FileReader();

        // Promise.resolve() puts the assignment in a microtask so
        // LWC's change detection fires correctly (plain callbacks are not tracked)
        reader.onload = (e) => {
            Promise.resolve().then(() => {
                const [, b64]        = e.target.result.split(',');
                this.foodImageBase64   = b64;
                this.foodImageMimeType = file.type || 'image/jpeg';
                this.foodImagePreview  = e.target.result;
                this.foodResult        = null;
                this.foodError         = '';
            });
        };
        reader.onerror = () => {
            this.foodError = 'Could not read the image file. Please try a different photo.';
        };
        reader.readAsDataURL(file);
    }

    async handleAnalyzeFood() {
        if (!this.foodImageBase64) { this._setStatus('Upload a photo first.', 'error'); return; }
        this.isAnalyzingFood = true;
        this.foodResult = null;
        this.foodError  = '';
        try {
            const r = await this.apiFetch(RAILWAY_URL + '/analyze-food', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-client-id': this.clientId },
                body: JSON.stringify({ imageBase64: this.foodImageBase64, mimeType: this.foodImageMimeType })
            }, 45000);
            if (r.status === 429) { this.foodError = 'Too many requests. Please wait a minute and try again.'; return; }
            if (!r.ok) throw new Error('failed');
            this.foodResult = await r.json();
        } catch (e) {
            console.error('Food analysis error:', e);
            this.foodError = 'Analysis failed — please try a clearer overhead photo.';
        } finally {
            this.isAnalyzingFood = false;
        }
    }

    handleClearFood() {
        this.foodImageBase64 = ''; this.foodImageMimeType = '';
        this.foodImagePreview = ''; this.foodResult = null;
    }

    async apiFetch(url, options = {}, timeoutMs = 30000) {
        const controller = new AbortController();
        const timeout    = setTimeout(() => controller.abort(), timeoutMs);
        try {
            // Inject shared API secret on every request — Layer 1 security
            const secret = typeof import.meta !== 'undefined' && import.meta.env
                ? import.meta.env.VITE_API_SECRET
                : undefined;
            const securedOptions = {
                ...options,
                headers: {
                    ...(options.headers || {}),
                    ...(secret ? { 'x-api-secret': secret } : {}),
                    // Identify the signed-in user so the backend can enforce
                    // plan + daily quota on premium endpoints.
                    ...(this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {})
                }
            };
            const response = await fetch(url, { ...securedOptions, signal: controller.signal });
            return response;
        } finally {
            clearTimeout(timeout);
        }
    }

    // ── Premium gating helpers ──────────────────────────────────────────────
    // True for Pro accounts only. Free + anonymous users get the gated experience.
    get isPro() { return this.currentUser?.plan === 'pro'; }

    // Call before any premium action. Returns false (and shows the auth modal)
    // when the user isn't signed in — the backend requires login for free too.
    _requireLogin(reason = 'feature') {
        if (this.authToken) return true;
        this.authReason   = reason;
        this.showAuthModal = true;
        return false;
    }

    // Inspect a premium API response for the backend's gate codes. Returns true
    // (and surfaces the right upgrade/login modal) when the request was blocked.
    async _isGated(response) {
        if (response.status === 401) {           // not signed in / session expired
            this.authReason    = 'feature';
            this.showAuthModal = true;
            return true;
        }
        if (response.status === 402) {           // QUOTA_EXCEEDED or PRO_REQUIRED
            let code = 'QUOTA_EXCEEDED';
            try { code = (await response.json()).code || code; } catch (_) {}
            this.creditReason   = code === 'PRO_REQUIRED' ? 'pro_required' : 'limit_reached';
            this.showCreditGate = true;
            return true;
        }
        return false;
    }

    async postToApi(endpoint, body) {
        const response = await this.apiFetch(`${RAILWAY_URL}${endpoint}`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json', 'x-client-id': this.clientId },
            body:    JSON.stringify(body)
        });
        if (response.status === 429) throw new Error('RATE_LIMIT');
        if (!response.ok)           throw new Error('API_FAILED');
        return response.json();
    }


    render() {
        const {
            activeResumeData,
            aiFlowStepPill,
            aiGenerateBtnLabel,
            aiProgDot1Class,
            aiProgDot2Class,
            aiProgLine1Class,
            aiProgStep1Class,
            aiProgStep2Class,
            aiPromptExamples,
            analyseButtonDisabled,
            analyzeButtonDisabled,
            analyzeValidationHint,
            canAnalyze,
            displayName,
            displayTitle,
            editorSectionClassAi,
            editorSectionClassDesign,
            editorSectionClassEducation,
            editorSectionClassExperience,
            editorSectionClassProfile,
            editorSectionClassSkills,
            fontFamilyList,
            fontSizeBtnClassLg,
            fontSizeBtnClassMd,
            fontSizeBtnClassSm,
            fontSizeLgClass,
            fontSizeMdClass,
            fontSizeSmClass,
            foodCarbsBarStyle,
            foodCarbsPct,
            foodConfidenceClass,
            foodFatBarStyle,
            foodFatPct,
            foodItems,
            foodNotes,
            foodProteinBarStyle,
            foodProteinPct,
            foodTotalCalories,
            foodTotalCarbs,
            foodTotalFat,
            foodTotalProtein,
            galleryCTAClass,
            galleryClass,
            globalOverlayActive,
            globalOverlayMessage,
            hasAiCss,
            hasBuilderResume,
            hasCertifications,
            hasEducation,
            hasExpSuggestions,
            hasExperience,
            hasFoodError,
            hasFoodImage,
            hasFoodResult,
            hasInspirationFile,
            hasJmUploadedResume,
            hasJobMatchResult,
            hasMissingKeywords,
            hasMissingSkills,
            hasOptimizedResume,
            hasPhoto,
            hasSkills,
            hasStrengths,
            hasSummarySuggestions,
            hasTemplatePrompt,
            hasWeaknesses,
            initials,
            isAiFlowStep1,
            isAiFlowStep2,
            isAiMode,
            isJobMatchSection,
            isNormalSection,
            isStepAiFlow,
            isStepBuild,
            isStepCalorieCalc,
            isStepGallery,
            isStepMethod,
            isStyleDescribe,
            isStyleUpload,
            jdIsReady,
            jmAtsBarStyle,
            jmAtsRingStyle,
            jmAtsScore,
            jmBuilderResumeLabel,
            jmExpSuggestions,
            jmJdMatch,
            jmJdMatchBarStyle,
            jmJdMatchRingStyle,
            jmKeywordBarStyle,
            jmKeywordCoverage,
            jmKeywordRingStyle,
            jmMissingKeywords,
            jmMissingKeywordsCount,
            jmMissingSkills,
            jmMissingSkillsCount,
            jmResumeIsBuilder,
            jmResumeIsEmpty,
            jmResumeIsParsing,
            jmResumeIsUploaded,
            jmResumeReady,
            jmResumeStatus,
            jmSkillsBarStyle,
            jmSkillsCoverage,
            jmSkillsIsZero,
            jmSkillsRingStyle,
            jmStrengths,
            jmStrengthsCount,
            jmSummarySuggestions,
            jmWeaknesses,
            jmWeaknessesCount,
            jobMatchEmpty,
            optimizedExperiences,
            optimizedSkills,
            promptIsOptional,
            promptSectionLabel,
            resumeClass,
            resumeTokenStyle,
            resumeFont,
            resumeFontSize,
            selectedTemplateName,
            showAnalyzeHint,
            showTopbar,
            sidenavClassAi,
            sidenavClassDesign,
            sidenavClassEducation,
            sidenavClassExperience,
            sidenavClassJobMatch,
            sidenavClassProfile,
            sidenavClassSkills,
            statusClass,
            styleDescribeBtnClass,
            styleUploadBtnClass,
            templateGallery,
            topFontSizeLgClass,
            topFontSizeMdClass,
            topFontSizeSmClass,
            topbarStepClassAi,
            topbarStepClassDesign,
            topbarStepClassEducation,
            topbarStepClassExperience,
            topbarStepClassProfile,
            topbarStepClassSkills,
            tplQuickGallery,
            defaultTemplate,
            clientId,
            formData,
            currentStep,
            activeSection,
            selectedGalleryTemplate,
            galleryFilter,
            inspirationBase64,
            inspirationMimeType,
            inspirationFileName,
            newSkill,
            newCert,
            templateStyle,
            templatePrompt,
            aiGeneratedCss,
            fontFamily,
            fontSize,
            jobDescription,
            foodImageBase64,
            foodImageMimeType,
            foodImagePreview,
            isAnalyzingFood,
            foodResult,
            foodError,
            hasLoadedResume,
            isAnalyzingJob,
            isOptimizingJob,
            isExporting,
            jobMatchResult,
            optimizedResume,
            showOptimizeModal,
            isApplyingOptimization,
            aiStyleMethod,
            isSaving,
            isGeneratingAi,
            isParsingResume,
            statusMessage,
            statusKind,
            analysisFeedback,
            showAnalysisModal,
            pdfLibInitialized,
            pdfLibLoaded,
            mammothLibLoaded,
            selectedMode,
            aiFlowStep,
            aiFlowMethod,
            jmResumeText,
            jmResumeFileName,
            jmIsParsingResume,
            aiGeneratedLayout,
            aiGeneratedTokens,
            currentUser,
            authToken,
            showAuthModal,
            authReason,
            showCreditGate,
            creditReason
        } = this;
        const LayoutComponent = getLayout(aiGeneratedLayout || 'two-col');
        return (
            <div ref={r => this._root = r}>

    
    {showAnalysisModal ? (<React.Fragment>
        <div className="rp-review-modal-bg" onClick={(e) => this.closeAnalysisModal(e)}>
            <div className="rp-review-modal" onClick={(e) => this.stopPropagation(e)}>
                <div className="rp-review-modal__head">
                    <div>
                        <span className="rp-review-modal__badge">&#10022; AI Review</span>
                        <h2 className="rp-review-modal__title">Resume Analysis</h2>
                        <p className="rp-review-modal__sub">Here is what AI found about your resume.</p>
                    </div>
                    <button className="rp-review-modal__close" onClick={(e) => this.closeAnalysisModal(e)}>&#215;</button>
                </div>
                <div className="rp-review-modal__body">
                    <p className="rp-review-modal__feedback">{analysisFeedback}</p>
                </div>
                <div className="rp-review-modal__foot">
                    <button className="rp-btn rp-btn--primary" onClick={(e) => this.closeAnalysisModal(e)}>Got it</button>
                </div>
            </div>
        </div>
    </React.Fragment>) : null}

    
    {globalOverlayActive ? (<React.Fragment>
        <div className="rp-overlay">
            <div className="rp-overlay__inner">
                <div className="rp-spinner"></div>
                <p className="rp-overlay__title">{globalOverlayMessage}</p>
                <p className="rp-overlay__sub">Please wait — this takes a few seconds</p>
            </div>
        </div>
    </React.Fragment>) : null}

    {showAuthModal && <AuthModal
        onAuth={(token, user) => this.handleAuthSuccess(token, user)}
        onClose={() => this.handleAuthClose()}
        reason={authReason}
    />}
    {showCreditGate && <CreditGateModal
        user={currentUser}
        reason={creditReason}
        onClose={() => this.handleCreditGateClose()}
        onUpgrade={() => this.handleUpgrade()}
    />}
    <div className="rp-app">

        
        {showTopbar ? (<React.Fragment>
            <header className="rp-topbar">

                <div className="rp-brand">
                    <div className="rp-brand__mark">R</div>
                    <span className="rp-brand__name">Renonym AI</span>
                </div>

                
                {isStepGallery ? (<React.Fragment>
                    <div className="rp-topbar__back-title">
                        <button className="rp-btn rp-btn--ghost" onClick={(e) => this.goBack(e)}>← Back</button>
                        <span className="rp-topbar__page-title">Choose a Template</span>
                    </div>
                    <div className="rp-topbar__actions">
                        <span className="rp-topbar__step-pill">10 Templates</span>
                    </div>
                </React.Fragment>) : null}

                
                {isStepAiFlow ? (<React.Fragment>
                    <div className="rp-topbar__back-title">
                        <button className="rp-btn rp-btn--ghost" onClick={(e) => this.handleAiFlowBack(e)}>← Back</button>
                        <span className="rp-topbar__page-title">AI Design Studio</span>
                    </div>
                    <div className="rp-topbar__actions">
                        <span className="rp-topbar__step-pill rp-topbar__step-pill--ai">{aiFlowStepPill}</span>
                    </div>
                </React.Fragment>) : null}

                
                {isStepMethod ? (<React.Fragment>
                    <div className="rp-topbar__back-title">
                        <button className="rp-btn rp-btn--ghost" onClick={(e) => this.goBack(e)}>← Back</button>
                    </div>
                </React.Fragment>) : null}

                
                {isStepBuild ? (<React.Fragment>

                    <div className="rp-topbar__center">
                        <button className={topbarStepClassProfile} data-section="profile" onClick={(e) => this.handleSectionNav(e)}>
                            <span className="rp-step-dot"></span>Profile
                        </button>
                        <span className="rp-step-sep"></span>
                        <button className={topbarStepClassSkills} data-section="skills" onClick={(e) => this.handleSectionNav(e)}>
                            <span className="rp-step-dot"></span>Skills
                        </button>
                        <span className="rp-step-sep"></span>
                        <button className={topbarStepClassExperience} data-section="experience" onClick={(e) => this.handleSectionNav(e)}>
                            <span className="rp-step-dot"></span>Experience
                        </button>
                        <span className="rp-step-sep"></span>
                        <button className={topbarStepClassEducation} data-section="education" onClick={(e) => this.handleSectionNav(e)}>
                            <span className="rp-step-dot"></span>Education
                        </button>
                        {isAiMode ? (<React.Fragment>
                            <span className="rp-step-sep"></span>
                            <button className={topbarStepClassAi} data-section="ai" onClick={(e) => this.handleSectionNav(e)}>
                                <span className="rp-step-dot rp-step-dot--ai"></span>AI Style
                            </button>
                        </React.Fragment>) : null}
                        <span className="rp-step-sep"></span>
                        <button className={topbarStepClassDesign} data-section="design" onClick={(e) => this.handleSectionNav(e)}>
                            <span className="rp-step-dot"></span>Design
                        </button>
                    </div>

                    <div className="rp-topbar__actions">

                        
                        <div className="rp-topbar__font-controls">
                            <select
                                className="rp-font-family-select"
                                onChange={(e) => this.handleFontFamilySelect(e)}
                            >
                                <option value="Inter">Inter</option>
                                <option value="Helvetica">Helvetica</option>
                                <option value="Georgia">Georgia</option>
                                <option value="Times New Roman">Times NR</option>
                                <option value="Poppins">Poppins</option>
                                <option value="Roboto">Roboto</option>
                                <option value="system-ui">System</option>
                            </select>
                            <div className="rp-topbar__font-size-row">
                                <button className={topFontSizeSmClass} data-size="small"  onClick={(e) => this.handleFontSize(e)} title="Small">S</button>
                                <button className={topFontSizeMdClass} data-size="medium" onClick={(e) => this.handleFontSize(e)} title="Medium">M</button>
                                <button className={topFontSizeLgClass} data-size="large"  onClick={(e) => this.handleFontSize(e)} title="Large">L</button>
                            </div>
                        </div>

                        <span className="rp-topbar__divider"></span>

                        <select
                            className="rp-template-select"
                            value={templateStyle}
                            onChange={(e) => this.handleTemplateChange(e)}
                        >
                            <option value="sf-classic">Classic Pro</option>
                            <option value="sf-modern">Modern Clean</option>
                            <option value="sf-minimal">Minimal ATS</option>
                            <option value="sf-tech">Dark Tech</option>
                            <option value="sf-executive">Executive</option>
                            <option value="nordic-clean">Nordic Clean</option>
                            <option value="emerald-pro">Emerald Pro</option>
                            <option value="graphite">Graphite</option>
                            <option value="mauve-creative">Mauve Creative</option>
                            <option value="terracotta">Terracotta</option>
                            {hasAiCss ? (<React.Fragment>
                                <option value="ai-generated">✦ AI Generated</option>
                            </React.Fragment>) : null}
                        </select>

                        <button className="rp-btn rp-btn--ghost" onClick={(e) => this.handleResumeAnalysis(e)}>AI Review</button>
                        <button className="rp-btn rp-btn--primary" onClick={(e) => this.handleExport(e)}>Export PDF</button>
                        {currentUser
                            ? <UserPill user={currentUser} onLogout={() => this.handleLogout()} />
                            : <button className="rp-topbar__signin" onClick={() => { this.authReason = 'general'; this.showAuthModal = true; }}>Sign in</button>
                        }

                    </div>

                </React.Fragment>) : null}

            </header>
        </React.Fragment>) : null}

        
        {isStepGallery ? (<React.Fragment>
            <main className={galleryClass}>

                <div className="rp-gallery__header">
                    <div>
                        <h1 className="rp-gallery__title">Choose your template</h1>
                        <p className="rp-gallery__sub">
                            Click a template to preview it — then hit "Use this template" to continue.
                        </p>
                    </div>
                    <span className="rp-gallery__count">10 templates</span>
                </div>

                
                <div className="rp-gallery__filters">
                    <button className={'rp-gallery__filter' + (galleryFilter === 'all' ? ' rp-gallery__filter--active' : '')} data-filter="all" onClick={(e) => this.handleGalleryFilterChange(e)}>All</button>
                    <button className={'rp-gallery__filter' + (galleryFilter === 'minimal' ? ' rp-gallery__filter--active' : '')} data-filter="minimal" onClick={(e) => this.handleGalleryFilterChange(e)}>Minimal</button>
                    <button className={'rp-gallery__filter' + (galleryFilter === 'bold' ? ' rp-gallery__filter--active' : '')} data-filter="bold" onClick={(e) => this.handleGalleryFilterChange(e)}>Bold</button>
                    <button className={'rp-gallery__filter' + (galleryFilter === 'executive' ? ' rp-gallery__filter--active' : '')} data-filter="executive" onClick={(e) => this.handleGalleryFilterChange(e)}>Executive</button>
                </div>

                
                <div className="rp-gallery__grid">
                    {(templateGallery || []).map((tpl, _idx) => (<React.Fragment key={tpl.key ?? _idx}>
                        <button
                            key={tpl.key}
                            className={tpl.tileClass}
                            data-tpl={tpl.key}
                            onClick={(e) => this.handleSelectGalleryTemplate(e)}
                        >
                            
                            <div className={tpl.thumbClass}>
                                <div className="rp-tpl-tile__thumb-overlay"></div>
                                
                                <div className="rp-tpl-tile__hover-cta">
                                    <span className="rp-tpl-tile__hover-label">
                                        {tpl.isSelected ? (<React.Fragment>✓ Selected</React.Fragment>) : (<React.Fragment>Use Template</React.Fragment>)}
                                    </span>
                                </div>
                                
                                <div className="rp-tpl-tile__check">✓</div>
                            </div>

                            
                            <div className="rp-tpl-tile__footer">
                                <span className="rp-tpl-tile__name">{tpl.name}</span>
                                <span className="rp-tpl-tile__tag">{tpl.tag}</span>
                            </div>
                        </button>
                    </React.Fragment>))}
                </div>

                
                <div className={galleryCTAClass}>
                    <div className="rp-gallery__cta-selected">
                        <span className="rp-gallery__cta-selected-dot"></span>
                        Selected: <span className="rp-gallery__cta-name">{selectedTemplateName}</span>
                    </div>
                    <button className="rp-gallery__cta-btn" onClick={(e) => this.handleGalleryConfirm(e)}>
                        Use this template →
                    </button>
                </div>

                <div className="rp-gallery__ai-cta">
                    <button className="rp-gallery__ai-btn" onClick={(e) => this.handleStartAiFlow(e)}>
                        ✦ Generate with AI Design
                    </button>
                    <span className="rp-gallery__ai-hint">Describe your style — AI builds a unique template</span>
                </div>

            </main>
        </React.Fragment>) : null}

        
        {isStepAiFlow ? (<React.Fragment>
            <main className="rp-ai-flow">

                
                <div className="rp-ai-flow__progress">

                    <div className={aiProgStep1Class}>
                        <div className={aiProgDot1Class}>1</div>
                        <span className="rp-ai-flow__prog-label">Resume Details</span>
                    </div>

                    <div className={aiProgLine1Class}></div>

                    <div className={aiProgStep2Class}>
                        <div className={aiProgDot2Class}>2</div>
                        <span className="rp-ai-flow__prog-label">Your Style</span>
                    </div>

                </div>

                
                {isAiFlowStep1 ? (<React.Fragment>
                    <div className="rp-ai-flow__panel">

                        <div className="rp-ai-flow__panel-head">
                            <div className="rp-ai-flow__panel-icon">📋</div>
                            <h2 className="rp-ai-flow__panel-title">Start with your resume</h2>
                            <p className="rp-ai-flow__panel-sub">
                                Import your existing resume and let AI pre-fill your details,
                                or build from scratch step by step.
                            </p>
                        </div>

                        <div className="rp-method-grid">

                            <label className="rp-method-card rp-method-card--upload">
                                <input
                                    type="file"
                                    id="rp-ai-flow-file-input"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => this.handleResumeUploadAiFlow(e)}
                                    hidden
                                />
                                <div className="rp-method-card__icon">⬆</div>
                                <h3 className="rp-method-card__title">Import Resume</h3>
                                <p className="rp-method-card__desc">
                                    Upload PDF or DOCX — AI extracts your details instantly.
                                </p>
                                <span className="rp-method-card__tag">PDF, DOC, DOCX</span>
                            </label>

                            <button className="rp-method-card" data-method="manual" onClick={(e) => this.handleAiFlowMethod(e)}>
                                <div className="rp-method-card__icon">✎</div>
                                <h3 className="rp-method-card__title">Fill Manually</h3>
                                <p className="rp-method-card__desc">
                                    Enter your details step-by-step with live preview.
                                </p>
                                <span className="rp-method-card__tag">Guided flow</span>
                            </button>

                        </div>

                        {isParsingResume ? (<React.Fragment>
                            <div className="rp-parse-loading">
                                <div className="rp-spinner rp-spinner--sm"></div>
                                <span>Parsing your resume with AI…</span>
                            </div>
                        </React.Fragment>) : null}

                    </div>
                </React.Fragment>) : null}

                
                {isAiFlowStep2 ? (<React.Fragment>
                    <div className="rp-ai-flow__panel">

                        <div className="rp-ai-flow__panel-head">
                            <div className="rp-ai-flow__panel-icon">🎨</div>
                            <h2 className="rp-ai-flow__panel-title">How do you want to style it?</h2>
                            <p className="rp-ai-flow__panel-sub">
                                Pick one path — you can always tweak from the Design tab after.
                            </p>
                        </div>

                        
                     
                        <div className="rp-style-choice-grid">

    
    <button
        className={styleDescribeBtnClass}
        data-style="describe"
        onClick={(e) => this.handleStyleMethodChoice(e)}
    >
        <span className="rp-style-choice-card__icon">✍</span>

        <div className="rp-style-choice-card__content">
            <span className="rp-style-choice-card__title">
                Describe in words
            </span>

            <span className="rp-style-choice-card__desc">
                Tell AI exactly what style you want
            </span>
        </div>

        <span className="rp-style-choice-card__check">✓</span>
    </button>

    
    <button
        className={styleUploadBtnClass}
        data-style="upload"
        onClick={(e) => this.handleStyleMethodChoice(e)}
    >
        <span className="rp-style-choice-card__icon">📄</span>

        <div className="rp-style-choice-card__content">
            <span className="rp-style-choice-card__title">
                Upload Reference Resume
            </span>

            <span className="rp-style-choice-card__desc">
                Copy layout, typography and visual style
            </span>
        </div>

        <span className="rp-style-choice-card__check">✓</span>
    </button>



</div>

                        </div>

                        
                        {isStyleDescribe ? (<React.Fragment>
                            <div className="rp-style-choice-input">

                                <div className="rp-ai-prompt-box">
                                    <textarea
                                        className="rp-textarea--ai rp-ai-prompt-box__textarea"
                                        rows="5"
                                        value={templatePrompt}
                                        onChange={(e) => this.handleTemplatePrompt(e)}
                                        placeholder="e.g. Minimal Apple-style resume with generous whitespace, elegant sans-serif typography, subtle grey accent lines..."
                                    ></textarea>
                                    <div className="rp-ai-prompt-box__footer">
                                        <span className="rp-ai-prompt-box__count">Be descriptive — the more detail, the better the result</span>
                                    </div>
                                </div>

                                <div className="rp-ai-prompt-examples">
                                    <div className="rp-ai-prompt-examples__label">Try an example</div>
                                    <div className="rp-ai-prompt-examples__row">
                                        {(aiPromptExamples || []).map((ex, _idx) => (<React.Fragment key={ex.key ?? _idx}>
                                            <button
                                                key={ex.label}
                                                className="rp-ai-prompt-chip"
                                                data-prompt={ex.prompt}
                                                onClick={(e) => this.setAiPromptExample(e)}
                                            >{ex.label}</button>
                                        </React.Fragment>))}
                                    </div>
                                </div>

                            </div>
                        </React.Fragment>) : null}

                        
                        {isStyleUpload ? (<React.Fragment>
                            <div className="rp-style-choice-input">

                                <div className="rp-inspiration-note">
                                    <span className="rp-inspiration-note__icon">ℹ</span>
                                    <p className="rp-inspiration-note__text">
                                        AI extracts <strong>visual style only</strong> — layout, typography, colours, spacing.
                                        Your content and the inspiration content are never mixed.
                                    </p>
                                </div>

                                {hasInspirationFile ? (<React.Fragment>
                                    <div className="rp-inspiration-preview">
                                        <span className="rp-inspiration-preview__icon">📎</span>
                                        <div className="rp-inspiration-preview__info">
                                            <span className="rp-inspiration-preview__name">{inspirationFileName}</span>
                                            <span className="rp-inspiration-preview__size">✓ Style will be extracted by AI</span>
                                        </div>
                                        <button
                                            className="rp-inspiration-preview__remove"
                                            onClick={(e) => this.handleRemoveInspiration(e)}
                                            title="Remove"
                                        >×</button>
                                    </div>
                                </React.Fragment>) : (<React.Fragment>
                                    <label
                                        className="rp-inspiration-drop"
                                        htmlFor="rp-inspiration-file-input"
                                        onDragOver={(e) => this.handleInspirationDragOver(e)}
                                        onDragLeave={(e) => this.handleInspirationDragLeave(e)}
                                        onDrop={(e) => this.handleInspirationDrop(e)}
                                    >
                                        <input
                                            type="file"
                                            id="rp-inspiration-file-input"
                                            accept=".pdf,.docx,.png,.jpg,.jpeg"
                                            onChange={(e) => this.handleInspirationUpload(e)}
                                            hidden
                                        />
                                        <span className="rp-inspiration-drop__icon">⬆</span>
                                        <p className="rp-inspiration-drop__title">Drop a file or click to browse</p>
                                        <p className="rp-inspiration-drop__sub">AI extracts layout, colours, typography — not content</p>
                                        <div className="rp-inspiration-drop__types">
                                            <span className="rp-inspiration-drop__type-pill">PDF</span>
                                            <span className="rp-inspiration-drop__type-pill">PNG</span>
                                            <span className="rp-inspiration-drop__type-pill">JPG</span>
                                            <span className="rp-inspiration-drop__type-pill">DOCX</span>
                                        </div>
                                    </label>
                                </React.Fragment>)}

                            </div>
                        </React.Fragment>) : null}

                        
                        <div className="rp-ai-flow__nav">
                            <button className="rp-ai-flow__skip" onClick={(e) => this.handleAiFlowBack(e)}>← Back</button>
                            <button
                                className="rp-ai-flow__generate-btn"
                                onClick={(e) => this.handleAiFlowGenerate(e)}
                            >{aiGenerateBtnLabel}</button>
                        </div>

                </React.Fragment>) : null}

            </main>
        </React.Fragment>) : null}


        
        {isStepMethod ? (<React.Fragment>
            <main className="rp-method">

                <div className="rp-method__hero">
                    <h2 className="rp-method__title">How would you like to start?</h2>
                    <p className="rp-method__sub">
                        Import your existing resume for instant AI-parsing,
                        or build from scratch with live preview.
                    </p>
                </div>

                <div className="rp-method-grid">

                    <label className="rp-method-card rp-method-card--upload">
                        <input
                            type="file"
                            id="rp-resume-file-input"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => this.handleResumeUpload(e)}
                            hidden
                        />
                        <div className="rp-method-card__icon">⬆</div>
                        <h3 className="rp-method-card__title">Import Resume</h3>
                        <p className="rp-method-card__desc">
                            Upload PDF or DOCX — AI extracts your details in seconds.
                            No manual typing needed.
                        </p>
                        <span className="rp-method-card__tag">PDF, DOC, DOCX</span>
                    </label>

                    <button className="rp-method-card" onClick={(e) => this.startManualBuild(e)}>
                        <div className="rp-method-card__icon">✎</div>
                        <h3 className="rp-method-card__title">Build from Scratch</h3>
                        <p className="rp-method-card__desc">
                            Fill in your details step-by-step with live preview
                            updating as you type.
                        </p>
                        <span className="rp-method-card__tag">Guided flow</span>
                    </button>

                </div>

                {isParsingResume ? (<React.Fragment>
                    <div className="rp-parse-loading">
                        <div className="rp-spinner rp-spinner--sm"></div>
                        <span>Parsing your resume with AI…</span>
                    </div>
                </React.Fragment>) : null}

            </main>
        </React.Fragment>) : null}

        
        {isStepBuild ? (<React.Fragment>
            <div className="rp-builder">

                
                <nav className="rp-sidenav">
                    <button className={sidenavClassProfile}    data-section="profile"    onClick={(e) => this.handleSectionNav(e)} title="Profile">
                        <span className="rp-sidenav__icon">👤</span>
                        <span className="rp-sidenav__label">Profile</span>
                    </button>
                    <button className={sidenavClassSkills}     data-section="skills"     onClick={(e) => this.handleSectionNav(e)} title="Skills">
                        <span className="rp-sidenav__icon">⚡</span>
                        <span className="rp-sidenav__label">Skills</span>
                    </button>
                    <button className={sidenavClassExperience} data-section="experience" onClick={(e) => this.handleSectionNav(e)} title="Work Experience">
                        <span className="rp-sidenav__icon">💼</span>
                        <span className="rp-sidenav__label">Work</span>
                    </button>
                    <button className={sidenavClassEducation}  data-section="education"  onClick={(e) => this.handleSectionNav(e)} title="Education">
                        <span className="rp-sidenav__icon">🎓</span>
                        <span className="rp-sidenav__label">Edu</span>
                    </button>
                    {isAiMode ? (<React.Fragment>
                        <button className={sidenavClassAi} data-section="ai" onClick={(e) => this.handleSectionNav(e)} title="AI Style">
                            <span className="rp-sidenav__icon rp-sidenav__icon--ai">✦</span>
                            <span className="rp-sidenav__label">AI Style</span>
                        </button>
                    </React.Fragment>) : null}
                    <button className={sidenavClassDesign} data-section="design" onClick={(e) => this.handleSectionNav(e)} title="Design">
                        <span className="rp-sidenav__icon">🎨</span>
                        <span className="rp-sidenav__label">Design</span>
                    </button>
                    <div className="rp-sidenav__sep"></div>
                    <button className={sidenavClassJobMatch} data-section="jobmatch" onClick={(e) => this.handleSectionNav(e)} title="Job Match Optimizer">
                        <span className="rp-sidenav__icon">🎯</span>
                        <span className="rp-sidenav__label">Job Match</span>
                    </button>
                </nav>

                {isNormalSection ? (<React.Fragment>

                
                <section className="rp-editor">

                    {statusMessage ? (<React.Fragment>
                        <div className={statusClass}>{statusMessage}</div>
                    </React.Fragment>) : null}

                    
                    <div className={editorSectionClassProfile}>

                        <div className="rp-section-header">
                            <h2 className="rp-section-title">Personal Info</h2>
                        </div>

                        <label className="rp-photo-upload">
                            <input type="file" accept="image/*" onChange={(e) => this.handlePhotoUpload(e)} hidden />
                            {hasPhoto ? (<React.Fragment>
                                <img src={formData.photoUrl} className="rp-photo-img" alt="Profile" />
                            </React.Fragment>) : (<React.Fragment>
                                <div className="rp-photo-initials">{initials}</div>
                            </React.Fragment>)}
                            <span className="rp-photo-label">Change photo</span>
                        </label>

                        <div className="rp-field-row">
                            <div className="rp-field">
                                <label className="rp-label">Full Name</label>
                                <input type="text" className="rp-input" data-field="fullName" value={formData.fullName} onChange={(e) => this.handleInput(e)} placeholder="Alex Johnson" />
                            </div>
                            <div className="rp-field">
                                <label className="rp-label">Professional Title</label>
                                <input type="text" className="rp-input" data-field="title" value={formData.title} onChange={(e) => this.handleInput(e)} placeholder="Senior Salesforce Developer" />
                            </div>
                        </div>

                        <div className="rp-field-row">
                            <div className="rp-field">
                                <label className="rp-label">Email</label>
                                <input type="email" className="rp-input" data-field="email" value={formData.email} onChange={(e) => this.handleInput(e)} placeholder="alex@company.com" />
                            </div>
                            <div className="rp-field">
                                <label className="rp-label">Phone</label>
                                <input type="text" className="rp-input" data-field="phone" value={formData.phone} onChange={(e) => this.handleInput(e)} placeholder="+1 555 000 0000" />
                            </div>
                        </div>

                        <div className="rp-field-row">
                            <div className="rp-field">
                                <label className="rp-label">Location</label>
                                <input type="text" className="rp-input" data-field="location" value={formData.location} onChange={(e) => this.handleInput(e)} placeholder="San Francisco, CA" />
                            </div>
                            <div className="rp-field">
                                <label className="rp-label">LinkedIn URL</label>
                                <input type="text" className="rp-input" data-field="linkedIn" value={formData.linkedIn} onChange={(e) => this.handleInput(e)} placeholder="linkedin.com/in/yourname" />
                            </div>
                        </div>

                        <div className="rp-field">
                            <div className="rp-label-row">
                                <label className="rp-label">Professional Summary</label>
                                <button className="rp-ai-inline-btn" onClick={(e) => this.handleImproveSummary(e)}>✦ Improve with AI</button>
                            </div>
                            <textarea className="rp-textarea" rows="5" data-field="summary" onChange={(e) => this.handleInput(e)} placeholder="A results-driven Salesforce developer with 5+ years building enterprise integrations and Lightning components…"></textarea>
                        </div>

                        <div className="rp-section-footer">
                            <button className="rp-btn rp-btn--next" data-section="skills" onClick={(e) => this.handleSectionNav(e)}>Next: Skills →</button>
                        </div>

                    </div>

                    
                    <div className={editorSectionClassSkills}>

                        <div className="rp-section-header">
                            <h2 className="rp-section-title">Skills</h2>
                        </div>

                        <p className="rp-section-hint">Add skills one at a time. Press Enter or click Add.</p>

                        <div className="rp-skill-input-row">
                            <input type="text" className="rp-input" value={newSkill} onChange={(e) => this.handleSkillInput(e)} onKeyDown={(e) => this.handleSkillKeydown(e)} placeholder="e.g. Apex, LWC, Salesforce CPQ" />
                            <button className="rp-btn rp-btn--primary" onClick={(e) => this.handleAddSkill(e)}>Add</button>
                        </div>

                        <div className="rp-pills">
                            {(formData.skills || []).map((s, i) => (<React.Fragment key={s.key ?? i}>
                                <span key={s} className="rp-pill">
                                    {s}
                                    <button className="rp-pill__remove" data-index={i} onClick={(e) => this.handleRemoveSkill(e)}>×</button>
                                </span>
                            </React.Fragment>))}
                        </div>

                        <div className="rp-subsection">
                            <h3 className="rp-subsection-title">Certifications</h3>
                            <div className="rp-skill-input-row">
                                <input type="text" className="rp-input" value={newCert} onChange={(e) => this.handleCertInput(e)} onKeyDown={(e) => this.handleCertKeydown(e)} placeholder="e.g. Salesforce Admin, AWS Solutions Architect" />
                                <button className="rp-btn rp-btn--primary" onClick={(e) => this.handleAddCert(e)}>Add</button>
                            </div>
                            <div className="rp-pills">
                                {(formData.certifications || []).map((c, ci) => (<React.Fragment key={c.key ?? ci}>
                                    <span key={c} className="rp-pill rp-pill--cert">
                                        {c}
                                        <button className="rp-pill__remove" data-index={ci} onClick={(e) => this.handleRemoveCert(e)}>×</button>
                                    </span>
                                </React.Fragment>))}
                            </div>
                        </div>

                        <div className="rp-section-footer">
                            <button className="rp-btn rp-btn--ghost" data-section="profile" onClick={(e) => this.handleSectionNav(e)}>← Back</button>
                            <button className="rp-btn rp-btn--next" data-section="experience" onClick={(e) => this.handleSectionNav(e)}>Next: Experience →</button>
                        </div>

                    </div>

                    
                    <div className={editorSectionClassExperience}>

                        <div className="rp-section-header">
                            <h2 className="rp-section-title">Work Experience</h2>
                        </div>

                        {(formData.experiences || []).map((exp, idx) => (<React.Fragment key={exp.key ?? idx}>
                            <div key={exp.key} className="rp-exp-card">
                                <div className="rp-exp-card__header">
                                    <div className="rp-exp-card__initials">{exp.initials}</div>
                                    <div className="rp-exp-card__meta">
                                        <span className="rp-exp-card__company">{exp.company}</span>
                                        <span className="rp-exp-card__role">{exp.title}</span>
                                    </div>
                                    <button className="rp-exp-card__remove" data-index={idx} onClick={(e) => this.handleRemoveExperience(e)} title="Remove">×</button>
                                </div>
                                <div className="rp-field-row">
                                    <div className="rp-field">
                                        <label className="rp-label">Company</label>
                                        <input type="text" className="rp-input rp-input--sm" data-index={idx} data-field="company" value={exp.company} onChange={(e) => this.handleExperienceChange(e)} placeholder="Acme Corporation" />
                                    </div>
                                    <div className="rp-field">
                                        <label className="rp-label">Job Title</label>
                                        <input type="text" className="rp-input rp-input--sm" data-index={idx} data-field="title" value={exp.title} onChange={(e) => this.handleExperienceChange(e)} placeholder="Senior Developer" />
                                    </div>
                                </div>
                                <div className="rp-field-row">
                                    <div className="rp-field">
                                        <label className="rp-label">Start</label>
                                        <input type="text" className="rp-input rp-input--sm" data-index={idx} data-field="startDate" value={exp.startDate} onChange={(e) => this.handleExperienceChange(e)} placeholder="Jan 2021" />
                                    </div>
                                    <div className="rp-field">
                                        <label className="rp-label">End</label>
                                        <input type="text" className="rp-input rp-input--sm" data-index={idx} data-field="endDate" value={exp.endDate} onChange={(e) => this.handleExperienceChange(e)} placeholder="Present" />
                                    </div>
                                </div>
                                <div className="rp-field">
                                    <label className="rp-label">Key responsibilities (one per line)</label>
                                    <textarea className="rp-textarea rp-textarea--sm" rows="4" data-index={idx} data-field="bulletsRaw" onChange={(e) => this.handleExperienceChange(e)} placeholder="Built Salesforce integration reducing process time by 40%&#10;Led cross-functional team of 4 engineers&#10;Architected LWC component library used across 3 products"></textarea>
                                </div>
                            </div>
                        </React.Fragment>))}

                        <button className="rp-btn rp-btn--ghost rp-add-btn rp-add-btn--bottom" onClick={(e) => this.handleAddExperience(e)}>+ Add role</button>

                        <div className="rp-section-footer">
                            <button className="rp-btn rp-btn--ghost" data-section="skills" onClick={(e) => this.handleSectionNav(e)}>← Back</button>
                            <button className="rp-btn rp-btn--next" data-section="education" onClick={(e) => this.handleSectionNav(e)}>Next: Education →</button>
                        </div>

                    </div>

                    
                    <div className={editorSectionClassEducation}>

                        <div className="rp-section-header">
                            <h2 className="rp-section-title">Education</h2>
                        </div>

                        {(formData.education || []).map((edu, idx) => (<React.Fragment key={edu.key ?? idx}>
                            <div key={edu.key} className="rp-edu-card">
                                <div className="rp-edu-card__header">
                                    <div className="rp-edu-card__meta">
                                        <span className="rp-edu-card__degree">{edu.degree}</span>
                                        <span className="rp-edu-card__school">{edu.school}</span>
                                    </div>
                                    <button className="rp-edu-card__remove" data-index={idx} onClick={(e) => this.handleRemoveEducation(e)} title="Remove">×</button>
                                </div>
                                <div className="rp-field-row">
                                    <div className="rp-field">
                                        <label className="rp-label">Degree</label>
                                        <input type="text" className="rp-input rp-input--sm" data-index={idx} data-field="degree" value={edu.degree} onChange={(e) => this.handleEducationChange(e)} placeholder="Bachelor of Science" />
                                    </div>
                                    <div className="rp-field">
                                        <label className="rp-label">Field of Study</label>
                                        <input type="text" className="rp-input rp-input--sm" data-index={idx} data-field="field" value={edu.field} onChange={(e) => this.handleEducationChange(e)} placeholder="Computer Science" />
                                    </div>
                                </div>
                                <div className="rp-field-row">
                                    <div className="rp-field">
                                        <label className="rp-label">Institution</label>
                                        <input type="text" className="rp-input rp-input--sm" data-index={idx} data-field="school" value={edu.school} onChange={(e) => this.handleEducationChange(e)} placeholder="Stanford University" />
                                    </div>
                                    <div className="rp-field">
                                        <label className="rp-label">Years</label>
                                        <input type="text" className="rp-input rp-input--sm" data-index={idx} data-field="years" value={edu.years} onChange={(e) => this.handleEducationChange(e)} placeholder="2016 – 2020" />
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>))}

                        <button className="rp-btn rp-btn--ghost rp-add-btn rp-add-btn--bottom" onClick={(e) => this.handleAddEducation(e)}>+ Add education</button>

                        <div className="rp-section-footer">
                            <button className="rp-btn rp-btn--ghost" data-section="experience" onClick={(e) => this.handleSectionNav(e)}>← Back</button>
                            {isAiMode ? (<React.Fragment>
                                <button className="rp-btn rp-btn--next" data-section="ai" onClick={(e) => this.handleSectionNav(e)}>Next: AI Style →</button>
                            </React.Fragment>) : (<React.Fragment>
                                <button className="rp-btn rp-btn--next" data-section="design" onClick={(e) => this.handleSectionNav(e)}>Next: Design →</button>
                            </React.Fragment>)}
                        </div>

                    </div>

                    
                    {isAiMode ? (<React.Fragment>
                        <div className={editorSectionClassAi}>

                            <div className="rp-section-header">
                                <h2 className="rp-section-title">AI Style Generator</h2>
                                <span className="rp-ai-section-badge">✦ AI</span>
                            </div>

                            <p className="rp-section-hint">Describe your ideal resume style in plain English.</p>

                            <div className="rp-ai-chips">
                                <button className="rp-ai-chip" data-prompt="Apple-style minimal resume with elegant typography, generous whitespace, and subtle grey accents" onClick={(e) => this.setAiPromptExample(e)}>Apple Minimal</button>
                                <button className="rp-ai-chip" data-prompt="Modern tech resume with dark sidebar, monospace font accents, and cyan highlights" onClick={(e) => this.setAiPromptExample(e)}>Dark Tech</button>
                                <button className="rp-ai-chip" data-prompt="Clean consulting resume with classic serif headings, navy blue accents, and professional grid layout" onClick={(e) => this.setAiPromptExample(e)}>Consulting</button>
                                <button className="rp-ai-chip" data-prompt="Google PM resume with clean data-forward design, bold section headers, and ample breathing room" onClick={(e) => this.setAiPromptExample(e)}>Google PM</button>
                                <button className="rp-ai-chip" data-prompt="Creative director resume with bold typography, editorial layout, and strong visual hierarchy" onClick={(e) => this.setAiPromptExample(e)}>Creative Director</button>
                                <button className="rp-ai-chip" data-prompt="Minimal Netflix-inspired black and white resume with sharp contrast and cinematic spacing" onClick={(e) => this.setAiPromptExample(e)}>Netflix BnW</button>
                            </div>

                            <div className="rp-field">
                                <label className="rp-label">Your design description</label>
                                <textarea className="rp-textarea rp-textarea--ai" rows="5" value={templatePrompt} onChange={(e) => this.handleTemplatePrompt(e)} placeholder="e.g. Minimal Apple-style resume with generous whitespace, elegant sans-serif typography, subtle blue accent lines…"></textarea>
                            </div>

                            <button className="rp-btn rp-btn--ai rp-btn--full" onClick={(e) => this.generateAiTemplate(e)}>
                                <span className="rp-btn__icon">✦</span> Generate AI Resume Style
                            </button>

                            <div className="rp-section-footer">
                                <button className="rp-btn rp-btn--ghost" data-section="education" onClick={(e) => this.handleSectionNav(e)}>← Back</button>
                            </div>

                        </div>
                    </React.Fragment>) : null}

                    
                    <div className={editorSectionClassDesign}>

                        <div className="rp-section-header rp-design-header">
                            <h2 className="rp-section-title">Design</h2>
                            <span className="rp-design-header__live-badge">Live</span>
                        </div>

                        <p className="rp-section-hint">Changes apply instantly to the preview and PDF export.</p>

                        <div className="rp-font-panel">

                            
                            <div className="rp-font-group">
                                <div className="rp-font-group__label">Font Family</div>
                                <div className="rp-font-family-grid">
                                    {(fontFamilyList || []).map((f, _idx) => (<React.Fragment key={f.key ?? _idx}>
                                        <button
                                            key={f.key}
                                            className={f.btnClass}
                                            data-font={f.key}
                                            onClick={(e) => this.handleFontFamily(e)}
                                        >
                                            <span className="rp-font-btn__preview" style={{fontFamily: f.key}}>{f.preview}</span>
                                            <span className="rp-font-btn__name">{f.label}</span>
                                        </button>
                                    </React.Fragment>))}
                                </div>
                            </div>

                            <div className="rp-design-divider"></div>

                            
                            <div className="rp-font-group">
                                <div className="rp-font-group__label">Font Size</div>
                                <div className="rp-font-size-row">
                                    <button className={fontSizeSmClass} data-size="small"  onClick={(e) => this.handleFontSize(e)}>
                                        <span className="rp-font-size-btn__glyph">S</span> Small
                                    </button>
                                    <button className={fontSizeMdClass} data-size="medium" onClick={(e) => this.handleFontSize(e)}>
                                        <span className="rp-font-size-btn__glyph">M</span> Medium
                                    </button>
                                    <button className={fontSizeLgClass} data-size="large"  onClick={(e) => this.handleFontSize(e)}>
                                        <span className="rp-font-size-btn__glyph">L</span> Large
                                    </button>
                                </div>
                            </div>

                            <div className="rp-design-divider"></div>

                            
                            <div className="rp-font-group">
                                <div className="rp-font-group__label">Template</div>
                                <div className="rp-tpl-quick-grid">
                                    {(tplQuickGallery || []).map((tq, _idx) => (<React.Fragment key={tq.key ?? _idx}>
                                        <button
                                            key={tq.key}
                                            className={tq.btnClass}
                                            data-tpl={tq.key}
                                            onClick={(e) => this.handleQuickTemplate(e)}
                                        >
                                            <div className="rp-tpl-quick-btn__swatch" data-tpl={tq.key}></div>
                                            <span className="rp-tpl-quick-btn__label">{tq.name}</span>
                                        </button>
                                    </React.Fragment>))}
                                    {hasAiCss ? (<React.Fragment>
                                        <button className="rp-tpl-quick-btn" data-tpl="ai-generated" onClick={(e) => this.handleQuickTemplate(e)}>
                                            <div className="rp-tpl-quick-btn__swatch" style={{'background':'linear-gradient(135deg, #6d28d9, #9333ea)'}}></div>
                                            <span className="rp-tpl-quick-btn__label">AI Style</span>
                                        </button>
                                    </React.Fragment>) : null}
                                </div>
                            </div>

                        </div>

                    </div>

                </section>

                
                <section className="rp-preview">

                    <div className="rp-preview__header">
                        <span className="rp-preview__title">Live Preview</span>
                        <span className="rp-preview__badge">A4</span>
                    </div>

                    <div className="rp-preview__body">
                        <div className={'rp-preview__scale-wrap' + (currentUser?.plan === 'pro' ? '' : ' rp-preview--free')}>
                            <LayoutComponent
                                data={activeResumeData}
                                resumeClass={resumeClass}
                                resumeStyle={resumeTokenStyle}
                                resumeFont={resumeFont}
                                resumeFontSize={resumeFontSize}
                                hasPhoto={hasPhoto}
                                initials={initials}
                                displayName={displayName}
                                displayTitle={displayTitle}
                                hasSkills={hasSkills}
                                hasCertifications={hasCertifications}
                                hasExperience={hasExperience}
                                hasEducation={hasEducation}
                            />
                            {currentUser?.plan !== 'pro' && (
                                <button className="rp-preview__lock" onClick={(e) => { e.stopPropagation(); this.creditReason = 'pro_required'; this.showCreditGate = true; }}>
                                    🔒 Upgrade to download a clean, watermark-free PDF
                                </button>
                            )}
                        </div>
                    </div>

                </section>

                </React.Fragment>) : null}
                

                
                {isJobMatchSection ? (<React.Fragment>
                    <div className="rp-jm-split">

                        
                        <div className="rp-jm-input-panel">

                            <div className="rp-jm-input-panel__header">
                                <h2 className="rp-jm-panel-title">Job Match Optimizer</h2>
                                <p className="rp-jm-panel-sub">Compare your resume against any job description. AI scores your fit and shows exactly what to fix.</p>
                            </div>

                            
                            <div className="rp-jm-step">
                                <div className="rp-jm-step__label">
                                    <span className="rp-jm-step__num">1</span>
                                    <span className="rp-jm-step__title">Your Resume</span>
                                </div>

                                
                                {jmResumeIsParsing ? (<React.Fragment>
                                    <div className="rp-jm-resume-state rp-jm-resume-state--loading">
                                        <div className="rp-spinner rp-spinner--sm"></div>
                                        <span>AI is reading and parsing your resume...</span>
                                    </div>
                                </React.Fragment>) : null}

                                
                                {jmResumeIsUploaded ? (<React.Fragment>
                                    <div className="rp-jm-resume-state rp-jm-resume-state--ok">
                                        <div className="rp-jm-resume-state__icon">&#10003;</div>
                                        <div className="rp-jm-resume-state__info">
                                            <span className="rp-jm-resume-state__name">{jmBuilderResumeLabel}</span>
                                            <span className="rp-jm-resume-state__sub">{jmResumeFileName} &#8226; Profile &amp; preview updated</span>
                                        </div>
                                        <button className="rp-jm-resume-state__rm" onClick={(e) => this.handleJmRemoveResume(e)} title="Remove">&#215;</button>
                                    </div>
                                </React.Fragment>) : null}

                                
                                {jmResumeIsBuilder ? (<React.Fragment>
                                    <div className="rp-jm-resume-state rp-jm-resume-state--builder">
                                        <div className="rp-jm-resume-state__icon">&#10003;</div>
                                        <div className="rp-jm-resume-state__info">
                                            <span className="rp-jm-resume-state__name">{jmBuilderResumeLabel}</span>
                                            <span className="rp-jm-resume-state__sub">Profile data loaded — ready to analyse</span>
                                        </div>
                                        <label className="rp-jm-resume-state__swap" htmlFor="rp-jm-resume-swap">Upload different</label>
                                        <input type="file" id="rp-jm-resume-swap" accept=".pdf,.doc,.docx" onChange={(e) => this.handleJmResumeUpload(e)} hidden />
                                    </div>
                                </React.Fragment>) : null}

                                
                                {jmResumeIsEmpty ? (<React.Fragment>
                                    <label className="rp-jm-drop" htmlFor="rp-jm-resume-input">
                                        <input type="file" id="rp-jm-resume-input" accept=".pdf,.doc,.docx" onChange={(e) => this.handleJmResumeUpload(e)} hidden />
                                        <div className="rp-jm-drop__ico">&#11014;</div>
                                        <p className="rp-jm-drop__title">Upload your resume</p>
                                        <p className="rp-jm-drop__sub">Drop a file or click to browse — PDF, DOCX or DOC</p>
                                        <div className="rp-jm-drop__types">
                                            <span>PDF</span><span>DOC</span><span>DOCX</span>
                                        </div>
                                    </label>
                                </React.Fragment>) : null}
                            </div>

                            
                            <div className="rp-jm-step">
                                <div className="rp-jm-step__label">
                                    <span className="rp-jm-step__num">2</span>
                                    <span className="rp-jm-step__title">Job Description</span>
                                </div>
                                <textarea
                                    className="rp-jm-jd-textarea"
                                    placeholder="Paste the full job description here...&#10;&#10;e.g. from LinkedIn, Indeed, or a company careers page"
                                    onChange={(e) => this.handleJobDescriptionInput(e)}
                                ></textarea>
                                {jdIsReady ? (<React.Fragment>
                                    <span className="rp-jm-char-hint rp-jm-char-hint--ok">&#10003; Job description ready</span>
                                </React.Fragment>) : (<React.Fragment>
                                    <span className="rp-jm-char-hint">Paste at least 50 characters</span>
                                </React.Fragment>)}
                            </div>

                            
                            <div className="rp-jm-input-panel__footer">
                                {showAnalyzeHint ? (<React.Fragment>
                                    <div className="rp-jm-validation-hint">
                                        <span className="rp-jm-vh__icon">&#9432;</span>
                                        <span>{analyzeValidationHint}</span>
                                    </div>
                                </React.Fragment>) : null}
                                <button className="rp-btn rp-btn--primary rp-jm-analyse-btn" onClick={(e) => this.handleAnalyzeJobMatch(e)} disabled={analyzeButtonDisabled}>
                                    {isAnalyzingJob ? (<React.Fragment>
                                        <span className="rp-spinner rp-spinner--sm rp-spinner--white"></span> Analysing...
                                    </React.Fragment>) : (<React.Fragment>Analyse Match &#8594;</React.Fragment>)}
                                </button>
                            </div>

                        </div>

                        
                        <div className="rp-jm-results-panel">

                            
                            {jobMatchEmpty ? (<React.Fragment>
                                <div className="rp-jm-empty">
                                    <div className="rp-jm-empty__icon">&#127919;</div>
                                    <h3 className="rp-jm-empty__title">See exactly what to change</h3>
                                    <p className="rp-jm-empty__sub">Upload your resume, paste a job description, and get a precise gap analysis with actionable fixes.</p>
                                    <div className="rp-jm-empty__steps">
                                        <div className="rp-jm-empty__step">
                                            <span className="rp-jm-empty__step-num">1</span>
                                            <span>Upload your resume</span>
                                        </div>
                                        <div className="rp-jm-empty__step-arrow">&#8594;</div>
                                        <div className="rp-jm-empty__step">
                                            <span className="rp-jm-empty__step-num">2</span>
                                            <span>Paste the job description</span>
                                        </div>
                                        <div className="rp-jm-empty__step-arrow">&#8594;</div>
                                        <div className="rp-jm-empty__step">
                                            <span className="rp-jm-empty__step-num">3</span>
                                            <span>Get your gap report</span>
                                        </div>
                                    </div>
                                    <div className="rp-jm-empty__features">
                                        <span className="rp-jm-empty__feature">ATS Score</span>
                                        <span className="rp-jm-empty__feature">JD Match %</span>
                                        <span className="rp-jm-empty__feature">Missing Keywords</span>
                                        <span className="rp-jm-empty__feature">Specific Fixes</span>
                                        <span className="rp-jm-empty__feature">AI Rewrite</span>
                                    </div>
                                </div>
                            </React.Fragment>) : null}

                            
                            {isAnalyzingJob ? (<React.Fragment>
                                <div className="rp-jm-loading">
                                    <div className="rp-spinner"></div>
                                    <p className="rp-jm-loading__text">Analysing your resume against the JD...</p>
                                    <p className="rp-jm-loading__sub">Scoring ATS compatibility, keyword overlap, and skill gaps</p>
                                </div>
                            </React.Fragment>) : null}

                            
                            {hasJobMatchResult ? (<React.Fragment>
                                <div className="rp-jm-results-scroll">

                                    
                                    <div className="rp-jm-score-row">
                                        <div className="rp-jm-score-card">
                                            <div className="rp-jm-ring" style={jmAtsRingStyle}>
                                                <div className="rp-jm-ring__inner">
                                                    <span className="rp-jm-ring__num">{jmAtsScore}</span>
                                                    <span className="rp-jm-ring__pct">%</span>
                                                </div>
                                            </div>
                                            <div className="rp-jm-score-card__label">ATS Score</div>
                                        </div>
                                        <div className="rp-jm-score-card">
                                            <div className="rp-jm-ring" style={jmJdMatchRingStyle}>
                                                <div className="rp-jm-ring__inner">
                                                    <span className="rp-jm-ring__num">{jmJdMatch}</span>
                                                    <span className="rp-jm-ring__pct">%</span>
                                                </div>
                                            </div>
                                            <div className="rp-jm-score-card__label">JD Match</div>
                                        </div>
                                        <div className="rp-jm-score-card">
                                            <div className="rp-jm-ring" style={jmKeywordRingStyle}>
                                                <div className="rp-jm-ring__inner">
                                                    <span className="rp-jm-ring__num">{jmKeywordCoverage}</span>
                                                    <span className="rp-jm-ring__pct">%</span>
                                                </div>
                                            </div>
                                            <div className="rp-jm-score-card__label">Keywords</div>
                                        </div>
                                        <div className="rp-jm-score-card">
                                            <div className="rp-jm-ring" style={jmSkillsRingStyle}>
                                                <div className="rp-jm-ring__inner">
                                                    <span className="rp-jm-ring__num">{jmSkillsCoverage}</span>
                                                    <span className="rp-jm-ring__pct">%</span>
                                                </div>
                                            </div>
                                            <div className="rp-jm-score-card__label">Skills</div>
                                            {jmSkillsIsZero ? (<React.Fragment>
                                                <span className="rp-jm-score-card__zero-hint">Add skills to profile</span>
                                            </React.Fragment>) : null}
                                        </div>
                                    </div>

                                    
                                    {hasStrengths ? (<React.Fragment>
                                        <div className="rp-jm-group">
                                            <div className="rp-jm-group__header rp-jm-group__header--green">
                                                <span className="rp-jm-group__icon">&#10003;</span>
                                                <span className="rp-jm-group__title">What you are doing right</span>
                                                <span className="rp-jm-group__count">{jmStrengthsCount}</span>
                                            </div>
                                            {(jmStrengths || []).map((item, _idx) => (<React.Fragment key={item.key ?? _idx}>
                                                <div key={item.key} className="rp-jm-change-card rp-jm-change-card--green">
                                                    <div className="rp-jm-change-card__dot rp-jm-change-card__dot--green"></div>
                                                    <span className="rp-jm-change-card__text">{item.text}</span>
                                                </div>
                                            </React.Fragment>))}
                                        </div>
                                    </React.Fragment>) : null}

                                    
                                    {hasWeaknesses ? (<React.Fragment>
                                        <div className="rp-jm-group">
                                            <div className="rp-jm-group__header rp-jm-group__header--red">
                                                <span className="rp-jm-group__icon">&#9998;</span>
                                                <span className="rp-jm-group__title">Changes needed</span>
                                                <span className="rp-jm-group__count">{jmWeaknessesCount}</span>
                                            </div>
                                            {(jmWeaknesses || []).map((item, _idx) => (<React.Fragment key={item.key ?? _idx}>
                                                <div key={item.key} className="rp-jm-change-card rp-jm-change-card--red">
                                                    <div className="rp-jm-change-card__dot rp-jm-change-card__dot--red"></div>
                                                    <span className="rp-jm-change-card__text">{item.text}</span>
                                                </div>
                                            </React.Fragment>))}
                                        </div>
                                    </React.Fragment>) : null}

                                    
                                    {hasMissingKeywords ? (<React.Fragment>
                                        <div className="rp-jm-group">
                                            <div className="rp-jm-group__header rp-jm-group__header--amber">
                                                <span className="rp-jm-group__icon">&#128273;</span>
                                                <span className="rp-jm-group__title">Missing keywords</span>
                                                <span className="rp-jm-group__count">{jmMissingKeywordsCount}</span>
                                            </div>
                                            <p className="rp-jm-group__hint">These keywords appear in the JD but not in your resume.</p>
                                            <div className="rp-jm-kw-grid">
                                                {(jmMissingKeywords || []).map((item, _idx) => (<React.Fragment key={item.key ?? _idx}>
                                                    <span key={item.key} className="rp-jm-kw-tag">{item.text}</span>
                                                </React.Fragment>))}
                                            </div>
                                        </div>
                                    </React.Fragment>) : null}

                                    
                                    {hasMissingSkills ? (<React.Fragment>
                                        <div className="rp-jm-group">
                                            <div className="rp-jm-group__header rp-jm-group__header--amber">
                                                <span className="rp-jm-group__icon">&#128200;</span>
                                                <span className="rp-jm-group__title">Skills gap</span>
                                                <span className="rp-jm-group__count">{jmMissingSkillsCount}</span>
                                            </div>
                                            <p className="rp-jm-group__hint">Required skills from the JD not found in your resume.</p>
                                            <div className="rp-jm-kw-grid">
                                                {(jmMissingSkills || []).map((item, _idx) => (<React.Fragment key={item.key ?? _idx}>
                                                    <span key={item.key} className="rp-jm-kw-tag">{item.text}</span>
                                                </React.Fragment>))}
                                            </div>
                                        </div>
                                    </React.Fragment>) : null}

                                    
                                    {hasSummarySuggestions ? (<React.Fragment>
                                        <div className="rp-jm-group">
                                            <div className="rp-jm-group__header rp-jm-group__header--blue">
                                                <span className="rp-jm-group__icon">&#128196;</span>
                                                <span className="rp-jm-group__title">Fix your summary</span>
                                            </div>
                                            {(jmSummarySuggestions || []).map((item, _idx) => (<React.Fragment key={item.key ?? _idx}>
                                                <div key={item.key} className="rp-jm-fix-card">
                                                    <div className="rp-jm-fix-card__tag">Action</div>
                                                    <p className="rp-jm-fix-card__text">{item.text}</p>
                                                </div>
                                            </React.Fragment>))}
                                        </div>
                                    </React.Fragment>) : null}

                                    
                                    {hasExpSuggestions ? (<React.Fragment>
                                        <div className="rp-jm-group">
                                            <div className="rp-jm-group__header rp-jm-group__header--blue">
                                                <span className="rp-jm-group__icon">&#128188;</span>
                                                <span className="rp-jm-group__title">Fix your experience bullets</span>
                                            </div>
                                            {(jmExpSuggestions || []).map((item, _idx) => (<React.Fragment key={item.key ?? _idx}>
                                                <div key={item.key} className="rp-jm-fix-card">
                                                    <div className="rp-jm-fix-card__tag">Rewrite</div>
                                                    <p className="rp-jm-fix-card__text">{item.text}</p>
                                                </div>
                                            </React.Fragment>))}
                                        </div>
                                    </React.Fragment>) : null}

                                    
                                    <div className="rp-jm-ai-cta">
                                        <div className="rp-jm-ai-cta__left">
                                            <div className="rp-jm-ai-cta__title">Let AI fix it all for you</div>
                                            <div className="rp-jm-ai-cta__sub">AI rewrites your summary and bullets to naturally incorporate all missing keywords — without inventing anything.</div>
                                        </div>
                                        <button className="rp-btn rp-btn--ai rp-jm-optimize-btn" onClick={(e) => this.handleOptimizeForJob(e)} disabled={isOptimizingJob}>
                                            {isOptimizingJob ? (<React.Fragment>
                                                <span className="rp-spinner rp-spinner--sm rp-spinner--white"></span> Optimising...
                                            </React.Fragment>) : (<React.Fragment>&#10022; Optimize Resume</React.Fragment>)}
                                        </button>
                                    </div>

                                </div>
                            </React.Fragment>) : null}

                        </div>
                    </div>
                </React.Fragment>) : null}
                

            </div>
        </React.Fragment>) : null}
        


        
        {showOptimizeModal ? (<React.Fragment>
            <div className="rp-jm-modal-overlay" onClick={(e) => this.handleDismissOptimization(e)}>
                <div className="rp-jm-modal" onClick={(e) => this.stopPropagation(e)}>

                    <div className="rp-jm-modal__header">
                        <div className="rp-jm-modal__title-wrap">
                            <span className="rp-jm-modal__badge">✦ AI Optimized</span>
                            <h2 className="rp-jm-modal__title">Review Your Optimized Resume</h2>
                            <p className="rp-jm-modal__sub">AI has rephrased your content to better target this role. Review and apply if happy.</p>
                        </div>
                        <button className="rp-jm-modal__close" onClick={(e) => this.handleDismissOptimization(e)}>×</button>
                    </div>

                    <div className="rp-jm-modal__body">

                        
                        <div className="rp-jm-modal__section">
                            <div className="rp-jm-modal__section-title">Professional Summary</div>
                            <div className="rp-jm-modal__original">
                                <span className="rp-jm-modal__label rp-jm-modal__label--before">Before</span>
                                <p className="rp-jm-modal__text">{formData.summary}</p>
                            </div>
                            <div className="rp-jm-modal__optimized">
                                <span className="rp-jm-modal__label rp-jm-modal__label--after">✦ After</span>
                                <p className="rp-jm-modal__text rp-jm-modal__text--new">{optimizedResume.summary}</p>
                            </div>
                        </div>

                        
                        <div className="rp-jm-modal__section">
                            <div className="rp-jm-modal__section-title">Experience Bullets (optimised)</div>
                            {(optimizedExperiences || []).map((exp, _idx) => (<React.Fragment key={exp.key ?? _idx}>
                                <div key={exp.key} className="rp-jm-modal__exp">
                                    <div className="rp-jm-modal__exp-header">
                                        <strong>{exp.company}</strong>
                                        <span className="rp-jm-modal__exp-role">{exp.title}</span>
                                        <span className="rp-jm-modal__exp-date">{exp.dateRange}</span>
                                    </div>
                                    <ul className="rp-jm-modal__bullets">
                                        {(exp.bullets || []).map((b, _idx) => (<React.Fragment key={b.key ?? _idx}>
                                            <li key={b.key} className="rp-jm-modal__bullet">{b.text}</li>
                                        </React.Fragment>))}
                                    </ul>
                                </div>
                            </React.Fragment>))}
                        </div>

                        
                        <div className="rp-jm-modal__section">
                            <div className="rp-jm-modal__section-title">Skills (reordered by relevance)</div>
                            <div className="rp-jm-modal__skills-pills">
                                {(optimizedSkills || []).map((s, _idx) => (<React.Fragment key={s.key ?? _idx}>
                                    <span key={s.key} className="rp-jm-modal__skill-pill">{s.text}</span>
                                </React.Fragment>))}
                            </div>
                        </div>

                    </div>

                    <div className="rp-jm-modal__footer">
                        <button className="rp-btn rp-btn--ghost" onClick={(e) => this.handleDismissOptimization(e)}>Discard</button>
                        <button className="rp-btn rp-btn--ai" onClick={(e) => this.handleApplyOptimizations(e)}>✦ Apply to Resume</button>
                    </div>

                </div>
            </div>
        </React.Fragment>) : null}


    
    {isStepCalorieCalc ? (<React.Fragment>
        <div className="rp-cal-page">

            
            <div className="rp-cal-header">
                <button className="rp-cal-back" onClick={(e) => this.goBack(e)}>&#8592; Back</button>
                <div className="rp-cal-header__title">
                    <span className="rp-cal-header__icon">&#127829;</span>
                    <span>Calorie Calculator</span>
                </div>
                <span className="rp-cal-header__badge">AI-Powered</span>
            </div>

            <div className="rp-cal-body">

                
                <div className="rp-cal-left">

                    
                    {hasFoodImage ? (<React.Fragment>
                        <div className="rp-cal-preview-wrap">
                            <img src={foodImagePreview} className="rp-cal-preview-img" alt="Food" />
                            <button className="rp-cal-clear" onClick={(e) => this.handleClearFood(e)} title="Remove photo">&#215;</button>
                        </div>
                    </React.Fragment>) : (<React.Fragment>
                        <label className="rp-cal-drop" htmlFor="rp-food-input">
                            <input type="file" id="rp-food-input" accept="image/*" onChange={(e) => this.handleFoodImageUpload(e)} hidden />
                            <div className="rp-cal-drop__icon">&#127829;</div>
                            <p className="rp-cal-drop__title">Upload a photo of your meal</p>
                            <p className="rp-cal-drop__sub">JPEG, PNG, HEIC — up to 10 MB</p>
                            <div className="rp-cal-drop__btn">Choose Photo</div>
                        </label>
                    </React.Fragment>)}

                    
                    <div className="rp-cal-tips">
                        <div className="rp-cal-tips__title">&#128161; Tips for best accuracy</div>
                        <ul className="rp-cal-tips__list">
                            <li>Take the photo from directly above the plate</li>
                            <li>Ensure good lighting — natural light works best</li>
                            <li>Include the full plate in the frame</li>
                            <li>Estimates are approximate — portion size matters</li>
                        </ul>
                    </div>

                    
                    {hasFoodError ? (<React.Fragment>
                        <div className="rp-cal-error">
                            <span className="rp-cal-error__icon">&#9888;</span>
                            <span>{foodError}</span>
                        </div>
                    </React.Fragment>) : null}

                    
                    <button className="rp-cal-analyse-btn"  onClick={(e) => this.handleAnalyzeFood(e)} disabled={analyseButtonDisabled}>
                        {isAnalyzingFood ? (<React.Fragment>
                            <span className="rp-spinner rp-spinner--sm rp-spinner--white"></span>
                            Analysing with AI...
                        </React.Fragment>) : (<React.Fragment>
                            {hasFoodImage ? (<React.Fragment>
                                &#128269; Analyse My Meal
                            </React.Fragment>) : (<React.Fragment>
                                Upload a photo first
                            </React.Fragment>)}
                        </React.Fragment>)}
                    </button>

                </div>

                
                <div className="rp-cal-right">

                    
                    {hasFoodResult ? (<React.Fragment>

                        
                        <div className="rp-cal-hero">
                            <div className="rp-cal-hero__num">{foodTotalCalories}</div>
                            <div className="rp-cal-hero__unit">kcal</div>
                            <div className="rp-cal-hero__label">Total Calories</div>
                            <div className={foodConfidenceClass}>{foodConfidence} confidence</div>
                        </div>

                        
                        <div className="rp-cal-macros">
                            <div className="rp-cal-macro rp-cal-macro--protein">
                                <div className="rp-cal-macro__head">
                                    <span className="rp-cal-macro__name">Protein</span>
                                    <span className="rp-cal-macro__val">{foodTotalProtein}g</span>
                                </div>
                                <div className="rp-cal-macro__track">
                                    <div className="rp-cal-macro__fill" style={foodProteinBarStyle}></div>
                                </div>
                                <span className="rp-cal-macro__pct">{foodProteinPct}%</span>
                            </div>
                            <div className="rp-cal-macro rp-cal-macro--carbs">
                                <div className="rp-cal-macro__head">
                                    <span className="rp-cal-macro__name">Carbs</span>
                                    <span className="rp-cal-macro__val">{foodTotalCarbs}g</span>
                                </div>
                                <div className="rp-cal-macro__track">
                                    <div className="rp-cal-macro__fill" style={foodCarbsBarStyle}></div>
                                </div>
                                <span className="rp-cal-macro__pct">{foodCarbsPct}%</span>
                            </div>
                            <div className="rp-cal-macro rp-cal-macro--fat">
                                <div className="rp-cal-macro__head">
                                    <span className="rp-cal-macro__name">Fat</span>
                                    <span className="rp-cal-macro__val">{foodTotalFat}g</span>
                                </div>
                                <div className="rp-cal-macro__track">
                                    <div className="rp-cal-macro__fill" style={foodFatBarStyle}></div>
                                </div>
                                <span className="rp-cal-macro__pct">{foodFatPct}%</span>
                            </div>
                        </div>

                        
                        <div className="rp-cal-items">
                            <div className="rp-cal-items__title">Detected items</div>
                            {(foodItems || []).map((fi, _idx) => (<React.Fragment key={fi.key ?? _idx}>
                                <div key={fi.key} className="rp-cal-item">
                                    <div className="rp-cal-item__left">
                                        <span className="rp-cal-item__name">{fi.name}</span>
                                        <span className="rp-cal-item__portion">{fi.portion}</span>
                                    </div>
                                    <div className="rp-cal-item__right">
                                        <span className="rp-cal-item__kcal">{fi.calories}</span>
                                        <span className="rp-cal-item__unit">kcal</span>
                                    </div>
                                </div>
                            </React.Fragment>))}
                        </div>

                        
                        {foodNotes ? (<React.Fragment>
                            <div className="rp-cal-notes">
                                <span className="rp-cal-notes__icon">&#128203;</span>
                                <p className="rp-cal-notes__text">{foodNotes}</p>
                            </div>
                        </React.Fragment>) : null}

                        
                        <button className="rp-cal-retry" onClick={(e) => this.handleClearFood(e)}>
                            &#8635; Analyse another photo
                        </button>

                    </React.Fragment>) : (<React.Fragment>
                        {isAnalyzingFood ? (<React.Fragment>
                            <div className="rp-cal-loading">
                                <div className="rp-spinner"></div>
                                <p className="rp-cal-loading__title">Identifying food items...</p>
                                <p className="rp-cal-loading__sub">GPT-4o is analysing your meal</p>
                            </div>
                        </React.Fragment>) : (<React.Fragment>
                            <div className="rp-cal-empty">
                                <div className="rp-cal-empty__icon">&#127869;</div>
                                <h3 className="rp-cal-empty__title">Your results will appear here</h3>
                                <p className="rp-cal-empty__sub">Upload a clear photo of your plate and tap Analyse My Meal.</p>
                                <div className="rp-cal-empty__chips">
                                    <span className="rp-cal-empty__chip">Calories per item</span>
                                    <span className="rp-cal-empty__chip">Total kcal</span>
                                    <span className="rp-cal-empty__chip">Protein</span>
                                    <span className="rp-cal-empty__chip">Carbs</span>
                                    <span className="rp-cal-empty__chip">Fat</span>
                                </div>
                            </div>
                        </React.Fragment>)}
                    </React.Fragment>)}

                </div>

            </div>
        </div>
    </React.Fragment>) : null}
    


    </div>
    


            </div>
        );
    }
}

export default ResumeBuilder;
