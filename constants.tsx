
import { Department, Goal, Objective } from './types';

export const DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Business Communications Unit' },
  { id: 'dept-2', name: 'Department of Accounting' },
  { id: 'dept-3', name: 'Department of Business Administration' },
  { id: 'dept-4', name: 'Department of Business Economics' },
  { id: 'dept-5', name: 'Department of Commerce' },
  { id: 'dept-6', name: 'Department of Decision Sciences' },
  { id: 'dept-7', name: 'Department of Entrepreneurship' },
  { id: 'dept-8', name: 'Department of Estate Management and Valuation' },
  { id: 'dept-9', name: 'Department of Finance' },
  { id: 'dept-10', name: 'Department of Human Resource Management' },
  { id: 'dept-11', name: 'Department of Information Technology' },
  { id: 'dept-12', name: 'Department of Marketing' },
  { id: 'dept-13', name: 'Department of Public Administration' },
  { id: 'dept-14', name: 'Legal Studies Unit' },
];

export const GOALS: Goal[] = [
  { id: 'goal-1', code: '1', title: 'Academic Excellence' },
  { id: 'goal-2', code: '2', title: 'Research, Innovation and Partnerships' },
  { id: 'goal-3', code: '3', title: 'Human Capital Development' },
  { id: 'goal-4', code: '4', title: 'Infrastructure & Digital Transformation' },
  { id: 'goal-5', code: '5', title: 'Financial Resilience' },
  { id: 'goal-6', code: '6', title: 'Outstanding Student Experience' },
  { id: 'goal-7', code: '7', title: 'National Development, Global Presence and Sustainability' },
];

export const OBJECTIVES: Objective[] = [
  // Goal 1: Academic Excellence
  { id: 'obj-1-1', goalId: 'goal-1', code: '1.1', title: 'Expand Accessibility to higher education' },
  { id: 'obj-1-2', goalId: 'goal-1', code: '1.2', title: 'Enhance the quality and relevance of academic programs' },
  { id: 'obj-1-3', goalId: 'goal-1', code: '1.3', title: 'Encourage more learner-centered active learning through improved delivery and assessment methods' },
  { id: 'obj-1-4', goalId: 'goal-1', code: '1.4', title: 'Develop and implement formal feedback mechanisms to support informed decision making and ensure timely corrective and developmental actions' },

  // Goal 2: Research, Innovation and Partnerships
  { id: 'obj-2-1', goalId: 'goal-2', code: '2.1', title: 'Strengthen staff research output and impact' },
  { id: 'obj-2-2', goalId: 'goal-2', code: '2.2', title: 'Strengthen student research output and impact' },
  { id: 'obj-2-3', goalId: 'goal-2', code: '2.3', title: 'Expand industry networks and partnerships to improve research culture' },

  // Goal 3: Human Capital Development
  { id: 'obj-3-1', goalId: 'goal-3', code: '3.1', title: 'Recruit and Retain high Caliber Staff' },
  { id: 'obj-3-2', goalId: 'goal-3', code: '3.2', title: 'Develop high caliber staff' },
  { id: 'obj-3-3', goalId: 'goal-3', code: '3.3', title: 'Promote balanced workload' },
  { id: 'obj-3-4', goalId: 'goal-3', code: '3.4', title: 'Strengthen the non-academic and supporting staff' },
  { id: 'obj-3-5', goalId: 'goal-3', code: '3.5', title: 'Promote continuous development of non-academic staff' },
  { id: 'obj-3-6', goalId: 'goal-3', code: '3.6', title: 'Create supportive departmental culture that emphasizes teamwork, knowledge sharing and work-life balance' },

  // Goal 4: Infrastructure & Digital Transformation
  { id: 'obj-4-1', goalId: 'goal-4', code: '4.1', title: 'Ensure adequate physical and technological infrastructure at disposal' },
  { id: 'obj-4-2', goalId: 'goal-4', code: '4.2', title: 'Maintain and regularly upgrade digital infrastructure' },
  { id: 'obj-4-3', goalId: 'goal-4', code: '4.3', title: 'Enhance the functionality and accessibility of the Department’s digital platforms (website, LMS, online resource-sharing systems) to support students, staff, and stakeholders' },
  { id: 'obj-4-4', goalId: 'goal-4', code: '4.4', title: 'Introduce incremental improvements in departmental digitalization to improve administrative and academic workflows' },
  { id: 'obj-4-5', goalId: 'goal-4', code: '4.5', title: 'Ensure timely technical support and preventive maintenance for departmental facilities to minimize disruptions' },
  { id: 'obj-4-6', goalId: 'goal-4', code: '4.6', title: 'Develop workspaces to ensure a smooth and calm academic environment within departments' },

  // Goal 5: Financial Resilience
  { id: 'obj-5-1', goalId: 'goal-5', code: '5.1', title: 'Enhance and diversify revenue streams' },
  { id: 'obj-5-2', goalId: 'goal-5', code: '5.2', title: 'Attract, manage, and account for self-generated funds through executive education and consultancy services' },
  { id: 'obj-5-3', goalId: 'goal-5', code: '5.3', title: 'Strengthen collaboration with alumni, corporations, and development partners to secure sponsorships and endowments for departmental activities' },
  { id: 'obj-5-4', goalId: 'goal-5', code: '5.4', title: 'Explore partnerships with government agencies, NGOs, and international organizations for project-based or grant-funded initiatives aligned with departmental expertise' },
  { id: 'obj-5-5', goalId: 'goal-5', code: '5.5', title: 'Strengthen financial planning and revenue utilization' },

  // Goal 6: Outstanding Student Experience
  { id: 'obj-6-1', goalId: 'goal-6', code: '6.1', title: 'Enhance Global Exposure for students' },
  { id: 'obj-6-2', goalId: 'goal-6', code: '6.2', title: 'Develop graduates with a balanced skill pool and enhance their employability skills' },
  { id: 'obj-6-3', goalId: 'goal-6', code: '6.3', title: "Support Students' Professional Development and encourage them to pursue higher education" },
  { id: 'obj-6-4', goalId: 'goal-6', code: '6.4', title: 'Strengthen student support' },
  { id: 'obj-6-5', goalId: 'goal-6', code: '6.5', title: 'Strengthen Alumni Associations and get its involvement in students’ activities and Provide support for Alumni members' },
  { id: 'obj-6-6', goalId: 'goal-6', code: '6.6', title: 'Encourage lifelong learning by cultivating curiosity, adaptability, and continuous self-development among students' },
  { id: 'obj-6-7', goalId: 'goal-6', code: '6.7', title: 'Promote holistic growth while strengthening staff–student relationships' },

  // Goal 7: National Development, Global Presence and Sustainability
  { id: 'obj-7-1', goalId: 'goal-7', code: '7.1', title: 'Ensure all the programmes and the department initiatives are directed towards promoting responsible management education' },
  { id: 'obj-7-2', goalId: 'goal-7', code: '7.2', title: 'Promote social responsibility and community engagement to address local challenges' },
  { id: 'obj-7-3', goalId: 'goal-7', code: '7.3', title: 'Enhance the department’s global visibility and presence' },
  { id: 'obj-7-4', goalId: 'goal-7', code: '7.4', title: 'Build partnerships with regional and international stakeholders to expand reach and influence' },
  { id: 'obj-7-5', goalId: 'goal-7', code: '7.5', title: 'Strengthen Institutional Platforms and Networks' },
];
