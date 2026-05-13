export const mockThreatProfile = {
  overallScore: 8.4,
  email: 'alex@example.com',
  scanDuration: 23.4,
  modulesRun: 6,

  breaches: {
    score: 9,
    cardTitle: 'Have You Been Hacked?',
    cardDescription:
      "We checked your email against every known data breach. Here's what criminals already have on you.",
    events: [
      {
        breach: 'LinkedIn',
        date: '2021-06-22',
        dataTypes: ['Email', 'Password hash', 'Job title'],
      },
      {
        breach: 'Dropbox',
        date: '2012-07-01',
        dataTypes: ['Email', 'Password hash'],
      },
      {
        breach: 'Adobe',
        date: '2013-10-04',
        dataTypes: ['Email', 'Password hint', 'Username'],
      },
    ],
    aiExplanation:
      'Your LinkedIn breach is the most dangerous. Your job title and email together are enough for a targeted spear-phishing attack. Combined with the Adobe breach from 2013, an attacker can likely guess your current password pattern if you reuse variations.',
  },

  dataExposure: {
    score: 8,
    cardTitle: 'Who Knows Where You Live?',
    cardDescription:
      'Data brokers legally sell your personal information to anyone who asks. This is what they have on file about you.',
    fields: {
      name: 'Alex Johnson',
      address: '14 Maple St, Bucharest',
      phone: '+40712345678',
      employer: 'iTECify',
      socialProfiles: ['linkedin.com/in/alexj', 'twitter.com/alexj'],
    },
    aiExplanation:
      'Your home address combined with your employer and social profiles creates a complete dossier. An attacker can buy this from Whitepages for under $1 and use it to craft a highly believable phishing message or show up at your home pretending to be a delivery person.',
  },

  shadowAccounts: {
    score: 6,
    cardTitle: 'Your Forgotten Accounts',
    cardDescription:
      'We searched 500+ websites for your username. These accounts still exist — and probably still have your old passwords.',
    events: [
      { platform: 'GitHub', url: 'https://github.com/alexj', risk: 'low' },
      { platform: 'Reddit', url: 'https://reddit.com/u/alexj', risk: 'low' },
      { platform: 'MySpace', url: 'https://myspace.com/alexj', risk: 'high' },
      { platform: 'Tumblr', url: 'https://alexj.tumblr.com', risk: 'high' },
      { platform: 'Disqus', url: 'https://disqus.com/alexj', risk: 'medium' },
    ],
    aiExplanation:
      'Your MySpace and Tumblr accounts are the critical ones. These platforms had major breaches and your accounts there likely use passwords from 2010-2015. Attackers run automated tools that try these old passwords on your Gmail and banking accounts — this is called credential stuffing.',
  },

  deepfake: {
    score: 7,
    cardTitle: 'Could Someone Fake Being You?',
    cardDescription:
      'Modern AI can clone your voice in 10 seconds and your face in minutes. We measured how much material is publicly available.',
    totalAudioMinutes: '14:22',
    videoCount: 42,
    platforms: ['Instagram', 'TikTok'],
    riskLevel: 'high',
    aiExplanation:
      'You have over 14 minutes of clear audio across your public Instagram Reels. This is more than enough for ElevenLabs or any free voice cloning tool to create a convincing clone. The most likely attack: someone calls your elderly relatives pretending to be you, claims to be in an emergency, and asks them to transfer money immediately.',
  },

  phishing: {
    score: 8,
    cardTitle: 'See The Attack Before It Happens',
    cardDescription:
      'We built the exact phishing email someone would send you — using only your leaked data. This is what it looks like.',
    simulatedEmail: {
      from: 'delivery@dhl-support.net',
      subject: 'Your delivery to 14 Maple St could not be completed',
      body: 'Hi Alex, your iTECify delivery to 14 Maple St, Bucharest was attempted today at 14:32 but nobody was home. Please click below to reschedule within 24 hours or your package will be returned.',
      dataPointsUsed: [
        { text: '14 Maple St', source: 'Home address from Whitepages data broker' },
        { text: 'Alex', source: 'First name from LinkedIn breach' },
        { text: 'iTECify', source: 'Employer from Hunter.io' },
      ],
    },
    aiExplanation:
      'This email uses three of the most effective psychological manipulation tactics: authority (a known courier brand), personalization (your real address and name), and urgency (24-hour deadline). 94% of people who receive a personalized email like this click the link. You would never know it was fake without this warning.',
  },

  darkWeb: {
    score: 7,
    cardTitle: 'Your Name on the Dark Web',
    cardDescription:
      'We searched dark web forums and credential leak sites for your email and username. Here is what we found.',
    events: [
      {
        type: 'CREDENTIAL_DUMP',
        date: '2024-03-15',
        snippet: 'Email and password hash found in credential dump',
      },
      {
        type: 'PASTE_SITE',
        date: '2023-11-02',
        snippet: 'Email listed in combo list on paste site',
      },
    ],
    aiExplanation:
      'Your email appearing in a credential dump means criminals have a file with your email and an old password. They run these lists automatically against banks, PayPal, and email providers. If you have reused any password from before 2022 anywhere, change it today.',
  },
} as const

export type ThreatProfile = typeof mockThreatProfile
