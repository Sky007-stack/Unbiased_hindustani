const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // ─── Create Default Admin User ────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@unbiasedhindustani.ai' },
    update: {},
    create: {
      email: 'admin@unbiasedhindustani.ai',
      name: 'Admin',
      password: adminPassword,
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ─── Create Categories ────────────────────────────────
  const categories = [
    { name: 'Politics', slug: 'politics', description: 'Indian political news and analysis', icon: '🏛️' },
    { name: 'Technology', slug: 'technology', description: 'Tech industry news and innovations', icon: '💻' },
    { name: 'Business', slug: 'business', description: 'Business and economy news', icon: '📈' },
    { name: 'Sports', slug: 'sports', description: 'Sports news and updates', icon: '⚽' },
    { name: 'Entertainment', slug: 'entertainment', description: 'Bollywood, movies, and pop culture', icon: '🎬' },
    { name: 'Science', slug: 'science', description: 'Science and research breakthroughs', icon: '🔬' },
    { name: 'World', slug: 'world', description: 'International news', icon: '🌍' },
    { name: 'Education', slug: 'education', description: 'Education sector news', icon: '📚' },
    { name: 'Health', slug: 'health', description: 'Health and medical news', icon: '🏥' },
    { name: 'Environment', slug: 'environment', description: 'Climate and environmental news', icon: '🌿' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categories created`);

  // ─── Seed Sample News Articles ────────────────────────
  const sampleArticles = [
    {
      title: 'Parliament Budget Session: Key Highlights and Opposition Response',
      summaryPoints: JSON.stringify([
        'Finance Minister presents Union Budget with focus on infrastructure',
        'Opposition raises concerns over fiscal deficit targets',
        'New tax reforms announced for middle-class income groups',
        'Defence budget sees 15% increase over previous year',
        'Education sector receives highest allocation in recent years',
      ]),
      fullContent: `The Parliament Budget Session 2026 has been one of the most consequential fiscal events in recent Indian parliamentary history. The Finance Minister presented a comprehensive Union Budget with a strong focus on infrastructure development, digital transformation, and social welfare schemes aimed at bolstering India's economic trajectory.

## Key Budget Allocations

The infrastructure sector received a massive boost with over Rs 11 lakh crore allocated for capital expenditure, marking a 15% increase from the previous year. The government emphasized building world-class highways, expanding metro networks to tier-2 cities, and modernizing port infrastructure under the Sagarmala initiative.

## Tax Reforms and Middle Class Relief

In a move welcomed by the salaried class, the Finance Minister announced significant changes to the income tax slabs under the new tax regime. The standard deduction has been increased, and the exemption limit has been raised, providing relief to an estimated 8 crore taxpayers. The government also introduced incentives for first-time homebuyers and simplified GST compliance for small businesses.

## Opposition Response

The opposition benches raised pointed concerns about the widening fiscal deficit, which is projected at 4.5% of GDP. They demanded greater allocation for MGNREGA, criticized the reduction in subsidies for fertilizers, and called for a separate budget allocation for drought-affected states. Several opposition leaders staged a walkout during the debate, alleging that the budget favored corporate interests over agrarian needs.

## Defence and Education

The defence budget saw a 15% increase, with emphasis on indigenous manufacturing under the Make in India initiative. The education sector received its highest-ever allocation, with new IITs, medical colleges, and a National Digital Education Mission announced. Experts have called this a forward-looking budget that balances growth with fiscal prudence, though debates around its inclusive nature continue in Parliament and among economists.`,
      category: 'Politics',
      source: 'AI Generated',
      tags: JSON.stringify(['budget', 'parliament', 'economy']),
      authorId: admin.id,
    },
    {
      title: 'India Digital Revolution: AI Startups Attract Record Global Investment',
      summaryPoints: JSON.stringify([
        'Indian AI startups raised $5.2 billion in funding this year',
        'Government launches National AI Mission with $1 billion allocation',
        'Top tech companies setting up AI research labs in Bangalore',
        'Skills gap remains a concern as demand outpaces talent supply',
        'India ranked 3rd globally in AI research publications',
      ]),
      fullContent: `India's artificial intelligence ecosystem is experiencing an unprecedented surge, transforming the country into one of the world's most dynamic AI innovation hubs. The convergence of government policy, venture capital interest, and a deep talent pool has created a perfect storm for AI-driven growth.

## Record-Breaking Investment

Indian AI startups raised a staggering $5.2 billion in funding during the current financial year, surpassing all previous records. Bengaluru, Hyderabad, and Pune have emerged as the primary AI clusters, with companies like Krutrim, Sarvam AI, and Ola's AI division attracting attention from global investors including Sequoia Capital, Tiger Global, and SoftBank. The Series A and B funding rounds have seen valuations that rival Silicon Valley counterparts.

## Government's National AI Mission

The Government of India launched the ambitious National AI Mission with a $1 billion allocation spread over five years. The mission aims to establish AI centres of excellence in partnership with IITs and IISc, create a national AI marketplace, and develop India-specific large language models (LLMs) that support all 22 official languages. The initiative also includes regulatory sandboxes for AI deployment in healthcare, agriculture, and governance.

## Talent and Skills Challenge

Despite the boom, industry leaders have flagged a significant skills gap. Demand for AI/ML engineers has outpaced supply by a ratio of 3:1, leading to salary inflation in the sector. Major tech companies including Google, Microsoft, and Amazon have responded by setting up dedicated AI research labs in Bangalore, while startups are partnering with universities to create specialized AI curricula.

## Global Standing

India now ranks 3rd globally in AI research publications, behind only the US and China. The country's strength in mathematical sciences, combined with its large developer community, positions it uniquely for the next wave of AI innovation. However, experts caution that responsible AI governance and addressing bias in AI systems remain critical priorities that must keep pace with technological advancement.`,
      category: 'Technology',
      source: 'AI Generated',
      tags: JSON.stringify(['AI', 'startups', 'investment']),
      authorId: admin.id,
    },
    {
      title: 'IPL 2026: New Rules and Team Dynamics Shake Up Cricket Landscape',
      summaryPoints: JSON.stringify([
        'BCCI introduces impact player rule modifications for IPL 2026',
        'Two new franchises added bringing total teams to 12',
        'Record-breaking auction sees players fetching 25+ crore bids',
        'International players express excitement over franchise cricket evolution',
        'Revenue sharing model updated to benefit domestic players',
      ]),
      fullContent: `The Indian Premier League is set for its biggest transformation yet as IPL 2026 brings sweeping changes to the world's most lucrative cricket league. From rule modifications to franchiseexpansion, the upcoming season promises to redefine T20 cricket.

## Impact Player Rule Overhaul

The BCCI has announced significant modifications to the controversial impact player rule introduced in previous seasons. Starting IPL 2026, teams can now substitute an impact player only during the innings break rather than at any point during the match. This change comes after extensive consultations with team owners, players, and cricket analysts who argued that the unlimited substitution was reducing opportunities for all-rounders and skewing team compositions.

## League Expansion to 12 Teams

In a landmark decision, the BCCI has added two new franchises — one based in Guwahati (North East United FC Cricket) and another in Ahmedabad's second franchise. This expansion brings the total number of teams to 12, creating a more complex tournament structure with a longer league phase. Industry analysts estimate the expansion deal was worth over Rs 12,000 crore, reflecting the immense commercial value of IPL.

## Record-Breaking Mega Auction

The IPL 2026 mega auction shattered all previous records, with several players fetching bids exceeding Rs 25 crore. International stars including Harry Brook, Heinrich Klaasen, and Travis Head were among the most sought-after players. Indian uncapped talent also made headlines, with young domestic performers attracting multi-crore bids, signaling the growing trend of teams investing in future potential.

## Revenue Sharing and Player Welfare

Responding to long-standing demands from player associations, the BCCI introduced an updated revenue sharing model that ensures domestic cricketers receive a larger share of tournament earnings. A minimum match fee structure has been established for uncapped players, and mental health support programs have been formalized across all franchises. These welfare measures are expected to make IPL an even more attractive destination for cricketers worldwide.`,
      category: 'Sports',
      source: 'AI Generated',
      tags: JSON.stringify(['IPL', 'cricket', 'BCCI']),
      authorId: admin.id,
    },
  ];

  for (const article of sampleArticles) {
    await prisma.newsArticle.create({ data: article });
  }
  console.log(`✅ ${sampleArticles.length} sample articles created`);

  // ─── Seed Sample Trending Topics (10 per category) ────────
  const trendingTopics = [
    // Politics (10)
    { title: 'Union Budget 2026', description: 'Finance Minister presents Union Budget in Parliament', category: 'Politics', source: 'Google Trends', trendScore: 95, region: 'India' },
    { title: 'Lok Sabha Debate', description: 'Heated debates in Parliament over new legislation', category: 'Politics', source: 'News Outlets', trendScore: 88, region: 'India' },
    { title: 'State Elections 2026', description: 'Assembly elections announced in five states', category: 'Politics', source: 'Google Trends', trendScore: 91, region: 'India' },
    { title: 'PM Foreign Diplomacy', description: 'Prime Minister embarks on crucial diplomatic visits', category: 'Politics', source: 'News Outlets', trendScore: 82, region: 'India' },
    { title: 'CAA Implementation Update', description: 'Citizenship Amendment Act implementation progress', category: 'Politics', source: 'Social Media', trendScore: 85, region: 'India' },
    { title: 'Farm Laws Revision', description: 'Government proposes revised agricultural reform bills', category: 'Politics', source: 'News Outlets', trendScore: 79, region: 'India' },
    { title: 'One Nation One Election', description: 'Parliamentary committee discusses simultaneous elections', category: 'Politics', source: 'Google Trends', trendScore: 87, region: 'India' },
    { title: 'Rajya Sabha Session', description: 'Key bills passed in Rajya Sabha winter session', category: 'Politics', source: 'News Outlets', trendScore: 76, region: 'India' },
    { title: 'Governors Appointment Row', description: 'States and Centre clash over gubernatorial appointments', category: 'Politics', source: 'Social Media', trendScore: 72, region: 'India' },
    { title: 'Opposition Alliance Strategy', description: 'Opposition parties form strategy for upcoming elections', category: 'Politics', source: 'Social Media', trendScore: 80, region: 'India' },

    // Technology (10)
    { title: 'AI Revolution India', description: 'India emerges as global AI hub with record investments', category: 'Technology', source: 'Google Trends', trendScore: 92, region: 'India' },
    { title: 'Digital India 3.0 Launch', description: 'Government launches next phase of Digital India initiative', category: 'Technology', source: 'News Outlets', trendScore: 85, region: 'India' },
    { title: 'Semiconductor Fab India', description: 'First Indian semiconductor fabrication plant begins production', category: 'Technology', source: 'Google Trends', trendScore: 90, region: 'India' },
    { title: '5G Rural Expansion', description: '5G network expansion reaches rural and remote areas', category: 'Technology', source: 'News Outlets', trendScore: 78, region: 'India' },
    { title: 'Indian LLM Models', description: 'Indian startups launch multilingual AI language models', category: 'Technology', source: 'Social Media', trendScore: 88, region: 'India' },
    { title: 'Deepfake Regulation Bill', description: 'Government introduces bill to regulate deepfake technology', category: 'Technology', source: 'News Outlets', trendScore: 82, region: 'India' },
    { title: 'EV Battery Tech India', description: 'Indian companies develop advanced EV battery technology', category: 'Technology', source: 'Google Trends', trendScore: 80, region: 'India' },
    { title: 'Cybersecurity Framework', description: 'India updates national cybersecurity policy framework', category: 'Technology', source: 'News Outlets', trendScore: 75, region: 'India' },
    { title: 'Drone Delivery Services', description: 'Commercial drone delivery services launch in metro cities', category: 'Technology', source: 'Social Media', trendScore: 77, region: 'India' },
    { title: 'Quantum Computing India', description: 'IIT researchers achieve quantum computing breakthrough', category: 'Technology', source: 'Public Interest', trendScore: 83, region: 'India' },

    // Business (10)
    { title: 'Stock Market Rally', description: 'Sensex crosses historic milestone amid global optimism', category: 'Business', source: 'Google Trends', trendScore: 89, region: 'India' },
    { title: 'UPI Global Expansion', description: 'India UPI payment system goes live in 15+ countries', category: 'Business', source: 'News Outlets', trendScore: 86, region: 'India' },
    { title: 'Startup Unicorn Boom', description: 'Record number of Indian startups achieve unicorn status', category: 'Business', source: 'Google Trends', trendScore: 84, region: 'India' },
    { title: 'RBI Interest Rate Decision', description: 'Reserve Bank announces policy rate decision', category: 'Business', source: 'News Outlets', trendScore: 91, region: 'India' },
    { title: 'GST Revenue Record', description: 'GST collection breaks all-time monthly record', category: 'Business', source: 'News Outlets', trendScore: 82, region: 'India' },
    { title: 'TATA Steel Mega Merger', description: 'Tata Group announces major steel industry consolidation', category: 'Business', source: 'Google Trends', trendScore: 79, region: 'India' },
    { title: 'FDI Inflows Surge', description: 'Foreign direct investment hits record high in Q4', category: 'Business', source: 'News Outlets', trendScore: 77, region: 'India' },
    { title: 'Rupee Dollar Exchange', description: 'Indian rupee strengthens against US dollar', category: 'Business', source: 'Google Trends', trendScore: 80, region: 'India' },
    { title: 'IPO Market Boom 2026', description: 'Multiple high-profile IPOs lined up for February', category: 'Business', source: 'Social Media', trendScore: 85, region: 'India' },
    { title: 'Reliance Jio New Plans', description: 'Jio announces revolutionary new telecom pricing', category: 'Business', source: 'Social Media', trendScore: 88, region: 'India' },

    // Sports (10)
    { title: 'IPL 2026 Auction', description: 'Record bids and new franchises shake up IPL landscape', category: 'Sports', source: 'Social Media', trendScore: 95, region: 'India' },
    { title: 'Champions Trophy 2026', description: 'India cricket team prepares for ICC Champions Trophy', category: 'Sports', source: 'Google Trends', trendScore: 93, region: 'India' },
    { title: 'Neeraj Chopra Olympics', description: 'Neeraj Chopra begins preparation for next Olympics', category: 'Sports', source: 'Social Media', trendScore: 85, region: 'India' },
    { title: 'ISL Football Transfer', description: 'Indian Super League announces major player transfers', category: 'Sports', source: 'Social Media', trendScore: 78, region: 'India' },
    { title: 'India Women Cricket', description: 'Women in Blue dominate international cricket series', category: 'Sports', source: 'News Outlets', trendScore: 82, region: 'India' },
    { title: 'Badminton World Tour', description: 'PV Sindhu and Lakshya Sen shine in BWF World Tour', category: 'Sports', source: 'Google Trends', trendScore: 80, region: 'India' },
    { title: 'Pro Kabaddi League', description: 'Pro Kabaddi League finals draw record viewership', category: 'Sports', source: 'Social Media', trendScore: 77, region: 'India' },
    { title: 'Asian Games Prep', description: 'India contingent training for next Asian Games', category: 'Sports', source: 'News Outlets', trendScore: 74, region: 'India' },
    { title: 'Tennis Grand Slam Indian', description: 'Indian tennis players make Grand Slam history', category: 'Sports', source: 'Google Trends', trendScore: 81, region: 'India' },
    { title: 'Hockey India Revival', description: 'Indian hockey team climbs FIH world rankings', category: 'Sports', source: 'Public Interest', trendScore: 76, region: 'India' },

    // Entertainment (10)
    { title: 'Bollywood Box Office', description: 'Latest blockbuster breaks opening weekend records', category: 'Entertainment', source: 'Social Media', trendScore: 88, region: 'India' },
    { title: 'Oscar Nominations India', description: 'Indian film receives multiple Oscar nominations', category: 'Entertainment', source: 'Google Trends', trendScore: 92, region: 'India' },
    { title: 'OTT Wars India', description: 'Streaming platforms compete with exclusive content', category: 'Entertainment', source: 'Social Media', trendScore: 82, region: 'India' },
    { title: 'South Cinema Dominance', description: 'South Indian films continue pan-India box office domination', category: 'Entertainment', source: 'Google Trends', trendScore: 85, region: 'India' },
    { title: 'Bollywood Celebrity Wedding', description: 'A-list Bollywood celebrity grand wedding event', category: 'Entertainment', source: 'Social Media', trendScore: 90, region: 'India' },
    { title: 'Indian Music Global', description: 'Indian music artists top global streaming charts', category: 'Entertainment', source: 'Social Media', trendScore: 79, region: 'India' },
    { title: 'Bigg Boss Controversy', description: 'Latest Bigg Boss season sparks social media storm', category: 'Entertainment', source: 'Social Media', trendScore: 83, region: 'India' },
    { title: 'Anime Boom India', description: 'Anime and manga gain massive popularity in India', category: 'Entertainment', source: 'Public Interest', trendScore: 75, region: 'India' },
    { title: 'Stand-Up Comedy Wave', description: 'Indian comedians sell out international tours', category: 'Entertainment', source: 'Social Media', trendScore: 77, region: 'India' },
    { title: 'Film Industry AI Debate', description: 'Bollywood debates use of AI in filmmaking', category: 'Entertainment', source: 'News Outlets', trendScore: 80, region: 'India' },

    // Science (10)
    { title: 'ISRO Chandrayaan-4', description: 'ISRO announces next lunar mission timeline and crew', category: 'Science', source: 'Google Trends', trendScore: 94, region: 'India' },
    { title: 'Gaganyaan Mission Update', description: 'India manned space mission reaches testing phase', category: 'Science', source: 'News Outlets', trendScore: 91, region: 'India' },
    { title: 'Gene Therapy India', description: 'Indian scientists achieve breakthrough in gene therapy', category: 'Science', source: 'News Outlets', trendScore: 83, region: 'India' },
    { title: 'Nuclear Fusion Research', description: 'BARC makes progress in nuclear fusion energy research', category: 'Science', source: 'Public Interest', trendScore: 80, region: 'India' },
    { title: 'Mars Orbiter Update', description: 'Mangalyaan-2 mission design review completed', category: 'Science', source: 'Google Trends', trendScore: 85, region: 'India' },
    { title: 'Green Hydrogen Tech', description: 'Indian labs develop cost-effective green hydrogen production', category: 'Science', source: 'News Outlets', trendScore: 78, region: 'India' },
    { title: 'Vaccine Development India', description: 'Indian biotech companies develop next-gen vaccines', category: 'Science', source: 'News Outlets', trendScore: 82, region: 'India' },
    { title: 'Oceanographic Discovery', description: 'Deep-sea research vessel discovers new marine species', category: 'Science', source: 'Public Interest', trendScore: 74, region: 'India' },
    { title: 'AI Drug Discovery', description: 'Indian pharma uses AI for faster drug development', category: 'Science', source: 'Google Trends', trendScore: 79, region: 'India' },
    { title: 'Solar Energy Breakthrough', description: 'IIT researchers develop highly efficient solar cells', category: 'Science', source: 'News Outlets', trendScore: 81, region: 'India' },

    // Education (10)
    { title: 'NEET Exam Reforms', description: 'Supreme Court orders major changes to medical entrance', category: 'Education', source: 'News Outlets', trendScore: 93, region: 'India' },
    { title: 'New Education Policy', description: 'Government announces major reforms in higher education', category: 'Education', source: 'Google Trends', trendScore: 88, region: 'India' },
    { title: 'JEE Pattern Change', description: 'NTA announces revised JEE Main exam pattern', category: 'Education', source: 'Google Trends', trendScore: 90, region: 'India' },
    { title: 'IIT Expansion Plan', description: 'Five new IIT campuses approved for construction', category: 'Education', source: 'News Outlets', trendScore: 82, region: 'India' },
    { title: 'Digital University Launch', description: 'India launches first fully digital university', category: 'Education', source: 'News Outlets', trendScore: 79, region: 'India' },
    { title: 'Board Exam Schedule', description: 'CBSE announces Class 10 and 12 board exam dates', category: 'Education', source: 'Google Trends', trendScore: 91, region: 'India' },
    { title: 'Study Abroad Trends', description: 'Record number of Indian students apply to foreign universities', category: 'Education', source: 'Social Media', trendScore: 77, region: 'India' },
    { title: 'AI in Education Policy', description: 'Government integrates AI tools into school curriculum', category: 'Education', source: 'News Outlets', trendScore: 80, region: 'India' },
    { title: 'Scholarship Programs 2026', description: 'Government launches new merit-based scholarship programs', category: 'Education', source: 'Public Interest', trendScore: 75, region: 'India' },
    { title: 'Skill India Digital', description: 'Skill India program expands with digital certification', category: 'Education', source: 'News Outlets', trendScore: 78, region: 'India' },

    // Health (10)
    { title: 'Ayushman Bharat Expansion', description: 'Government expands health insurance coverage nationwide', category: 'Health', source: 'News Outlets', trendScore: 87, region: 'India' },
    { title: 'Air Quality Crisis Delhi', description: 'Delhi NCR air pollution reaches hazardous levels', category: 'Health', source: 'Google Trends', trendScore: 90, region: 'India' },
    { title: 'New Virus Alert India', description: 'Health agencies monitor new viral infection outbreak', category: 'Health', source: 'News Outlets', trendScore: 85, region: 'India' },
    { title: 'Mental Health Awareness', description: 'India launches nationwide mental health awareness campaign', category: 'Health', source: 'Social Media', trendScore: 78, region: 'India' },
    { title: 'Diabetes Epidemic India', description: 'India reports alarming rise in diabetes cases', category: 'Health', source: 'News Outlets', trendScore: 82, region: 'India' },
    { title: 'AIIMS Expansion Plan', description: 'Government announces 10 new AIIMS across states', category: 'Health', source: 'News Outlets', trendScore: 80, region: 'India' },
    { title: 'Generic Medicine Push', description: 'Government mandates generic prescriptions in hospitals', category: 'Health', source: 'News Outlets', trendScore: 77, region: 'India' },
    { title: 'Yoga Day Initiative', description: 'International Yoga Day preparations across India', category: 'Health', source: 'Social Media', trendScore: 74, region: 'India' },
    { title: 'Telemedicine Growth', description: 'Rural telemedicine services see 300% growth', category: 'Health', source: 'News Outlets', trendScore: 79, region: 'India' },
    { title: 'Food Safety Standards', description: 'FSSAI updates food safety regulations for packaged goods', category: 'Health', source: 'Public Interest', trendScore: 76, region: 'India' },

    // World (10)
    { title: 'India G20 Legacy', description: 'India G20 presidency initiatives continue worldwide impact', category: 'World', source: 'News Outlets', trendScore: 86, region: 'India' },
    { title: 'India-US Trade Deal', description: 'India and US sign landmark bilateral trade agreement', category: 'World', source: 'Google Trends', trendScore: 88, region: 'India' },
    { title: 'Middle East Peace Talks', description: 'India plays mediator role in Middle East peace process', category: 'World', source: 'News Outlets', trendScore: 82, region: 'India' },
    { title: 'BRICS Expansion Impact', description: 'Expanded BRICS bloc reshapes global economic order', category: 'World', source: 'Google Trends', trendScore: 84, region: 'India' },
    { title: 'India UN Security Council', description: 'India pushes for permanent UNSC seat reform', category: 'World', source: 'News Outlets', trendScore: 80, region: 'India' },
    { title: 'China Border Situation', description: 'Latest developments on India-China border relations', category: 'World', source: 'Google Trends', trendScore: 89, region: 'India' },
    { title: 'Global Climate Summit', description: 'India commits to enhanced climate action targets', category: 'World', source: 'News Outlets', trendScore: 78, region: 'India' },
    { title: 'Indian Diaspora Influence', description: 'Indian diaspora gains political influence worldwide', category: 'World', source: 'Social Media', trendScore: 75, region: 'India' },
    { title: 'Russia Ukraine Peace Role', description: 'India offers diplomatic channel for conflict resolution', category: 'World', source: 'News Outlets', trendScore: 83, region: 'India' },
    { title: 'Africa Partnership Summit', description: 'India-Africa partnership summit expands cooperation', category: 'World', source: 'News Outlets', trendScore: 76, region: 'India' },

    // Environment (10)
    { title: 'Climate Summit 2026', description: 'India commits to ambitious renewable energy targets', category: 'Environment', source: 'News Outlets', trendScore: 84, region: 'India' },
    { title: 'Solar Energy Milestone', description: 'India achieves 200GW solar energy installation target', category: 'Environment', source: 'Google Trends', trendScore: 87, region: 'India' },
    { title: 'EV Revolution India', description: 'Electric vehicle sales double in Indian market', category: 'Environment', source: 'Google Trends', trendScore: 85, region: 'India' },
    { title: 'Ganga Cleanup Progress', description: 'Namami Gange project reports significant water quality improvement', category: 'Environment', source: 'News Outlets', trendScore: 79, region: 'India' },
    { title: 'Tiger Population Growth', description: 'India tiger census shows record population increase', category: 'Environment', source: 'News Outlets', trendScore: 82, region: 'India' },
    { title: 'Plastic Ban Enforcement', description: 'Single-use plastic ban enforcement tightened nationwide', category: 'Environment', source: 'News Outlets', trendScore: 78, region: 'India' },
    { title: 'Green Building Standards', description: 'India mandates green building certification for new projects', category: 'Environment', source: 'News Outlets', trendScore: 74, region: 'India' },
    { title: 'Mangrove Restoration', description: 'Coastal mangrove restoration project protects communities', category: 'Environment', source: 'Public Interest', trendScore: 72, region: 'India' },
    { title: 'Carbon Credit Market', description: 'India launches domestic carbon credit trading market', category: 'Environment', source: 'News Outlets', trendScore: 80, region: 'India' },
    { title: 'Urban Flooding Solutions', description: 'Cities adopt sponge city concepts for flood management', category: 'Environment', source: 'Public Interest', trendScore: 76, region: 'India' },
  ];

  for (const topic of trendingTopics) {
    await prisma.trendingTopic.create({ data: topic });
  }
  console.log(`✅ ${trendingTopics.length} trending topics created`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Email: admin@unbiasedhindustani.ai');
  console.log('   Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
