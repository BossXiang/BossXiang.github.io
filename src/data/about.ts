// A single entity (bio, education, skills) rather than a repeatable list, so
// it lives here as data instead of a one-file-per-item content collection.

export const EMAIL = 'bosszheng220@gmail.com';
export const LINKEDIN = 'https://www.linkedin.com/in/chengwenhsiang';

export const ABOUT = {
  education: [
    {
      when: '2024 to 2026',
      title: 'National Taiwan University',
      detail: 'MSc, Computer Science and Information Engineering. Exchange at the University of Toronto, fall 2026.',
    },
    {
      when: '2019 to 2023',
      title: 'National Taiwan University of Science and Technology',
      detail: 'BSc, Computer Science and Information Engineering. Valedictorian. Exchange at the National University of Singapore.',
    },
  ],
  skills: ['Python', 'C#', 'C / C++', 'TypeScript', 'Solidity', 'Unity', 'Docker', 'Google Cloud'],
  languages: ['Mandarin', 'English', 'Spanish, conversationally', 'Taiwanese, a little'],
  awayFromKeyboard:
    'Dodgeball, making games, and photographs. The ball on the desk is not decoration.',
};
