const GITHUB_USERNAME = 'RakheebShaik-web';

function parseContributionCount(html) {
  if (!/ContributionCalendar-day/.test(html)) {
    throw new Error('GitHub contribution calendar was not found');
  }
  const counts = [...html.matchAll(/>(\d+) contributions? on [^<]+<\/tool-tip>/gi)];
  return counts.reduce((total, match) => total + Number(match[1]), 0);
}

module.exports = async function handler(_request, response) {
  try {
    const upstream = await fetch(`https://github.com/users/${GITHUB_USERNAME}/contributions`, {
      headers: {
        Accept: 'text/html',
        'User-Agent': 'rakheebshaik.com contribution counter',
      },
    });

    if (!upstream.ok) throw new Error(`GitHub returned ${upstream.status}`);

    const html = await upstream.text();
    const contributions = parseContributionCount(html);

    response.setHeader('Cache-Control', 'no-store, max-age=0');
    response.status(200).json({
      username: GITHUB_USERNAME,
      contributions,
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
