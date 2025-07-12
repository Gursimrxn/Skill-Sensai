import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/authOptions';
import connectDB from '../../../../lib/db/connection';
import { User } from '../../../../lib/db/models/User';

// Common skills for suggestions
const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#',
  'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'GCP',
  'Docker', 'Kubernetes', 'Git', 'Linux', 'MacOS', 'Windows', 'Android', 'iOS',
  'Flutter', 'React Native', 'Vue.js', 'Angular', 'Express.js', 'Next.js',
  'Spring Boot', 'Django', 'Flask', 'Laravel', 'Ruby on Rails', 'PHP',
  'Go', 'Rust', 'Swift', 'Kotlin', 'Dart', 'R', 'MATLAB', 'Tableau',
  'Power BI', 'Figma', 'Adobe Creative Suite', 'Sketch', 'InVision',
  'Machine Learning', 'Deep Learning', 'Data Science', 'Data Analysis',
  'Artificial Intelligence', 'Computer Vision', 'Natural Language Processing',
  'DevOps', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible',
  'Project Management', 'Agile', 'Scrum', 'Kanban', 'Leadership', 'Communication',
  'Problem Solving', 'Critical Thinking', 'Team Collaboration', 'Mentoring',
  'Public Speaking', 'Technical Writing', 'Documentation', 'Testing',
  'Unit Testing', 'Integration Testing', 'API Development', 'RESTful APIs',
  'GraphQL', 'Microservices', 'System Design', 'Database Design',
  'UI/UX Design', 'User Research', 'Wireframing', 'Prototyping',
  'Digital Marketing', 'SEO', 'Content Creation', 'Social Media Management',
  'Business Analysis', 'Product Management', 'Customer Support', 'Sales'
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    // Get all unique skills from users
    const skillsAggregation = await User.aggregate([
      { $match: { onboardingCompleted: true } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 100 }
    ]);

    const skillsToLearnAggregation = await User.aggregate([
      { $match: { onboardingCompleted: true, skillsToLearn: { $exists: true } } },
      { $unwind: '$skillsToLearn' },
      { $group: { _id: '$skillsToLearn', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 100 }
    ]);

    // Combine and deduplicate skills
    const userSkills = skillsAggregation.map(item => ({ skill: item._id, count: item.count, type: 'skill' }));
    const userSkillsToLearn = skillsToLearnAggregation.map(item => ({ skill: item._id, count: item.count, type: 'skillToLearn' }));
    
    // Merge common skills with user skills
    const allSkills = new Map();
    
    // Add common skills
    COMMON_SKILLS.forEach(skill => {
      allSkills.set(skill.toLowerCase(), { skill, count: 0, isCommon: true });
    });
    
    // Add user skills
    [...userSkills, ...userSkillsToLearn].forEach(item => {
      const key = item.skill.toLowerCase();
      if (allSkills.has(key)) {
        allSkills.get(key).count += item.count;
      } else {
        allSkills.set(key, { skill: item.skill, count: item.count, isCommon: false });
      }
    });

    // Filter by search term if provided
    let filteredSkills = Array.from(allSkills.values());
    if (search) {
      filteredSkills = filteredSkills.filter(item => 
        item.skill.toLowerCase().includes(search)
      );
    }

    // Sort by count (popular first) and then alphabetically
    filteredSkills.sort((a, b) => {
      if (a.count !== b.count) {
        return b.count - a.count;
      }
      return a.skill.localeCompare(b.skill);
    });

    // Limit results
    filteredSkills = filteredSkills.slice(0, limit);

    return NextResponse.json({
      skills: filteredSkills.map(item => ({
        name: item.skill,
        count: item.count,
        isPopular: item.count > 0
      })),
      total: filteredSkills.length
    });

  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
