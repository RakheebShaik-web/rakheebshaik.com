const GITHUB_USERNAME = 'RakheebShaik-web';

function parseContributionCalendar(html) {
  if (!/ContributionCalendar-day/.test(html)) {
    throw new Error('GitHub contribution calendar was not found');
  }

  const tooltips = new Map();
  for (const match of html.matchAll(/<tool-tip\b[^>]*for="([^"]+)"[^>]*>(?:No|(\d+)) contributions? on [^<]+<\/tool-tip>/gi)) {
    tooltips.set(match[1], Number(match[2] || 0));
  }

  const days = [];
  for (const match of html.matchAll(/<td\b[^>]*class="[^"]*ContributionCalendar-day[^"]*"[^>]*><\/td>/gi)) {
    const tag = match[0];
    const date = tag.match(/data-date="([^"]+)"/i)?.[1];
    const id = tag.match(/id="([^"]+)"/i)?.[1];
    if (date && id) days.push({ date, count: tooltips.get(id) || 0 });
  }

  if (!days.length) throw new Error('GitHub contribution days were not found');
  days.sort((a, b) => a.date.localeCompare(b.date));

  let longestStreak = 0;
  let runningStreak = 0;
  for (const day of days) {
    runningStreak = day.count > 0 ? runningStreak + 1 : 0;
    longestStreak = Math.max(longestStreak, runningStreak);
  }

  let cursor = days.length - 1;
  let trailingEmptyDays = 0;
  while (cursor >= 0 && days[cursor].count === 0) {
    trailingEmptyDays++;
    cursor--;
  }
  let currentStreak = 0;
  if (trailingEmptyDays <= 1) {
    while (cursor >= 0 && days[cursor].count > 0) {
      currentStreak++;
      cursor--;
    }
  }

  return {
    days,
    contributions: days.reduce((total, day) => total + day.count, 0),
    activeDays: days.filter(day => day.count > 0).length,
    currentStreak,
    longestStreak,
  };
}

function parseContributionCount(html) {
  return parseContributionCalendar(html).contributions;
}

module.exports = async function handler(_request, response) {
  try {
    const headers = { 'User-Agent': 'rakheebshaik.com contribution counter' };
    const [upstream, profileResponse] = await Promise.all([
      fetch(`https://github.com/users/${GITHUB_USERNAME}/contributions`, {
        headers: { ...headers, Accept: 'text/html' },
      }),
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}`, {
        headers: { ...headers, Accept: 'application/vnd.github+json' },
      }),
    ]);

    if (!upstream.ok) throw new Error(`GitHub returned ${upstream.status}`);

    const html = await upstream.text();
    const calendar = parseContributionCalendar(html);
    const profile = profileResponse.ok ? await profileResponse.json() : {};

    response.setHeader('Cache-Control', 'no-store, max-age=0');
    response.status(200).json({
      username: GITHUB_USERNAME,
      ...calendar,
      publicRepos: profile.public_repos ?? null,
      followers: profile.followers ?? null,
      period: 'last 12 months',
      refreshedAt: new Date().toISOString(),
      source: `https://github.com/${GITHUB_USERNAME}`,
    });
  } catch (error) {
    response.setHeader('Cache-Control', 'no-store, max-age=0');
    response.status(502).json({ error: 'GitHub contribution data is temporarily unavailable' });
  }
};

module.exports.parseContributionCount = parseContributionCount;
module.exports.parseContributionCalendar = parseContributionCalendar;
