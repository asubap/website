export interface AboutContent {
  title: string;
  introduction: string;
  visionTitle: string;
  vision: string;
  missionTitle: string;
  mission: string;
  chapterIntroduction: string;
  chapterActivities: string;
}
export interface MembershipContent {
  title: string;
  steps: { title: string; requirements: string[] }[];
  applicationLabel: string;
  applicationUrl: string;
  footnote: string;
}

export const aboutDefaults: AboutContent = {
  title: 'About Us',
  introduction: `<p>Founded in 1919, Beta Alpha Psi is an honors organization for financial information students and professionals. There are over 300 chapters on college and university campuses, with over 300,000 members initiated since Beta Alpha Psi's formation. All of our chapters are <a href="https://www.aacsb.edu/" target="_blank" rel="noopener noreferrer">AACSB</a> and/or <a href="https://www.equis.org/" target="_blank" rel="noopener noreferrer">EQUIS</a> accredited. We are not a fraternity or sorority but an honors organization.</p>`,
  visionTitle: 'Vision',
  vision: '<p>Beta Alpha Psi will shape the financial and business information professions by developing members into ethical, professional, and confident leaders.</p>',
  missionTitle: 'Mission',
  mission: '<p>The mission of Beta Alpha Psi, the premier international honors and service organization for financial and business information students and professionals, is to inspire and support excellence by: encouraging the study and practice of accountancy, finance, business analytics or digital technology; providing opportunities for service, professional development, and interaction among members and financial professionals; and fostering lifelong ethical, social, and public responsibilities.</p>',
  chapterIntroduction: '<p>The Beta Tau chapter at Arizona State University was established in 2005 as the 65th chapter of Beta Alpha Psi. With over 900 alumni, the Beta Tau chapter was created a vast alumni network among a variety of accounting firms, Fortune 500 companies and small businesses across the US and the world.</p>',
  chapterActivities: '<p>The Beta Tau chapter holds a mixture of different service and professional events throughout the semester to prepare our members for a future in the accounting, finance, and information systems industries. Examples of events include:</p><ul><li><strong>Networking Night Career Fair:</strong> A privately held event where BAP members have a chance to directly meet with recruiters from several firms, giving BAP members a more personal and better exposure than all other ASU students.</li><li><strong>Firm Presentations:</strong> Weekly events and panels where BAP members can learn more about different professional topics, services firms provide, firm culture, as well as job/internship opportunities.</li><li><strong>Jumpstart Service Event:</strong> A signature event where the Beta Tau chapter hosts local high schools at ASU to teach them about a career opportunities at Arizona State University.</li><li><strong>Banquet:</strong> A biannual event where BAP members get to enjoy a nice dinner while seating with professionals all from distinct firms, seeing their peers get inducted and celebrate the milestones of the semester.</li></ul>',
};

export const membershipDefaults: MembershipContent = {
  title: 'Membership Process',
  steps: [
    { title: 'W.P. Carey Student', requirements: [
      'Declare or plan to declare major in Accounting, Finance, Business Data Analytics, or Computer Information Systems.',
      'Complete BAP application during the recruiting window at the beginning of the Fall or Spring semester.',
    ] },
    { title: 'Candidate', requirements: [
      'Must complete the 32 service and professional hours requirement (at least 12 professional hours, at least 12 service hours, at least 4 social hours and 4 hours of your choice) with 16 hours commonly done in one semester.',
      'You can complete up to 5 non-BAP professional hours and 5 non-BAP community service hours, as long as you provide documentation.',
      'Pay the Candidate fee.',
      'Complete first upper-division major course (i.e., ACC 340, FIN 302, CIS 340)*.',
      'Maintain at least a 3.0 major and overall GPA.',
    ] },
    { title: 'Member', requirements: [
      'Membership is achieved once 32 hours are completed and the GPA requirement is met.',
      'Continue to contribute 16 hours per semester (at least 6 professional, at least 6 community service, at least 2 social and 2 of your choice).',
      'Pay the Member fee',
      'Maintain at least a 3.0 major and overall GPA.',
      'All members are eligible to run for positions on the executive board, regardless of how long they have been members.',
    ] },
  ],
  applicationLabel: 'Click Here To Apply!',
  applicationUrl: '',
  footnote: 'Have completed at least one major course (accounting, finance, business analytics or digital technology or corresponding to major area) beyond the principles or introductory level (for transfer students, the most recent qualifying course must be at the initiating institution). Do not need for candidate status, but need to have completed to reach member status.',
};
