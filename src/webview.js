// In-app browser (webview) detection.
//
// Instagram / Facebook / TikTok / LinkedIn etc. render pages inside an embedded
// webview. Two things silently fail there: window.open() popups (blocked) and
// Google OAuth (Google rejects embedded webviews with disallowed_useragent).
// So in these environments we lead with the email-OTP path, which works entirely
// in-app. See AuthModal.

const IAB_RE = /(FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger|Line\/|MicroMessenger|TikTok|musical_ly|Snapchat|Pinterest|LinkedInApp|Twitter|GSA\/)/i;

function ua() {
    return (typeof navigator !== 'undefined' && navigator.userAgent) || '';
}

export function isInAppBrowser() {
    return IAB_RE.test(ua());
}

export function inAppBrowserName() {
    const u = ua();
    if (/Instagram/i.test(u)) return 'Instagram';
    if (/(FBAN|FBAV|FB_IAB|FBIOS)/i.test(u)) return 'Facebook';
    if (/Messenger/i.test(u)) return 'Messenger';
    if (/(TikTok|musical_ly)/i.test(u)) return 'TikTok';
    if (/LinkedInApp/i.test(u)) return 'LinkedIn';
    if (/Snapchat/i.test(u)) return 'Snapchat';
    if (/Pinterest/i.test(u)) return 'Pinterest';
    return 'this app';
}

export function isAndroid() { return /Android/i.test(ua()); }
export function isIOS()     { return /iPhone|iPad|iPod/i.test(ua()); }
