/* FlClash Android Master v1.0.0 | 2026-10-18
 * Public-safe routing only. No subscription URLs, node credentials or tokens.
 * Entry: main(config). Node inventory comes exclusively from Sub-Store.
 * Replaces routing/DNS fields instead of appending airport rules.
 * Android VPN, app exclusion and subscription schedules belong to FlClash UI.
 */
function main(input) {
  const config = JSON.parse(JSON.stringify(input || {}));
  if (!Array.isArray(config.proxies) || !config.proxies.length) {
    throw new Error('需要 Sub-Store ClashMeta 格式的 proxies 节点输出');
  }
  const names = new Set();
  for (const proxy of config.proxies) {
    if (!proxy.name || names.has(proxy.name)) throw new Error('节点名称为空或重复，请在 Sub-Store 修正');
    names.add(proxy.name);
  }
  const all = [...names];
  const groups = [];
  function group(name, proxies, extra) {
    if (names.has(name)) throw new Error('节点名与策略组冲突: ' + name);
    const item = Object.assign({ name, type: 'select', proxies: [...new Set(proxies)] }, extra || {});
    groups.push(item);
    return name;
  }
  const regions = [
    ['香港节点', /香港|九龙|Hong[ _-]?Kong|\bHK\b|\bHKG\b|🇭🇰/i],
    ['台湾节点', /台湾|台灣|Taiwan|\bTW\b|\bTPE\b|🇹🇼/i],
    ['日本节点', /日本|东京|大阪|Japan|Tokyo|Osaka|\bJP\b|\bNRT\b|🇯🇵/i],
    ['新加坡节点', /新加坡|狮城|Singapore|\bSG\b|\bSIN\b|🇸🇬/i],
    ['美国节点', /美国|美國|洛杉矶|硅谷|西雅图|United[ _-]?States|Los[ _-]?Angeles|Seattle|\bUS\b|\bUSA\b|🇺🇸/i],
    ['韩国节点', /韩国|韓國|首尔|Korea|Seoul|\bKR\b|🇰🇷/i],
    ['英国节点', /英国|英國|London|United[ _-]?Kingdom|\bUK\b|\bGB\b|🇬🇧/i],
    ['德国节点', /德国|德國|Germany|Frankfurt|\bDE\b|🇩🇪/i],
    ['加拿大节点', /加拿大|Canada|Toronto|\bCA\b|🇨🇦/i],
    ['澳大利亚节点', /澳大利亚|澳洲|Australia|Sydney|\bAU\b|🇦🇺/i],
    ['法国节点', /法国|法國|France|Paris|\bFR\b|🇫🇷/i],
    ['荷兰节点', /荷兰|荷蘭|Netherlands|Amsterdam|\bNL\b|🇳🇱/i],
  ];
  const regionGroups = [];
  const classified = new Set();
  for (const [name, regex] of regions) {
    const matches = all.filter(n => regex.test(n.replace(/([A-Za-z]{2})(?=\d)/g, '$1 ')));
    if (matches.length) {
      regionGroups.push(group(name, matches));
      matches.forEach(n => classified.add(n));
    }
  }
  const other = all.filter(n => !classified.has(n));
  if (other.length) regionGroups.push(group('其他地区节点', other));
  group('手动选择', all);
  const probe = { url: 'https://www.gstatic.com/generate_204', interval: 1800, lazy: true };
  group('自动选择', all, Object.assign({ type: 'url-test', tolerance: 100 }, probe));
  group('故障转移', all, Object.assign({ type: 'fallback' }, probe));
  group('选择代理', ['手动选择', ...regionGroups, '自动选择', '故障转移']);
  const choices = ['选择代理', ...regionGroups, '手动选择', '自动选择', '故障转移'];
  const aiChoices = ['美国节点', '日本节点', '新加坡节点'].filter(n => regionGroups.includes(n));
  for (const name of ['ChatGPT', 'Claude', 'Gemini', 'Copilot', '其他AI']) {
    group(name, [...aiChoices, ...choices]);
  }
  for (const name of ['静态资源', '加密货币', '金融服务', '谷歌服务', 'Github', 'Youtube',
    'Netflix', 'Spotify', 'Telegram', 'TikTok', 'Twitter', 'Twitch', '巴哈姆特',
    'E-Hentai', 'PikPak网盘', 'Truth Social']) group(name, [...choices, 'DIRECT']);
  for (const name of ['苹果服务', '微软服务', 'Xbox', '哔哩哔哩', '新浪微博', '搜狗输入法']) {
    group(name, ['DIRECT', ...choices]);
  }
  group('广告拦截', ['REJECT', 'DIRECT']);
  group('Final', [...choices, 'DIRECT']);
  const order = ['选择代理', '手动选择', '自动选择', '故障转移', ...regionGroups,
    '静态资源', 'ChatGPT', 'Claude', 'Gemini', 'Copilot', '其他AI'];
  config['proxy-groups'] = groups.sort((a, b) => {
    const rank = n => order.includes(n) ? order.indexOf(n) : order.length;
    return rank(a.name) - rank(b.name);
  });
  const bm = 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/';
  const providers = {};
  function provider(name, url, behavior, format) {
    providers[name] = { type: 'http', behavior: behavior || 'classical', format: format || 'yaml',
      url, path: './ruleset/android-master/' + name + '.' + (format === 'text' ? 'txt' : 'yaml'),
      interval: 86400, proxy: '选择代理' };
  }
  for (const name of ['OpenAI', 'Claude', 'Gemini', 'Copilot', 'GoogleFCM', 'AdvertisingLite', 'Weibo']) {
    provider(name, bm + name + '/' + name + '.yaml');
  }
  provider('StaticResources', 'https://ruleset.skk.moe/Clash/domainset/cdn.txt', 'domain', 'text');
  provider('SogouInput', 'https://ruleset.skk.moe/Clash/non_ip/sogouinput.txt', 'classical', 'text');
  provider('GFWList', 'https://raw.githubusercontent.com/Loyalsoldier/clash-rules/release/gfw.txt', 'domain');
  config['rule-providers'] = providers;
  // Original user AI exceptions are inserted here by the build step.
  const aiRules = [
    "DOMAIN-SUFFIX,openai.com,ChatGPT",
    "DOMAIN-SUFFIX,chatgpt.com,ChatGPT",
    "DOMAIN-SUFFIX,oaistatic.com,ChatGPT",
    "DOMAIN-SUFFIX,oaiusercontent.com,ChatGPT",
    "DOMAIN-SUFFIX,sora.com,ChatGPT",
    "DOMAIN-SUFFIX,anthropic.com,Claude",
    "DOMAIN-SUFFIX,claude.ai,Claude",
    "DOMAIN-SUFFIX,claude.com,Claude",
    "DOMAIN-SUFFIX,claudeusercontent.com,Claude",
    "DOMAIN,gemini.google.com,Gemini",
    "DOMAIN,aistudio.google.com,Gemini",
    "DOMAIN,ai.google.dev,Gemini",
    "DOMAIN,generativelanguage.googleapis.com,Gemini",
    "DOMAIN-SUFFIX,generativeai.google,Gemini",
    "DOMAIN-SUFFIX,deepmind.com,Gemini",
    "DOMAIN-SUFFIX,deepmind.google,Gemini",
    "DOMAIN-SUFFIX,githubcopilot.com,Copilot",
    "DOMAIN-SUFFIX,copilot.microsoft.com,Copilot",
    "DOMAIN,api.githubcopilot.com,Copilot",
    "DOMAIN,copilot-proxy.githubusercontent.com,Copilot"
];
  config.rules = [
    'GEOSITE,private,DIRECT',
    ...aiRules,
    'RULE-SET,OpenAI,ChatGPT', 'RULE-SET,Claude,Claude',
    'RULE-SET,Gemini,Gemini', 'RULE-SET,Copilot,Copilot',
    'GEOSITE,category-ai-!cn,其他AI',
    'RULE-SET,GoogleFCM,谷歌服务',
    'GEOIP,private,DIRECT,no-resolve',
    'AND,((DST-PORT,443),(NETWORK,UDP)),REJECT',
    'RULE-SET,AdvertisingLite,广告拦截',
    'GEOSITE,cn,DIRECT',
    'RULE-SET,StaticResources,静态资源',
    'DOMAIN-SUFFIX,truthsocial.com,Truth Social',
    'GEOSITE,category-cryptocurrency,加密货币', 'GEOSITE,category-finance,金融服务',
    'GEOSITE,bilibili,哔哩哔哩', 'GEOSITE,youtube,Youtube',
    'GEOSITE,telegram,Telegram', 'GEOIP,telegram,Telegram,no-resolve',
    'GEOSITE,github,Github', 'GEOSITE,netflix,Netflix', 'GEOIP,netflix,Netflix,no-resolve',
    'GEOSITE,spotify,Spotify', 'GEOSITE,tiktok,TikTok', 'GEOSITE,twitch,Twitch',
    'GEOSITE,twitter,Twitter', 'GEOSITE,bahamut,巴哈姆特',
    'GEOSITE,ehentai,E-Hentai', 'GEOSITE,pikpak,PikPak网盘',
    'RULE-SET,Weibo,新浪微博', 'RULE-SET,SogouInput,搜狗输入法',
    'GEOSITE,xbox,Xbox', 'GEOSITE,apple,苹果服务', 'GEOSITE,microsoft,微软服务',
    'GEOSITE,google,谷歌服务', 'RULE-SET,GFWList,选择代理',
    'GEOIP,cn,DIRECT,no-resolve', 'MATCH,Final',
  ];
  config.ipv6 = false;
  config.mode = 'rule';
  config['find-process-mode'] = 'off';
  config['log-level'] = 'warning';
  config['disable-keep-alive'] = true;
  config['tcp-concurrent'] = false;
  config['unified-delay'] = true;
  config.profile = { 'store-selected': true };
  config.sniffer = { enable: false };
  config['geodata-mode'] = true;
  config['geodata-loader'] = 'memconservative';
  config['geo-auto-update'] = true;
  config['geo-update-interval'] = 168;
  config['geox-url'] = {
    geosite: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geosite.dat',
    geoip: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/geoip.dat',
    mmdb: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/release/country.mmdb',
  };
  config.dns = {
    enable: true, ipv6: false, 'enhanced-mode': 'fake-ip',
    'use-system-hosts': false,
    'fake-ip-range': '198.18.0.1/16',
    'fake-ip-filter': ['*.lan', '*.local', 'localhost', '+.msftconnecttest.com', '+.msftncsi.com',
      'time.*.com', 'time.*.gov', 'ntp.*.com', '+.pool.ntp.org'],
    'default-nameserver': ['223.5.5.5', '119.29.29.29'],
    'proxy-server-nameserver': ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'],
    'direct-nameserver': ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'],
    'nameserver-policy': { 'geosite:cn,private': ['https://dns.alidns.com/dns-query', 'https://doh.pub/dns-query'] },
    nameserver: ['https://1.1.1.1/dns-query#选择代理', 'https://8.8.8.8/dns-query#选择代理'],
  };
  // This transform accepts a node snapshot only; never keep stale upstream providers.
  delete config['proxy-providers'];
  // FlClash controls VPN/TUN and listening ports on Android.
  for (const key of ['tun', 'external-controller', 'external-controller-tls', 'secret',
    'external-ui', 'external-ui-url', 'listeners', 'port', 'socks-port', 'redir-port',
    'tproxy-port', 'mixed-port', 'allow-lan', 'bind-address', 'authentication', 'hosts']) delete config[key];
  return config;
}
