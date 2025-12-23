
import { Department, Goal, Objective, SubObjective } from './types';

export const DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Department of Accounting' },
  { id: 'dept-2', name: 'Department of Business Administration' },
  { id: 'dept-3', name: 'Department of Entrepreneurship' },
  { id: 'dept-4', name: 'Department of Marketing' },
  { id: 'dept-5', name: 'Department of Decision Sciences' },
  { id: 'dept-6', name: 'Department of Business Economics' },
  { id: 'dept-7', name: 'Department of Estate Management and Valuation' },
  { id: 'dept-8', name: 'Department of Public Administration' },
  { id: 'dept-9', name: 'Department of Information Technology' },
  { id: 'dept-10', name: 'Department of Human Resource Management' },
  { id: 'dept-11', name: 'Department of Finance' },
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
  // Goal 1
  { id: 'obj-1-1', goalId: 'goal-1', code: '1.1', title: 'Expand Accessibility to higher education' },
  { id: 'obj-1-2', goalId: 'goal-1', code: '1.2', title: 'Enhance the quality and relevance of academic programs' },
  { id: 'obj-1-3', goalId: 'goal-1', code: '1.3', title: 'Encourage more learner-centered active learning' },
  { id: 'obj-1-4', goalId: 'goal-1', code: '1.4', title: 'Develop and implement formal feedback mechanisms' },
  // Goal 2
  { id: 'obj-2-1', goalId: 'goal-2', code: '2.1', title: 'Strengthen staff research output and impact' },
  { id: 'obj-2-2', goalId: 'goal-2', code: '2.2', title: 'Strengthen student research output and impact' },
  { id: 'obj-2-3', goalId: 'goal-2', code: '2.3', title: 'Expand industry networks and partnerships' },
  // Goal 3
  { id: 'obj-3-1', goalId: 'goal-3', code: '3.1', title: 'Promote employee well-being and engagement' },
  // Goal 4
  { id: 'obj-4-1', goalId: 'goal-4', code: '4.1', title: 'Modernize ICT infrastructure' },
  // Goal 5
  { id: 'obj-5-1', goalId: 'goal-5', code: '5.1', title: 'Diversify revenue streams' },
  // Goal 6
  { id: 'obj-6-1', goalId: 'goal-6', code: '6.1', title: 'Enhance student support services' },
  // Goal 7
  { id: 'obj-7-1', goalId: 'goal-7', code: '7.1', title: 'Promote Sustainable Development Goals (SDGs)' },
];

export const SUB_OBJECTIVES: SubObjective[] = [
  // 1.1
  { id: 'sub-1-1-1', objectiveId: 'obj-1-1', goalId: 'goal-1', code: '1.1.1', title: 'Expand the student intake' },
  { id: 'sub-1-1-2', objectiveId: 'obj-1-1', goalId: 'goal-1', code: '1.1.2', title: 'Introduce new programmes to address the requirements of the industry' },
  { id: 'sub-1-1-3', objectiveId: 'obj-1-1', goalId: 'goal-1', code: '1.1.3', title: 'Enable academic units to obtain departmental status - Legal unit' },
  { id: 'sub-1-1-4', objectiveId: 'obj-1-1', goalId: 'goal-1', code: '1.1.4', title: 'Design and implement new postgraduate degree programs' },
  { id: 'sub-1-1-5', objectiveId: 'obj-1-1', goalId: 'goal-1', code: '1.1.5', title: 'Expand postgraduate portfolio by strengthening existing postgraduate programs' },
  { id: 'sub-1-1-6', objectiveId: 'obj-1-1', goalId: 'goal-1', code: '1.1.6', title: 'Design and implement Executive Education Programmes/ Extended Programs' },
  { id: 'sub-1-1-7', objectiveId: 'obj-1-1', goalId: 'goal-1', code: '1.1.7', title: 'Improve the quality of external degree programmes' },
  // 1.2
  { id: 'sub-1-2-1', objectiveId: 'obj-1-2', goalId: 'goal-1', code: '1.2.1', title: 'Benchmark curriculum with international standards' },
  // 2.1
  { id: 'sub-2-1-1', objectiveId: 'obj-2-1', goalId: 'goal-2', code: '2.1.1', title: 'Increase indexed journal publications' },
  { id: 'sub-2-1-2', objectiveId: 'obj-2-1', goalId: 'goal-2', code: '2.1.2', title: 'Conduct regular research workshops for faculty staff' },
  // 3.1
  { id: 'sub-3-1-1', objectiveId: 'obj-3-1', goalId: 'goal-3', code: '3.1.1', title: 'Implement a wellness program for academic staff' },
  // 4.1
  { id: 'sub-4-1-1', objectiveId: 'obj-4-1', goalId: 'goal-4', code: '4.1.1', title: 'Upgrade high-speed internet across the faculty buildings' },
  // 5.1
  { id: 'sub-5-1-1', objectiveId: 'obj-5-1', goalId: 'goal-5', code: '5.1.1', title: 'Increase alumni contributions' },
  // 6.1
  { id: 'sub-6-1-1', objectiveId: 'obj-6-1', goalId: 'goal-6', code: '6.1.1', title: 'Launch a new student counseling center' },
  // 7.1
  { id: 'sub-7-1-1', objectiveId: 'obj-7-1', goalId: 'goal-7', code: '7.1.1', title: 'Integrate SDGs into the core curriculum' },
];
