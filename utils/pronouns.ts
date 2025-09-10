import { PartnerNotificationSettings } from '@/types/period';

export interface PronounSet {
    subject: string; // they, she, he, xe, etc.
    object: string;  // them, her, him, xem, etc.
    possessive: string; // their, her, his, xir, etc.
    reflexive: string; // themselves, herself, himself, xirself, etc.
}

export function getPronouns(settings: PartnerNotificationSettings): PronounSet {
    if (settings.pronouns === 'custom' && settings.customPronouns) {
        // Parse custom pronouns (e.g., "xe/xem/xir/xirself")
        const parts = settings.customPronouns.split('/');
        return {
            subject: parts[0] || 'they',
            object: parts[1] || 'them',
            possessive: parts[2] || 'their',
            reflexive: parts[3] || 'themselves',
        };
    }

    switch (settings.pronouns) {
        case 'she/her':
            return {
                subject: 'she',
                object: 'her',
                possessive: 'her',
                reflexive: 'herself',
            };
        case 'he/him':
            return {
                subject: 'he',
                object: 'him',
                possessive: 'his',
                reflexive: 'himself',
            };
        case 'they/them':
        default:
            return {
                subject: 'they',
                object: 'them',
                possessive: 'their',
                reflexive: 'themselves',
            };
    }
}
